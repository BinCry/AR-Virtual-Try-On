import { describe, expect, it } from 'vitest';
import { mapTorsoToGarment, mirrorX, PoseSmoother } from '../src';
describe('PoseSmoother', () => { it('applies EMA to noisy landmarks', () => { const smoother = new PoseSmoother(.5); smoother.smooth([{ x: 0, y: 0, z: 0 }]); expect(smoother.smooth([{ x: 1, y: 1, z: 1 }])[0]).toMatchObject({ x: .5, y: .5, z: .5 }); }); });
describe('coordinate mapping', () => { it('maps a valid torso and mirrors x', () => { const points = Array.from({ length: 33 }, () => ({ x: .5, y: .5, z: 0 })); points[11] = { x:.3,y:.3,z:0 }; points[12] = { x:.7,y:.3,z:0 }; points[23] = { x:.35,y:.7,z:0 }; points[24] = { x:.65,y:.7,z:0 }; expect(mapTorsoToGarment(points)).toMatchObject({ x:0, scaleX:expect.any(Number) }); expect(mirrorX(.2)).toBe(.8); }); });
describe('shoulder anchored garment mapping', () => {
  it('anchors the garment to shoulder midpoint rather than torso midpoint', () => {
    const points = Array.from({ length: 33 }, () => ({ x: .5, y: .5, z: 0 }));
    points[11] = { x: .3, y: .25, z: 0 }; points[12] = { x: .7, y: .25, z: 0 };
    points[23] = { x: .35, y: .75, z: 0 }; points[24] = { x: .65, y: .75, z: 0 };
    const transform = mapTorsoToGarment(points);
    expect(transform?.y).toBeCloseTo(.5); // world-space y for shoulder y=.25
    expect(transform?.scaleX).toBeGreaterThan(.9);
    expect(transform?.scaleY).toBeGreaterThan(.9);
  });
  it('keeps roll and yaw bounded during an unstable turn', () => {
    const points = Array.from({ length: 33 }, () => ({ x: .5, y: .5, z: 0 }));
    points[11] = { x: .3, y: .05, z: -.9 }; points[12] = { x: .7, y: .95, z: .9 };
    points[23] = { x: .35, y: .7, z: 0 }; points[24] = { x: .65, y: .7, z: 0 };
    const transform = mapTorsoToGarment(points);
    expect(Math.abs(transform?.rotationZ ?? 1)).toBeLessThanOrEqual(.34);
    expect(Math.abs(transform?.rotationY ?? 1)).toBeLessThanOrEqual(.72);
  });
  it('expands the torso envelope when hips are wider than shoulders', () => {
    const points = Array.from({ length: 33 }, () => ({ x: .5, y: .5, z: 0 }));
    points[11] = { x: .42, y: .3, z: 0 }; points[12] = { x: .58, y: .3, z: 0 };
    points[23] = { x: .2, y: .72, z: 0 }; points[24] = { x: .8, y: .72, z: 0 };
    expect(mapTorsoToGarment(points)?.scaleX).toBeGreaterThan(1.5);
  });
});
describe('cover mapping', () => { it('compensates for a 16:9 video cropped into a 4:5 viewport', () => { const points = Array.from({ length: 33 }, () => ({ x: .5, y: .5, z: 0 })); points[11] = { x:.2,y:.3,z:0 }; points[12] = { x:.8,y:.3,z:0 }; points[23] = { x:.25,y:.7,z:0 }; points[24] = { x:.75,y:.7,z:0 }; const transform = mapTorsoToGarment(points, { videoWidth: 1600, videoHeight: 900, viewportWidth: 800, viewportHeight: 1000 }); expect(transform?.x).toBeCloseTo(0); expect(transform?.scaleX).toBeGreaterThan(.2); }); });

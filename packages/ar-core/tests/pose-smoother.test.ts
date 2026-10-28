import { describe, expect, it } from 'vitest';
import { mapTorsoToGarment, mirrorX, PoseSmoother } from '../src';
describe('PoseSmoother', () => { it('applies EMA to noisy landmarks', () => { const smoother = new PoseSmoother(.5); smoother.smooth([{ x: 0, y: 0, z: 0 }]); expect(smoother.smooth([{ x: 1, y: 1, z: 1 }])[0]).toMatchObject({ x: .5, y: .5, z: .5 }); }); });
describe('coordinate mapping', () => { it('maps a valid torso and mirrors x', () => { const points = Array.from({ length: 33 }, () => ({ x: .5, y: .5, z: 0 })); points[11] = { x:.3,y:.3,z:0 }; points[12] = { x:.7,y:.3,z:0 }; points[23] = { x:.35,y:.7,z:0 }; points[24] = { x:.65,y:.7,z:0 }; expect(mapTorsoToGarment(points)).toMatchObject({ x:0, scaleX:expect.any(Number) }); expect(mirrorX(.2)).toBe(.8); }); });

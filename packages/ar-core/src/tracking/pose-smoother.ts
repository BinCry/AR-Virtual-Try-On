import type { Landmark } from '../types';
export class PoseSmoother {
  private previous?: Landmark[];
  constructor(private readonly alpha = 0.35) { if (alpha <= 0 || alpha > 1) throw new Error('alpha phải trong khoảng (0, 1].'); }
  reset(): void { this.previous = undefined; }
  smooth(input: Landmark[]): Landmark[] {
    if (!this.previous || this.previous.length !== input.length) return (this.previous = input.map((point) => ({ ...point })));
    const result = input.map((point, index) => {
      const old = this.previous![index];
      return { x: old.x + this.alpha * (point.x - old.x), y: old.y + this.alpha * (point.y - old.y), z: old.z + this.alpha * (point.z - old.z), visibility: point.visibility };
    });
    this.previous = result;
    return result;
  }
}

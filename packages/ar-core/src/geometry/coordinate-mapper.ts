import type { GarmentTransform, Landmark } from '../types';
const distance = (a: Landmark, b: Landmark) => Math.hypot(a.x - b.x, a.y - b.y);
export function mapTorsoToGarment(landmarks: Landmark[]): GarmentTransform | undefined {
  const [leftShoulder, rightShoulder, leftHip, rightHip] = [landmarks[11], landmarks[12], landmarks[23], landmarks[24]];
  if (![leftShoulder, rightShoulder, leftHip, rightHip].every(Boolean)) return undefined;
  const shoulderWidth = distance(leftShoulder, rightShoulder); const torsoHeight = Math.max(distance(leftShoulder, leftHip), distance(rightShoulder, rightHip));
  const shoulderCenter = { x: (leftShoulder.x + rightShoulder.x) / 2, y: (leftShoulder.y + rightShoulder.y) / 2 };
  const hipCenter = { x: (leftHip.x + rightHip.x) / 2, y: (leftHip.y + rightHip.y) / 2 };
  return { x: (shoulderCenter.x - 0.5) * 2, y: (0.5 - (shoulderCenter.y + hipCenter.y) / 2) * 2, z: -1.2, scaleX: Math.max(0.2, shoulderWidth * 2.65), scaleY: Math.max(0.25, torsoHeight * 2.4), rotationZ: Math.atan2(rightShoulder.y - leftShoulder.y, rightShoulder.x - leftShoulder.x) };
}
export function mirrorX(x: number): number { return 1 - x; }

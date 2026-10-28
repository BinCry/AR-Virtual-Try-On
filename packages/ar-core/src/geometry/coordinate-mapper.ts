import type { GarmentTransform, Landmark } from '../types';
export type CoverViewport = { videoWidth: number; videoHeight: number; viewportWidth: number; viewportHeight: number };
const distance = (a: Landmark, b: Landmark) => Math.hypot(a.x - b.x, a.y - b.y);
function coverPoint(point: Landmark, viewport: CoverViewport): Landmark { const scale = Math.max(viewport.viewportWidth / viewport.videoWidth, viewport.viewportHeight / viewport.videoHeight); const width = viewport.videoWidth * scale; const height = viewport.videoHeight * scale; return { ...point, x: (point.x * width + (viewport.viewportWidth - width) / 2) / viewport.viewportWidth, y: (point.y * height + (viewport.viewportHeight - height) / 2) / viewport.viewportHeight }; }
export function mapTorsoToGarment(landmarks: Landmark[], viewport?: CoverViewport): GarmentTransform | undefined {
  if (viewport && (!viewport.videoWidth || !viewport.videoHeight || !viewport.viewportWidth || !viewport.viewportHeight)) return undefined;
  const visible = viewport ? landmarks.map((point) => coverPoint(point, viewport)) : landmarks;
  const [leftShoulder, rightShoulder, leftHip, rightHip] = [visible[11], visible[12], visible[23], visible[24]];
  if (![leftShoulder, rightShoulder, leftHip, rightHip].every(Boolean)) return undefined;
  const shoulderWidth = distance(leftShoulder, rightShoulder); const torsoHeight = Math.max(distance(leftShoulder, leftHip), distance(rightShoulder, rightHip));
  const shoulderCenter = { x: (leftShoulder.x + rightShoulder.x) / 2, y: (leftShoulder.y + rightShoulder.y) / 2 };
  const hipCenter = { x: (leftHip.x + rightHip.x) / 2, y: (leftHip.y + rightHip.y) / 2 };
  return { x: (shoulderCenter.x - 0.5) * 2, y: (0.5 - (shoulderCenter.y + hipCenter.y) / 2) * 2, z: -1.2, scaleX: Math.max(0.2, shoulderWidth * 2.65), scaleY: Math.max(0.25, torsoHeight * 2.4), rotationZ: Math.atan2(rightShoulder.y - leftShoulder.y, rightShoulder.x - leftShoulder.x) };
}
export function mirrorX(x: number): number { return 1 - x; }

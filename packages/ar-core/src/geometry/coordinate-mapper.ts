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
  const roll = Math.atan2(rightShoulder.y - leftShoulder.y, rightShoulder.x - leftShoulder.x);
  const depthDelta = (rightShoulder.z ?? 0) - (leftShoulder.z ?? 0);
  // Keep screen roll gentle: large values are almost always an unstable 2D
  // landmark during a turn and used to make the entire garment slant away.
  const rotationZ = Math.max(-.34, Math.min(.34, roll));
  // MediaPipe's relative Z gives a useful, cheap torso yaw estimate. It is
  // deliberately bounded so the garment narrows on turns but never vanishes.
  const rotationY = Math.max(-.72, Math.min(.72, Math.atan2(depthDelta, Math.max(.04, shoulderWidth))));
  return { x: (shoulderCenter.x - 0.5) * 2, y: (0.5 - (shoulderCenter.y + hipCenter.y) / 2) * 2, z: -1.2, scaleX: Math.max(0.2, shoulderWidth * 2.28), scaleY: Math.max(0.25, torsoHeight * 1.9), rotationZ, rotationY };
}
export function mirrorX(x: number): number { return 1 - x; }

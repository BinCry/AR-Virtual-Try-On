import type { GarmentTransform, Landmark, SegmentationMask } from '../types';
export type CoverViewport = { videoWidth: number; videoHeight: number; viewportWidth: number; viewportHeight: number };
export type TorsoContour = { waistWidth: number; hipWidth: number };
const distance = (a: Landmark, b: Landmark) => Math.hypot(a.x - b.x, a.y - b.y);
function coverPoint(point: Landmark, viewport: CoverViewport): Landmark { const scale = Math.max(viewport.viewportWidth / viewport.videoWidth, viewport.viewportHeight / viewport.videoHeight); const width = viewport.videoWidth * scale; const height = viewport.videoHeight * scale; return { ...point, x: (point.x * width + (viewport.viewportWidth - width) / 2) / viewport.viewportWidth, y: (point.y * height + (viewport.viewportHeight - height) / 2) / viewport.viewportHeight }; }
export function measureTorsoContour(landmarks: Landmark[], segmentation?: SegmentationMask): TorsoContour | undefined {
  const [leftShoulder, rightShoulder, leftHip, rightHip] = [landmarks[11], landmarks[12], landmarks[23], landmarks[24]];
  if (!segmentation || ![leftShoulder, rightShoulder, leftHip, rightHip].every(Boolean)) return undefined;
  const centerX = (leftShoulder.x + rightShoulder.x + leftHip.x + rightHip.x) / 4;
  const shoulderY = (leftShoulder.y + rightShoulder.y) / 2; const hipY = (leftHip.y + rightHip.y) / 2;
  const widthAt = (progress: number) => { const y = Math.max(0, Math.min(segmentation.height - 1, Math.round((shoulderY + (hipY - shoulderY) * progress) * segmentation.height))); const center = Math.max(0, Math.min(segmentation.width - 1, Math.round(centerX * segmentation.width))); let left = center; let right = center; while (left > 0 && segmentation.data[y * segmentation.width + left] > 110) left -= 1; while (right < segmentation.width - 1 && segmentation.data[y * segmentation.width + right] > 110) right += 1; return (right - left) / segmentation.width; };
  const waistWidth = widthAt(.56); const hipWidth = widthAt(.9);
  return waistWidth > .04 && hipWidth > .04 ? { waistWidth, hipWidth } : undefined;
}
export function mapTorsoToGarment(landmarks: Landmark[], viewport?: CoverViewport, contour?: TorsoContour): GarmentTransform | undefined {
  if (viewport && (!viewport.videoWidth || !viewport.videoHeight || !viewport.viewportWidth || !viewport.viewportHeight)) return undefined;
  const visible = viewport ? landmarks.map((point) => coverPoint(point, viewport)) : landmarks;
  const [leftShoulder, rightShoulder, leftHip, rightHip] = [visible[11], visible[12], visible[23], visible[24]];
  if (![leftShoulder, rightShoulder, leftHip, rightHip].every(Boolean)) return undefined;
  const shoulderWidth = distance(leftShoulder, rightShoulder); const hipWidth = distance(leftHip, rightHip); const torsoHeight = (distance(leftShoulder, leftHip) + distance(rightShoulder, rightHip)) / 2;
  const shoulderCenter = { x: (leftShoulder.x + rightShoulder.x) / 2, y: (leftShoulder.y + rightShoulder.y) / 2 };
  const roll = Math.atan2(rightShoulder.y - leftShoulder.y, rightShoulder.x - leftShoulder.x);
  const depthDelta = (rightShoulder.z ?? 0) - (leftShoulder.z ?? 0);
  // Keep screen roll gentle: large values are almost always an unstable 2D
  // landmark during a turn and used to make the entire garment slant away.
  const rotationZ = Math.max(-.34, Math.min(.34, roll));
  // MediaPipe's relative Z gives a useful, cheap torso yaw estimate. It is
  // deliberately bounded so the garment narrows on turns but never vanishes.
  const rotationY = Math.max(-.72, Math.min(.72, Math.atan2(depthDelta, Math.max(.04, shoulderWidth))));
  // The renderer's origin is the shoulder midpoint. This makes rotation happen
  // around the garment's actual hanging point rather than around its visual
  // centre, which is essential when the wearer turns or leans.
  const shoulderGarmentWidth = shoulderWidth * 1.45;
  const hipGarmentWidth = (contour?.hipWidth ?? hipWidth) * 1.3;
  // Overall scale is fixed to the shoulder anchor.  The renderer independently
  // widens/narrows lower vertices, so a wide hip no longer makes the neckline
  // float away from the shoulders.
  const hipWidthRatio = Math.max(.76, Math.min(1.42, hipGarmentWidth / Math.max(.04, shoulderGarmentWidth)));
  const waistWidthRatio = Math.max(.7, Math.min(1.28, ((contour?.waistWidth ?? shoulderWidth * .9) * 1.24) / Math.max(.04, shoulderGarmentWidth)));
  return { x: (shoulderCenter.x - 0.5) * 2, y: (0.5 - shoulderCenter.y) * 2, z: -1.2, scaleX: Math.max(.22, shoulderGarmentWidth * 2), scaleY: Math.max(.22, torsoHeight * 2 * 1.12), waistWidthRatio, hipWidthRatio, rotationZ, rotationY };
}
export function mirrorX(x: number): number { return 1 - x; }

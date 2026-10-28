import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';
import type { Landmark, PoseFrame, TrackingStatus } from '../types';
import { PoseSmoother } from './pose-smoother';

export interface PoseTracker { initialize(): Promise<void>; detect(video: HTMLVideoElement, timestampMs: number): PoseFrame | undefined; dispose(): void; }
export class MediaPipePoseTracker implements PoseTracker {
  private landmarker?: PoseLandmarker;
  private lastVideoTime = -1;
  private readonly smoother = new PoseSmoother();
  constructor(private readonly modelUrl = 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task') {}
  async initialize(): Promise<void> {
    const vision = await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.32/wasm');
    this.landmarker = await PoseLandmarker.createFromOptions(vision, { baseOptions: { modelAssetPath: this.modelUrl, delegate: 'GPU' }, runningMode: 'VIDEO', numPoses: 1, minPoseDetectionConfidence: 0.55, minTrackingConfidence: 0.55 });
  }
  detect(video: HTMLVideoElement, timestampMs: number): PoseFrame | undefined {
    if (!this.landmarker || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || video.currentTime === this.lastVideoTime) return undefined;
    this.lastVideoTime = video.currentTime;
    const started = performance.now(); const result = this.landmarker.detectForVideo(video, timestampMs); const landmarks = result.landmarks[0];
    if (!landmarks) return undefined;
    return { landmarks: this.smoother.smooth(landmarks.map((point): Landmark => ({ x: point.x, y: point.y, z: point.z, visibility: point.visibility }))), timestampMs, inferenceMs: performance.now() - started };
  }
  dispose(): void { this.landmarker?.close(); this.landmarker = undefined; this.smoother.reset(); }
}
export function getTrackingStatus(frame?: PoseFrame): TrackingStatus {
  if (!frame) return { tracked: false, reason: 'no-person', inferenceMs: 0 };
  const keyPoints = [11, 12, 23, 24].map((index) => frame.landmarks[index]);
  return keyPoints.every((point) => (point?.visibility ?? 0) >= 0.45) ? { tracked: true, inferenceMs: frame.inferenceMs } : { tracked: false, reason: 'low-confidence', inferenceMs: frame.inferenceMs };
}

import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';
import type { Landmark, PoseFrame, TrackingStatus } from '../types';
import { PoseSmoother } from './pose-smoother';

export interface PoseTracker { initialize(): Promise<void>; detect(video: HTMLVideoElement, timestampMs: number): PoseFrame | undefined; dispose(): void; }
export class MediaPipePoseTracker implements PoseTracker {
  private landmarker?: PoseLandmarker;
  private lastVideoTime = -1;
  private readonly smoother = new PoseSmoother();
  private delegate: 'gpu' | 'cpu' = 'gpu';
  constructor(private readonly modelUrl = new URL('models/pose_landmarker_lite.task', document.baseURI).toString(), private readonly wasmRoot = new URL('models/wasm', document.baseURI).toString()) {}
  get activeDelegate(): 'gpu' | 'cpu' { return this.delegate; }
  async initialize(): Promise<void> {
    const vision = await FilesetResolver.forVisionTasks(this.wasmRoot);
    const options = { runningMode: 'VIDEO' as const, numPoses: 1, minPoseDetectionConfidence: 0.55, minTrackingConfidence: 0.55 };
    try { this.landmarker = await PoseLandmarker.createFromOptions(vision, { ...options, baseOptions: { modelAssetPath: this.modelUrl, delegate: 'GPU' } }); this.delegate = 'gpu'; }
    catch { this.landmarker = await PoseLandmarker.createFromOptions(vision, { ...options, baseOptions: { modelAssetPath: this.modelUrl, delegate: 'CPU' } }); this.delegate = 'cpu'; }
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

import { CameraManager } from '../camera/camera-manager';
import { mapTorsoToGarment } from '../geometry/coordinate-mapper';
import { GarmentRenderer } from '../rendering/garment-renderer';
import { getTrackingStatus, MediaPipePoseTracker } from '../tracking/pose-tracker';
import type { GarmentDefinition, SessionEvent, SessionState } from '../types';
export class ArSession {
  private readonly camera = new CameraManager(); private readonly tracker = new MediaPipePoseTracker(); private state: SessionState = 'idle'; private frameId?: number; private listeners = new Set<(event: SessionEvent) => void>();
  constructor(private readonly video: HTMLVideoElement, private readonly renderer: GarmentRenderer) {}
  on(listener: (event: SessionEvent) => void): () => void { this.listeners.add(listener); return () => this.listeners.delete(listener); }
  private emit(event: SessionEvent): void { this.listeners.forEach((listener) => listener(event)); }
  private setState(state: SessionState): void { this.state = state; this.emit({ type: 'state', state }); }
  async start(): Promise<void> { if (this.state === 'running' || this.state === 'starting') return; this.setState('starting'); try { await this.camera.start(this.video); await this.tracker.initialize(); this.setState('running'); this.loop(); } catch (cause) { const error = cause instanceof Error ? cause : new Error('Không thể khởi động AR.'); this.setState('error'); this.emit({ type: 'error', error }); this.stop(); throw error; } }
  setGarment(garment: GarmentDefinition): void { this.renderer.setGarment(garment); }
  private loop = (): void => { const frame = this.tracker.detect(this.video, performance.now()); const status = getTrackingStatus(frame); this.emit({ type: 'tracking', status }); this.renderer.resize(this.video.clientWidth, this.video.clientHeight); this.renderer.update(status.tracked && frame ? mapTorsoToGarment(frame.landmarks) : undefined); this.frameId = requestAnimationFrame(this.loop); };
  stop(): void { if (this.frameId) cancelAnimationFrame(this.frameId); this.frameId = undefined; this.tracker.dispose(); this.camera.stop(this.video); if (this.state !== 'idle') this.setState('idle'); }
  dispose(): void { this.stop(); this.renderer.dispose(); this.listeners.clear(); }
}

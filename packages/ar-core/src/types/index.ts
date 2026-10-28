export type SessionState = 'idle' | 'starting' | 'running' | 'stopping' | 'error';
export type Landmark = { x: number; y: number; z: number; visibility?: number };
export type PoseFrame = { landmarks: Landmark[]; timestampMs: number; inferenceMs: number };
export type TrackingStatus = { tracked: boolean; reason?: 'no-person' | 'low-confidence'; inferenceMs: number };
export type GarmentId = 'blazer' | 'vest' | 'tunic';
export type GarmentDefinition = { id: GarmentId; label: string; color: string; accent: string };
export type GarmentTransform = { x: number; y: number; z: number; scaleX: number; scaleY: number; rotationZ: number };
export type SessionEvent = { type: 'state' | 'tracking' | 'error'; state?: SessionState; status?: TrackingStatus; error?: Error };

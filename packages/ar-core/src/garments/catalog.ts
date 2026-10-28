import type { GarmentDefinition } from '../types';
export const GARMENTS: GarmentDefinition[] = [
  { id: 'studio-blazer', label: 'Studio Blazer GLB', color: '#263752', accent: '#d9a441', modelUrl: 'assets/garments/studio-blazer.glb', license: 'internal-demo', kind: 'rigged-glb', rig: { requiredBones: ['Hips', 'Spine', 'LeftUpperArm', 'RightUpperArm'], torso: 'Spine', leftUpperArm: 'LeftUpperArm', rightUpperArm: 'RightUpperArm' } },
  { id: 'blazer', label: 'Blazer Midnight', color: '#263752', accent: '#d9a441', license: 'internal-demo', kind: 'procedural' },
  { id: 'vest', label: 'Gilet Bordeaux', color: '#6f2d3c', accent: '#f4d38a', license: 'internal-demo', kind: 'procedural' },
  { id: 'tunic', label: 'Tunic Emerald', color: '#15594d', accent: '#d3e7d2', license: 'internal-demo', kind: 'procedural' },
];

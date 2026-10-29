import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import type { GarmentDefinition, GarmentTransform } from '../types';

export type LoadedGarment = { rigged: boolean; validRig: boolean };
const panel = (points: Array<[number, number]>, material: THREE.Material, depth = .07): THREE.Mesh => {
  const shape = new THREE.Shape(); shape.moveTo(...points[0]); points.slice(1).forEach((point) => shape.lineTo(...point)); shape.closePath();
  return new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: true, bevelThickness: .018, bevelSize: .018, bevelSegments: 2 }), material);
};
export class GarmentRenderer {
  private readonly scene = new THREE.Scene(); private readonly camera = new THREE.OrthographicCamera(-1, 1, 1, -1, .1, 10); private readonly renderer: THREE.WebGLRenderer; private garment?: THREE.Group; private loadVersion = 0; private rig?: GarmentDefinition['rig']; private bones = new Map<string, THREE.Bone>(); private readonly boneRest = new Map<string, THREE.Quaternion>(); private readonly boneRestWorld = new Map<string, THREE.Quaternion>(); private readonly boneRestDirection = new Map<string, THREE.Vector3>(); private readonly torsoDeformations = new Map<THREE.BufferAttribute, { original: Float32Array; centerX: number; top: number; bottom: number; ratio: number }>(); private leftSleeve?: THREE.Group; private rightSleeve?: THREE.Group; private displayed?: GarmentTransform; private normalizedHeight = 1;
  constructor(private readonly canvas: HTMLCanvasElement) { this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, premultipliedAlpha: false, preserveDrawingBuffer: true }); this.renderer.setClearColor(0x000000, 0); this.renderer.outputColorSpace = THREE.SRGBColorSpace; this.renderer.toneMapping = THREE.ACESFilmicToneMapping; this.renderer.toneMappingExposure = 1.2; this.camera.position.z = 2; this.scene.add(new THREE.HemisphereLight(0xffffff, 0x24354b, 3.2), new THREE.AmbientLight(0xffffff, .55)); const key = new THREE.DirectionalLight(0xffffff, 3.2); key.position.set(-2, 3, 4); this.scene.add(key); }
  resize(width: number, height: number): void { const dpr = Math.min(window.devicePixelRatio || 1, 2); this.renderer.setPixelRatio(dpr); this.renderer.setSize(width, height, false); }
  private releaseGarment(): void { this.garment?.traverse((node) => { if (node instanceof THREE.Mesh) { node.geometry.dispose(); (Array.isArray(node.material) ? node.material : [node.material]).forEach((material) => material.dispose()); } }); this.garment?.removeFromParent(); this.garment = undefined; this.rig = undefined; this.bones.clear(); this.boneRest.clear(); this.boneRestWorld.clear(); this.boneRestDirection.clear(); this.torsoDeformations.clear(); this.leftSleeve = undefined; this.rightSleeve = undefined; this.displayed = undefined; this.normalizedHeight = 1; }
  private makeSleeve(side: -1 | 1, fabric: THREE.Material): THREE.Group { const sleeve = new THREE.Group(); const shape = panel([[-.18,.4],[.18,.4],[.24,-.52],[-.22,-.52]], fabric); shape.position.z = .02; sleeve.add(shape); sleeve.position.set(side * .67, .22, 0); sleeve.rotation.z = side * -.18; return sleeve; }
  private makeProcedural(definition: GarmentDefinition): THREE.Group {
    const group = new THREE.Group(); const fabric = new THREE.MeshPhysicalMaterial({ color: definition.color, roughness: .48, metalness: .02, clearcoat: .08, side: THREE.DoubleSide }); const accent = new THREE.MeshPhysicalMaterial({ color: definition.accent, roughness: .3, metalness: .15, side: THREE.DoubleSide }); const dark = new THREE.MeshStandardMaterial({ color: '#16202e', roughness: .55, side: THREE.DoubleSide });
    const long = definition.id === 'tunic'; const vest = definition.id === 'vest'; const bottom = long ? -.98 : -.72; const body = panel([[-.56,.66],[-.28,.78],[.28,.78],[.56,.66],[.48,bottom],[-.48,bottom]], fabric); body.position.z = .01; group.add(body);
    if (!vest) { this.leftSleeve = this.makeSleeve(-1, fabric); this.rightSleeve = this.makeSleeve(1, fabric); group.add(this.leftSleeve, this.rightSleeve); }
    if (definition.id === 'blazer' || definition.id === 'studio-blazer') { const leftLapel = panel([[-.28,.74],[-.04,.45],[-.24,.1],[-.4,.63]], accent, .04); const rightLapel = panel([[.28,.74],[.04,.45],[.24,.1],[.4,.63]], accent, .04); leftLapel.position.z = .1; rightLapel.position.z = .1; group.add(leftLapel, rightLapel); [-.05,-.28].forEach((y) => { const button = new THREE.Mesh(new THREE.SphereGeometry(.045, 12, 8), accent); button.position.set(.08, y, .15); group.add(button); }); }
    if (vest) { const trim = new THREE.Mesh(new THREE.TorusGeometry(.22,.025,8,18,Math.PI), accent); trim.rotation.z = Math.PI; trim.position.set(0,.61,.1); const seam = new THREE.Mesh(new THREE.BoxGeometry(.025,1.08,.04), accent); seam.position.set(0,-.03,.1); group.add(trim,seam); }
    if (long) { const belt = new THREE.Mesh(new THREE.BoxGeometry(.92,.09,.1), accent); belt.position.set(0,-.18,.11); const pendant = new THREE.Mesh(new THREE.CircleGeometry(.06,16), dark); pendant.position.set(0,-.18,.17); group.add(belt,pendant); }
    const collar = new THREE.Mesh(new THREE.TorusGeometry(.24,.045,8,22,Math.PI), accent); collar.rotation.z = Math.PI; collar.position.set(0,.63,.1); group.add(collar); return group;
  }
  private applyPalette(model: THREE.Object3D, definition: GarmentDefinition): void {
    const fabric = new THREE.Color(definition.color);
    model.traverse((node) => {
      if (!(node instanceof THREE.Mesh)) return;
      (Array.isArray(node.material) ? node.material : [node.material]).forEach((material) => {
        if (!(material instanceof THREE.MeshStandardMaterial)) return;
        // Source demo garments are deliberately neutral.  Tinting preserves
        // their texture/normal maps while giving each catalog item a distinct,
        // readable garment colour under a real camera feed.
        material.color.lerp(fabric, .82); material.roughness = Math.max(.28, Math.min(.72, material.roughness || .5)); material.metalness = Math.min(.12, material.metalness); material.needsUpdate = true;
      });
    });
  }
  private inspectRig(root: THREE.Object3D, definition: GarmentDefinition): LoadedGarment { const names = new Set<string>(); let rigged = false; root.updateMatrixWorld(true); root.traverse((node) => { if (node instanceof THREE.SkinnedMesh) rigged = true; if (node instanceof THREE.Bone) { names.add(node.name); this.bones.set(node.name,node); this.boneRest.set(node.name, node.quaternion.clone()); this.boneRestWorld.set(node.name, node.getWorldQuaternion(new THREE.Quaternion())); const child = node.children.find((item): item is THREE.Bone => item instanceof THREE.Bone); if (child) { const start = node.getWorldPosition(new THREE.Vector3()); const end = child.getWorldPosition(new THREE.Vector3()); this.boneRestDirection.set(node.name, end.sub(start).normalize()); } } }); const validRig = rigged && (definition.rig?.requiredBones.every((bone) => names.has(bone)) ?? false); this.rig = validRig ? definition.rig : undefined; return { rigged, validRig }; }
  retarget(landmarks: { x: number; y: number; z?: number; visibility?: number }[]): void {
    const rotateRigged = (name: string | undefined, from: number, to: number) => {
      const target = name ? this.bones.get(name) : undefined; const a = landmarks[from]; const b = landmarks[to]; const rest = name ? this.boneRest.get(name) : undefined; const restWorld = name ? this.boneRestWorld.get(name) : undefined; const restDirection = name ? this.boneRestDirection.get(name) : undefined;
      if (!target || !a || !b || !rest || !restWorld || !restDirection || (a.visibility ?? 1) < .45 || (b.visibility ?? 1) < .45) return;
      // MediaPipe is in camera space.  Calculate the desired bone orientation in
      // world space, then convert it back into the bone's current parent space.
      // Applying a world-space quaternion directly to a local bone was the cause
      // of sleeves shearing away from the torso when the wearer turned.
      const poseDirection = new THREE.Vector3(b.x-a.x, -(b.y-a.y), -((b.z ?? 0)-(a.z ?? 0)) * .35);
      if (poseDirection.lengthSq() < .0001) return;
      poseDirection.normalize();
      const garmentWorld = this.garment?.getWorldQuaternion(new THREE.Quaternion()) ?? new THREE.Quaternion();
      const desiredWorldDirection = poseDirection.applyQuaternion(garmentWorld);
      const delta = new THREE.Quaternion().setFromUnitVectors(restDirection, desiredWorldDirection);
      const desiredWorld = delta.multiply(restWorld.clone());
      const parentWorld = target.parent?.getWorldQuaternion(new THREE.Quaternion()) ?? new THREE.Quaternion();
      const goal = parentWorld.invert().multiply(desiredWorld).normalize();
      // A conservative gate avoids invalid/depth-noisy frames twisting a sleeve
      // through the body.  The next confident frame smoothly catches up.
      const angularLimit = name?.includes('upperarm') ? 1.72 : 1.4;
      if (goal.angleTo(rest) > angularLimit) { target.quaternion.slerp(rest, .2); return; }
      target.quaternion.slerp(goal, .18);
    };
    const rotateSleeve = (target: THREE.Object3D | undefined, shoulder: number, elbow: number, direction: number) => { const a = landmarks[shoulder]; const b = landmarks[elbow]; if (!target || !a || !b) return; const angle = Math.max(-1.08, Math.min(1.08, Math.atan2(b.y-a.y,b.x-a.x) - Math.PI / 2)); target.rotation.z += (angle * direction-target.rotation.z)*.16; };
    if (this.rig) { rotateRigged(this.rig.leftUpperArm,11,13); rotateRigged(this.rig.rightUpperArm,12,14); this.garment?.updateMatrixWorld(true); rotateRigged(this.rig.leftForearm,13,15); rotateRigged(this.rig.rightForearm,14,16); } else { rotateSleeve(this.leftSleeve,11,13,1); rotateSleeve(this.rightSleeve,12,14,-1); }
  }
  private prepareTorsoDeformation(model: THREE.Object3D): void {
    model.traverse((node) => {
      if (!(node instanceof THREE.SkinnedMesh)) return;
      const position = node.geometry.getAttribute('position');
      if (!(position instanceof THREE.BufferAttribute)) return;
      const box = node.geometry.boundingBox ?? (node.geometry.computeBoundingBox(), node.geometry.boundingBox);
      if (!box) return;
      this.torsoDeformations.set(position, { original: new Float32Array(position.array), centerX: (box.min.x + box.max.x) / 2, top: box.max.y, bottom: box.min.y, ratio: 1 });
    });
  }
  private deformTorso(waistWidthRatio: number, hipWidthRatio: number): void {
    const ratio = Math.max(.76, Math.min(1.42, hipWidthRatio));
    this.torsoDeformations.forEach((entry, position) => {
      if (Math.abs(entry.ratio - ratio) < .006) return;
      const range = Math.max(.001, entry.top - entry.bottom); const values = position.array as Float32Array;
      for (let index = 0; index < position.count; index += 1) {
        const offset = index * 3; const y = entry.original[offset + 1];
        // Only the lower torso progressively follows hip width.  The collar and
        // shoulders remain anchored, preventing the neckline from drifting.
        const lower = Math.max(0, Math.min(1, ((entry.top - y) / range - .18) / .72));
        const waist = Math.max(.7, Math.min(1.28, waistWidthRatio)); const scale = lower < .56 ? 1 + (waist - 1) * (lower / .56) : waist + (ratio - waist) * ((lower - .56) / .44);
        values[offset] = entry.centerX + (entry.original[offset] - entry.centerX) * scale;
        values[offset + 1] = y; values[offset + 2] = entry.original[offset + 2];
      }
      position.needsUpdate = true; entry.ratio = ratio;
    });
  }
  private normalizeModel(model: THREE.Group): THREE.Group {
    model.traverse((node) => {
      if (!(node instanceof THREE.Mesh)) return;
      node.frustumCulled = false;
      (Array.isArray(node.material) ? node.material : [node.material]).forEach((material) => { material.side = THREE.DoubleSide; material.needsUpdate = true; });
    });
    const initialBounds = new THREE.Box3().setFromObject(model); const initialSize = initialBounds.getSize(new THREE.Vector3());
    if (!Number.isFinite(initialSize.x) || initialSize.x < .0001) throw new Error('Garment mesh has no measurable width.');
    // A nested container preserves this normalization while the outer group is
    // continuously scaled by MediaPipe shoulder/torso measurements.
    model.scale.setScalar(1 / initialSize.x);
    const bounds = new THREE.Box3().setFromObject(model); const center = bounds.getCenter(new THREE.Vector3());
    model.position.x -= center.x;
    // Shoulder midpoint is the parent origin; the garment hangs down from it.
    model.position.y -= bounds.max.y;
    this.normalizedHeight = Math.max(.01, bounds.max.y - bounds.min.y);
    this.prepareTorsoDeformation(model);
    const anchor = new THREE.Group(); anchor.add(model); return anchor;
  }
  async setGarment(definition: GarmentDefinition): Promise<LoadedGarment> { const version = ++this.loadVersion; this.releaseGarment(); if (!definition.modelUrl) { this.garment = this.makeProcedural(definition); this.scene.add(this.garment); return { rigged: false, validRig: false }; } try { const gltf = await new GLTFLoader().loadAsync(new URL(definition.modelUrl, document.baseURI).toString()); if (version !== this.loadVersion) return { rigged:false,validRig:false }; this.applyPalette(gltf.scene, definition); const result = this.inspectRig(gltf.scene, definition); this.garment = this.normalizeModel(gltf.scene); this.garment.userData.garmentId = definition.id; this.scene.add(this.garment); return result; } catch { if (version !== this.loadVersion) return { rigged:false,validRig:false }; this.garment = this.makeProcedural(definition); this.scene.add(this.garment); return { rigged:false,validRig:false }; } }
  update(transform?: GarmentTransform): void {
    if (this.garment && transform) {
      const previous = this.displayed ?? transform; const smoothing = .2;
      this.displayed = { x: previous.x + (transform.x-previous.x)*smoothing, y: previous.y + (transform.y-previous.y)*smoothing, z: transform.z, scaleX: previous.scaleX + (transform.scaleX-previous.scaleX)*smoothing, scaleY: previous.scaleY + (transform.scaleY-previous.scaleY)*smoothing, waistWidthRatio: (previous.waistWidthRatio ?? 1) + ((transform.waistWidthRatio ?? 1)-(previous.waistWidthRatio ?? 1))*smoothing, hipWidthRatio: (previous.hipWidthRatio ?? 1) + ((transform.hipWidthRatio ?? 1)-(previous.hipWidthRatio ?? 1))*smoothing, rotationZ: previous.rotationZ + (transform.rotationZ-previous.rotationZ)*smoothing, rotationY: previous.rotationY + (transform.rotationY-previous.rotationY)*smoothing };
      const stable = this.displayed; const coverage = this.rig?.torso ? (this.garment.userData.garmentId === 'tunic' ? 2.05 : 1.08) : 1;
      this.deformTorso(stable.waistWidthRatio ?? 1, stable.hipWidthRatio ?? 1);
      this.garment.position.set(stable.x, stable.y, stable.z); this.garment.scale.set(stable.scaleX, stable.scaleY * coverage / this.normalizedHeight, Math.max(.62, Math.cos(stable.rotationY))); this.garment.rotation.set(0, stable.rotationY, -stable.rotationZ); this.garment.visible = true;
    } else if (this.garment) { this.garment.visible = false; this.displayed = undefined; }
    this.renderer.render(this.scene, this.camera);
  }
  dispose(): void { ++this.loadVersion; this.releaseGarment(); this.renderer.dispose(); }
}

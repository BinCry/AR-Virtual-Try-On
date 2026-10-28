import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { writeFile } from 'node:fs/promises';
globalThis.FileReader = class FileReader {
  result = null; onloadend = null;
  readAsArrayBuffer(blob) { blob.arrayBuffer().then((buffer) => { this.result = buffer; this.onloadend?.(); }); }
};
const garment = new THREE.Group(); garment.name = 'StudioBlazer';
const fabric = new THREE.MeshStandardMaterial({ color: '#263752', roughness: .74, metalness: .03 }); const trim = new THREE.MeshStandardMaterial({ color: '#d9a441', roughness: .42 });
const geometry = new THREE.BoxGeometry(1, 1.45, .12, 2, 4, 1); const count = geometry.attributes.position.count; geometry.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(Array.from({ length: count * 4 }, (_, i) => i % 4 ? 0 : 0), 4)); geometry.setAttribute('skinWeight', new THREE.Float32BufferAttribute(Array.from({ length: count * 4 }, (_, i) => i % 4 ? 0 : 1), 4));
const body = new THREE.SkinnedMesh(geometry, fabric); body.position.y = -.1; body.name = 'Torso';
const root = new THREE.Bone(); root.name = 'Hips'; const spine = new THREE.Bone(); spine.name = 'Spine'; spine.position.y = .55; const leftArm = new THREE.Bone(); leftArm.name = 'LeftUpperArm'; leftArm.position.set(-.5, .55, 0); const rightArm = new THREE.Bone(); rightArm.name = 'RightUpperArm'; rightArm.position.set(.5, .55, 0); root.add(spine, leftArm, rightArm); body.add(root); body.bind(new THREE.Skeleton([root, spine, leftArm, rightArm]));
const left = new THREE.Mesh(new THREE.BoxGeometry(.32, 1.05, .11), fabric); left.position.set(-.15, -.52, 0); left.rotation.z = .18; left.name = 'LeftSleeve'; leftArm.add(left);
const right = new THREE.Mesh(new THREE.BoxGeometry(.32, 1.05, .11), fabric); right.position.set(.15, -.52, 0); right.rotation.z = -.18; right.name = 'RightSleeve'; rightArm.add(right);
const collar = new THREE.Mesh(new THREE.TorusGeometry(.22, .045, 8, 20, Math.PI), trim); collar.rotation.z = Math.PI; collar.position.set(0, .61, .08); collar.name = 'Collar';
garment.add(body, collar);
const binary = await new GLTFExporter().parseAsync(garment, { binary: true, onlyVisible: true });
await writeFile(new URL('../../../apps/demo/public/assets/garments/studio-blazer.glb', import.meta.url), new Uint8Array(binary));

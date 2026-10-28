import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { writeFile } from 'node:fs/promises';
globalThis.FileReader = class FileReader {
  result = null; onloadend = null;
  readAsArrayBuffer(blob) { blob.arrayBuffer().then((buffer) => { this.result = buffer; this.onloadend?.(); }); }
};
const garment = new THREE.Group(); garment.name = 'StudioBlazer';
const fabric = new THREE.MeshStandardMaterial({ color: '#263752', roughness: .74, metalness: .03 }); const trim = new THREE.MeshStandardMaterial({ color: '#d9a441', roughness: .42 });
const body = new THREE.Mesh(new THREE.BoxGeometry(1, 1.45, .12, 2, 4, 1), fabric); body.position.y = -.1; body.name = 'Torso';
const left = new THREE.Mesh(new THREE.BoxGeometry(.32, 1.05, .11), fabric); left.position.set(-.64, -.03, 0); left.rotation.z = .18; left.name = 'LeftSleeve';
const right = left.clone(); right.position.x = .64; right.rotation.z = -.18; right.name = 'RightSleeve';
const collar = new THREE.Mesh(new THREE.TorusGeometry(.22, .045, 8, 20, Math.PI), trim); collar.rotation.z = Math.PI; collar.position.set(0, .61, .08); collar.name = 'Collar';
garment.add(body, left, right, collar);
const binary = await new GLTFExporter().parseAsync(garment, { binary: true, onlyVisible: true });
await writeFile(new URL('../../../apps/demo/public/assets/garments/studio-blazer.glb', import.meta.url), new Uint8Array(binary));

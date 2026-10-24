import { THREE, group, cylinder, ball, material } from './kit.js';

// Keep each spectator's own sway while sharing a handful of geometry/material batches.
export function audience(root, rows, columns, zStart, step, y = 0) {
  const prototype = new THREE.Group();
  const torso = cylinder(prototype, 0.14, 0.2, 0.38, '#7a8876', [0, 0.5, 0], 5);
  const head = ball(prototype, 0.19, '#c7b69c', [0, 0.87, 0], 1);
  const hair = ball(prototype, 0.2, '#343c36', [0, 0.94, 0.035], 0);
  hair.scale.y = 0.7;
  for (const part of prototype.children) part.updateMatrix();
  const people = [],
    batches = new Map();
  const coats = ['#7a8876', '#879297', '#a3917e', '#8b777f'];
  const hairs = ['#343c36', '#4c463a', '#615541'];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < columns; c++) {
      const person = group(root, [(c - (columns - 1) / 2) * 0.72, y, zStart + r * step]);
      people.push(person);
      for (const [part, color] of [
        [torso, coats[(r + c) % 4]],
        [head, '#c7b69c'],
        [hair, hairs[(r + c) % 3]],
      ]) {
        const key = part.id + color;
        if (!batches.has(key)) batches.set(key, { geometry: part.geometry, color, records: [] });
        batches.get(key).records.push({ person, local: part.matrix });
      }
    }
  const meshes = [];
  for (const batch of batches.values()) {
    const mesh = new THREE.InstancedMesh(
      batch.geometry,
      material(batch.color),
      batch.records.length,
    );
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    mesh.castShadow = mesh.receiveShadow = true;
    mesh.frustumCulled = false;
    root.add(mesh);
    batch.mesh = mesh;
    meshes.push(mesh);
  }
  const matrix = new THREE.Matrix4();
  function update() {
    for (const person of people) person.updateMatrix();
    for (const batch of batches.values()) {
      batch.records.forEach(({ person, local }, i) => {
        matrix.multiplyMatrices(person.matrix, local);
        batch.mesh.setMatrixAt(i, matrix);
      });
      batch.mesh.instanceMatrix.needsUpdate = true;
    }
  }
  update();
  return { people, meshes, update };
}

export function concertLights(root) {
  const prototype = ball(new THREE.Group(), 0.027, '#e2c9a2', [0, 0, 0]);
  const mesh = new THREE.InstancedMesh(
    prototype.geometry,
    material('#e2c9a2', {
      emissive: '#e9c99d',
      emissiveIntensity: 1.2,
    }),
    70,
  );
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  mesh.castShadow = mesh.receiveShadow = true;
  mesh.frustumCulled = false;
  root.add(mesh);
  const stamp = new THREE.Object3D();
  function update(time) {
    for (let i = 0; i < mesh.count; i++) {
      stamp.position.set(
        -7 + (i % 15),
        0.9 + Math.floor(i / 15) * 0.12,
        -1.4 + Math.floor(i / 15) * 0.6,
      );
      stamp.scale.setScalar(0.7 + Math.sin(time * 0.9 + i) * 0.2);
      stamp.updateMatrix();
      mesh.setMatrixAt(i, stamp.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }
  update(0);
  return { mesh, update };
}

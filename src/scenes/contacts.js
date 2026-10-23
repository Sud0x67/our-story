import { THREE, box } from './kit.js';

export const TRAIL = {
  x: -0.03,
  z: 1.3,
  dx: -1.4,
  dz: -3.2,
  rise: 0.52,
  base: 2.2275,
  count: 16,
  width: 1.46,
};
export function trailHeight(x, z) {
  const p = ((x - TRAIL.x) * TRAIL.dx + (z - TRAIL.z) * TRAIL.dz) / (TRAIL.dx ** 2 + TRAIL.dz ** 2);
  const depth = 0.28 / Math.hypot(TRAIL.dx, TRAIL.dz) / 2;
  const index = Math.max(0, Math.min(TRAIL.count - 1, Math.floor((p + depth) * (TRAIL.count - 1))));
  return TRAIL.base + (TRAIL.rise * index) / (TRAIL.count - 1);
}
export function trailSteps(root) {
  const steps = [];
  for (let i = 0; i < TRAIL.count; i++) {
    const t = i / (TRAIL.count - 1);
    const step = box(root, [TRAIL.width, 0.065, 0.28], i % 3 ? '#bab79a' : '#aaa88b', [
      TRAIL.x + t * TRAIL.dx,
      TRAIL.base - 0.0325 + t * TRAIL.rise,
      TRAIL.z + t * TRAIL.dz,
    ]);
    step.rotation.y = Math.atan2(TRAIL.dx, TRAIL.dz);
    steps.push(step);
  }
  return steps;
}
export function surfaceAlongPaths(paths, base = 0.01) {
  return (x, z) => {
    for (const { points, width, top = 0.0425 } of paths)
      for (let i = 1; i < points.length; i++) {
        const [ax, az] = points[i - 1],
          [bx, bz] = points[i],
          dx = bx - ax,
          dz = bz - az;
        const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz)));
        if (Math.hypot(x - ax - t * dx, z - az - t * dz) <= width / 2) return top;
      }
    return base;
  };
}
export function seatOn(character, surface, parentPosition, yaw = 0) {
  character.support = { height: surface };
  const s = character.root.scale.y;
  character.root.rotation.y = yaw;
  character.root.position.set(
    parentPosition[0] + Math.sin(yaw) * 0.18 * s,
    surface - 0.18 * s,
    parentPosition[1] + Math.cos(yaw) * 0.18 * s,
  );
}
export function worldPoint(parent, point) {
  parent.updateWorldMatrix(true, false);
  return parent.localToWorld(new THREE.Vector3(...point));
}

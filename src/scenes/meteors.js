import { THREE, group, smooth, clamp } from './kit.js';

// A small, authored sequence: varied angles and brightness, with brief overlaps.
const paths = [
  {
    at: 0.06,
    duration: 0.23,
    from: [-0.7, 9, -12],
    to: [-5.1, 6.8, -12],
    length: 1.4,
    light: 0.72,
  },
  { at: 0.24, duration: 0.2, from: [-1.8, 9.8, -14], to: [-6.1, 7, -14], length: 1.6, light: 0.65 },
  { at: 0.38, duration: 0.25, from: [0, 9.3, -10.8], to: [-5.8, 6.2, -10.8], length: 2, light: 1 },
  {
    at: 0.59,
    duration: 0.19,
    from: [-3.4, 10, -13.2],
    to: [-7, 7.6, -13.2],
    length: 1.25,
    light: 0.62,
  },
  {
    at: 0.75,
    duration: 0.21,
    from: [-0.9, 8.3, -11.7],
    to: [-4.6, 6.6, -11.7],
    length: 1.1,
    light: 0.76,
  },
];

function glowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 32;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.15, 'rgba(255,250,236,.9)');
  gradient.addColorStop(0.45, 'rgba(235,241,255,.22)');
  gradient.addColorStop(1, 'rgba(235,241,255,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 32, 32);
  return new THREE.CanvasTexture(canvas);
}

function trail(parent, direction, length, width, color) {
  const positions = [],
    colors = [],
    indices = [];
  const tint = new THREE.Color(color);
  for (let i = 0; i <= 12; i++) {
    const t = i / 12,
      size = width * (1 - t),
      brightness = (1 - t) ** 1.8;
    for (const side of [-1, 1]) {
      positions.push(
        direction.x * length * t - direction.y * size * side,
        direction.y * length * t + direction.x * size * side,
        0,
      );
      colors.push(tint.r * brightness, tint.g * brightness, tint.b * brightness);
    }
    if (i < 12) {
      const n = i * 2;
      indices.push(n, n + 1, n + 2, n + 1, n + 3, n + 2);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  const mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      toneMapped: false,
    }),
  );
  parent.add(mesh);
  return mesh;
}

export function createMeteorSequence(parent) {
  const sequence = group(parent),
    texture = glowTexture();
  const meteors = paths.map((path, i) => {
    const root = group(sequence);
    const from = new THREE.Vector3(...path.from),
      to = new THREE.Vector3(...path.to);
    const direction = from.clone().sub(to).normalize();
    const color = i % 2 ? '#dceaff' : '#fff0d4';
    const core = trail(root, direction, path.length, 0.014, color);
    const haze = trail(root, direction, path.length, 0.075, color);
    const sprite = () => {
      const item = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: texture,
          color,
          transparent: true,
          opacity: 0,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          toneMapped: false,
        }),
      );
      root.add(item);
      return item;
    };
    const head = sprite(),
      halo = sprite();
    head.scale.setScalar(i === 2 ? 0.12 : 0.09);
    halo.scale.setScalar(i === 2 ? 0.38 : 0.28);
    root.position.copy(from);
    root.visible = false;
    return { ...path, root, from, to, core, haze, head, halo };
  });
  function update(progress) {
    const a = clamp(progress);
    for (const meteor of meteors) {
      const p = clamp((a - meteor.at) / meteor.duration);
      const glow = smooth(p / 0.12) * (1 - smooth((p - 0.62) / 0.38)) * meteor.light;
      meteor.root.visible = p > 0 && p < 1;
      meteor.root.position.lerpVectors(meteor.from, meteor.to, p);
      meteor.core.material.opacity = glow * 0.92;
      meteor.haze.material.opacity = glow * 0.16;
      meteor.head.material.opacity = glow;
      meteor.halo.material.opacity = glow * 0.27;
      const grow = smooth(p / 0.18);
      meteor.core.scale.setScalar(grow);
      meteor.haze.scale.setScalar(grow);
    }
  }
  return { root: sequence, meteors, update };
}

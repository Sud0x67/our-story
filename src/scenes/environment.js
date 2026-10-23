import { THREE, group, mesh, box, ball, tree, house, walkway, grassTuft, material } from './kit.js';
import { bakeScenery } from './landscape.js';
import { DRIVE_ROUTE } from './choreography.js';
const outdoor = new Set([
  'river',
  'mountain',
  'crabs',
  'stars',
  'cycling',
  'camp',
  'swans',
  'forest',
  'beach',
  'driving',
]);
export function extendEnvironment(setting, id) {
  if (!outdoor.has(id) || setting.root.userData.extended) return;
  const root = setting.root,
    far = group(root);
  far.userData.environment = true;
  root.userData.extended = true;
  if (id === 'river') {
    for (const z of [-22, -17, -12, -8, 9, 14, 19]) house(far, -5.5, z, 2.5, 2, 1.8);
    for (const z of [-17, -11]) house(far, 1.5, z, 2.7, 2.1, 1.8);
    walkway(
      far,
      [
        [-0.55, -110],
        [-0.55, -4.6],
      ],
      0.8,
      '#c6baa0',
    );
    walkway(
      far,
      [
        [-0.55, 4.6],
        [-0.55, 110],
      ],
      0.8,
      '#c6baa0',
    );
  }
  if (id === 'cycling') {
    walkway(
      far,
      [
        [-110, 13],
        [-8, 2.4],
      ],
      2.3,
      '#899586',
    );
    walkway(
      far,
      [
        [8, 2.5],
        [110, 13],
      ],
      2.3,
      '#899586',
    );
  }
  if (id === 'forest') {
    walkway(
      far,
      [
        [-60, 50],
        [-4.5, 4.3],
      ],
      1,
      '#b6b191',
    );
    walkway(
      far,
      [
        [2.3, -3.5],
        [11, -30],
        [30, -100],
      ],
      1,
      '#b6b191',
    );
  }
  if (['mountain', 'stars', 'crabs', 'beach'].includes(id)) {
    for (let i = 0; i < 8; i++) {
      const x = -42 + i * 13,
        z = -32 - (i % 3) * 9,
        h = (id === 'stars' ? 4 : 7) + (i % 3) * 2;
      const hill = ball(far, 1, id === 'stars' ? '#253c43' : '#819b8c', [x, h * 0.28, z], 1);
      hill.scale.set(10, h, 8);
    }
  }
  if (!['crabs', 'beach', 'stars'].includes(id)) {
    for (let i = 0; i < 36; i++) {
      const angle = i * 2.399,
        r = 13 + (i % 5) * 5,
        x = Math.cos(angle) * r,
        z = Math.sin(angle) * r;
      if (
        (z > 7 && Math.abs(x) < 13) ||
        (id === 'mountain' && x > 0) ||
        (id === 'cycling' && z < -1) ||
        (id === 'driving' &&
          Math.abs(Math.cos(DRIVE_ROUTE.yaw) * x - Math.sin(DRIVE_ROUTE.yaw) * z) < 6.4) ||
        (id === 'river' && x < -0.9 && x > -4)
      )
        continue;
      tree(
        far,
        x,
        z,
        id === 'forest' ? 2.4 + (i % 5) * 0.35 : 1.1 + (i % 5) * 0.3,
        id === 'mountain' ? 'pine' : 'round',
      );
    }
  }
  if (id === 'camp' || id === 'river' || id === 'forest')
    for (let i = 0; i < 100; i++) {
      const angle = i * 2.399,
        r = 7 + (i % 9) * 1.4,
        x = Math.cos(angle) * r,
        z = Math.sin(angle) * r;
      if (id === 'river' && x < 0) continue;
      grassTuft(far, x, z, 0, i % 2 ? '#90ab80' : '#a6b58e');
    }
  bakeScenery(far);
  far.traverse((o) => {
    if (o.isMesh) o.castShadow = false;
  });
}

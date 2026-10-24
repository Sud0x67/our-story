import {
  THREE,
  material,
  mesh,
  box,
  ball,
  cylinder,
  group,
  tube,
  textSign,
  base,
  sceneResult,
  themes,
} from './kit.js';
import { seatOn } from './contacts.js';
import { couple, person } from './characters.js';
import { bakeScenery } from './landscape.js';
import { audience, concertLights } from './crowd.js';
function mic(root, position, scale = 1) {
  const g = group(root, position);
  g.scale.setScalar(scale);
  cylinder(g, 0.02, 0.035, 1.2, '#515851', [0, 0.6, 0], 6);
  cylinder(g, 0.18, 0.18, 0.04, '#3e4942', [0, 0.02, 0], 10);
  tube(
    g,
    [
      [0, 1.16, 0],
      [0.16, 1.35, 0.05],
    ],
    0.018,
    '#6c7166',
  );
  const head = cylinder(g, 0.05, 0.04, 0.18, '#acb3a2', [0.16, 1.36, 0.1], 8);
  head.rotation.x = Math.PI / 2;
}
function guitar(parent, position) {
  const g = group(parent, position);
  const body = ball(g, 0.31, '#b39666', [0, 0, 0], 1);
  body.scale.set(0.83, 1.12, 0.27);
  const top = ball(g, 0.23, '#b39666', [0, 0.23, 0], 1);
  top.scale.set(0.8, 1, 0.3);
  box(g, [0.1, 0.7, 0.07], '#9b7c51', [0, 0.66, 0]);
  ball(g, 0.08, '#554b38', [0, 0.06, 0.09], 1).scale.z = 0.25;
  for (let i = 0; i < 3; i++)
    tube(
      g,
      [
        [i * 0.019 - 0.02, -0.1, 0.092],
        [i * 0.019 - 0.02, 0.95, 0.05],
      ],
      0.003,
      '#d3c399',
    );
  g.rotation.z = -0.4;
  return g;
}
function lightCone(root, position, color, rotation = 0) {
  const g = group(root, position);
  g.rotation.z = rotation;
  const cone = mesh(
    g,
    new THREE.ConeGeometry(1.25, 5.3, 24, 1, true),
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.055,
      side: THREE.DoubleSide,
      depthWrite: false,
    }),
    [0, -2.65, 0],
  );
  cylinder(g, 0.12, 0.12, 0.25, '#777b68', [0, 0, 0], 8);
  return g;
}
export function live() {
  const root = new THREE.Group();
  base(root, 14, 11, '#46534a');
  box(root, [11.5, 0.5, 3.7], '#3b463e', [0, 0.2, -3.0]);
  box(root, [12, 4.6, 0.2], '#263c37', [0, 2.4, -5.1]);
  for (let x = -5.8; x < 6; x += 0.3) box(root, [0.12, 4.4, 0.08], '#30483f', [x, 2.4, -4.95]);
  for (const x of [-5.1, 5.1]) {
    box(root, [0.85, 1.6, 0.7], '#2e3832', [x, 0.85, -2.0]);
    for (const y of [0.45, 1.2])
      cylinder(root, 0.27, 0.27, 0.02, '#495247', [x, y, -1.64], 12).rotation.x = Math.PI / 2;
  }
  const singer = person(root, 'performer', [0, 0.5, -3.2], {
    coat: '#696b59',
    hair: '#3c3932',
    glasses: true,
    scale: 0.9,
  });
  singer.pose({ reach: 0.55 });
  guitar(root, [0.02, 1.35, -2.9]);
  mic(root, [0.2, 0.5, -2.65]);
  textSign(root, '周云蓬', 2.8, 0.6, [0, 3.7, -4.92], '#30483f', '#e2d0a4');
  const crowd = audience(root, 3, 11, -0.8, 0.75);
  const pair = couple(
    root,
    [
      [-0.65, 0, 3.15],
      [0.65, 0, 3.15],
    ],
    { popo: { rotation: Math.PI }, xiaohe: { rotation: Math.PI } },
  );
  const spots = [
    lightCone(root, [-3.5, 5, -2.5], '#e6c895', -0.25),
    lightCone(root, [3.2, 5, -2.7], '#acb7d2', 0.28),
  ];
  return sceneResult(
    root,
    ({ time }) => {
      pair.idle(time);
      singer.idle(time);
      singer.arms[1].elbow.rotation.x = -0.7 + Math.sin(time * 1.8) * 0.045;
      crowd.people.forEach((g, i) => (g.rotation.z = Math.sin(time * 0.7 + i) * 0.018));
      crowd.update();
      spots.forEach(
        (g, i) => (g.rotation.z = Math.sin(time * 0.13 + i) * 0.07 + (i ? 0.25 : -0.25)),
      );
    },
    {
      theme: themes.night,
      view: {
        from: [11, 9, 17],
        to: [8, 6.5, 16],
        target: [0, 1, -0.5],
        endTarget: [0, 1.5, -1],
        span: 12.3,
        endSpan: 9.6,
      },
    },
  );
}
export function concert() {
  const root = new THREE.Group();
  base(root, 18, 14, '#344c4c');
  const stage = group(root);
  box(stage, [11, 0.65, 4], '#3e4753', [0, 0.2, -4.5]);
  box(stage, [11, 4.6, 0.2], '#2e3b56', [0, 2.9, -6.55]);
  // Abstract stage imagery rather than an invented reconstruction of the actual show.
  for (let i = 0; i < 7; i++) {
    const arc = mesh(
      stage,
      new THREE.TorusGeometry(1.2 + i * 0.16, 0.018, 5, 64, Math.PI),
      material(i % 2 ? '#a7b4c2' : '#d0ad97', {
        emissive: i % 2 ? '#849eae' : '#c3a58b',
        emissiveIntensity: 0.65,
      }),
      [0, 1.7, -6.37],
    );
  }
  textSign(stage, '一粒 · 陈粒', 3.2, 0.65, [0, 3.5, -6.3], '#2e3b56', '#e5cfbb');
  const singer = person(root, 'friend-girl', [0, 0.6, -4.6], {
    coat: '#c4b5c4',
    scale: 0.62,
    hair: '#393c3d',
  });
  mic(root, [0.12, 0.6, -4.1], 0.7);
  for (const x of [-6.3, 6.3]) {
    box(stage, [1.1, 3.3, 0.4], '#1f313d', [x, 2.1, -5]);
    box(stage, [0.9, 2.8, 0.05], '#7491a3', [x, 2.1, -4.76], {
      emissive: '#728da1',
      emissiveIntensity: 0.4,
    });
  }
  const crowd = audience(root, 3, 15, -1.9, 0.8, 0.1);
  for (let i = 0; i < 3; i++)
    box(stage, [16, 0.35, 1.3], '#66767a', [0, 0.15 + i * 0.38, 1.7 + i * 1.25]);
  for (const x of [-0.75, 0.75]) {
    box(stage, [0.7, 0.12, 0.65], '#a2ac9c', [x, 1.5, 4]);
    box(stage, [0.7, 0.5, 0.08], '#a2ac9c', [x, 1.75, 4.3]);
  }
  bakeScenery(stage);
  const pair = couple(
    root,
    [
      [-0.75, 1.4, 4.0],
      [0.75, 1.4, 4],
    ],
    { popo: { rotation: Math.PI }, xiaohe: { rotation: Math.PI } },
  );
  seatOn(pair.p, 1.56, [-0.75, 4], Math.PI);
  seatOn(pair.h, 1.56, [0.75, 4], Math.PI);
  const lights = concertLights(root);
  const spots = [
    lightCone(root, [-4, 6.2, -4], '#becfe1', -0.45),
    lightCone(root, [4, 6.2, -4], '#e7bea5', 0.45),
  ];
  return sceneResult(
    root,
    ({ time }) => {
      pair.p.pose({ sit: 1 });
      pair.h.pose({ sit: 1 });
      pair.idle(time);
      singer.idle(time);
      crowd.people.forEach((g, i) => (g.rotation.z = Math.sin(time * 0.6 + i) * 0.015));
      crowd.update();
      lights.update(time);
      spots.forEach((g, i) => (g.rotation.z = (i ? 1 : -1) * (0.35 + Math.sin(time * 0.18) * 0.1)));
    },
    {
      contacts: { actors: [pair.p, pair.h] },
      performance: { crowd, lights },
      theme: { ...themes.night, background: '#202938', bottom: '#142c32' },
      view: {
        from: [13, 11, 22],
        to: [10, 8, 19],
        target: [0, 1.6, 0],
        endTarget: [0, 1.9, 0],
        span: 15,
        endSpan: 11.8,
      },
    },
  );
}

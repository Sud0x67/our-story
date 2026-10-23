import {
  THREE,
  palette,
  material,
  mesh,
  box,
  ball,
  cylinder,
  line,
  group,
  tube,
  base,
  tree,
  walkway,
  lamp,
  textSign,
  smooth,
  mix,
  themes,
  sceneResult,
} from './kit.js';
import { worldPoint } from './contacts.js';
import { person, couple, reachHand, reachFoot, localHand } from './characters.js';
function bicycle(parent, color) {
  const g = group(parent);
  const wheels = [];
  for (const x of [-0.72, 0.72]) {
    const wheel = group(g, [x, 0.49, 0]);
    mesh(wheel, new THREE.TorusGeometry(0.45, 0.026, 6, 36), '#35463f', [0, 0, 0]);
    mesh(wheel, new THREE.TorusGeometry(0.421, 0.015, 5, 36), '#b5bda8', [0, 0, 0]);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      line(
        wheel,
        [
          [0, 0, 0],
          [Math.cos(a) * 0.42, Math.sin(a) * 0.42, 0],
        ],
        '#a2ac9a',
      );
    }
    wheels.push(wheel);
  }
  const A = [-0.72, 0.49, 0],
    B = [-0.15, 0.48, 0],
    C = [-0.36, 0.9, 0],
    D = [0.48, 1.04, 0],
    E = [0.72, 0.49, 0];
  for (const [a, b] of [
    [A, B],
    [A, C],
    [C, B],
    [C, D],
    [B, D],
    [D, E],
  ])
    tube(g, [a, b], 0.032, color);
  tube(
    g,
    [
      [0.68, 0.5, 0],
      [0.47, 1.12, 0],
    ],
    0.027,
    color,
  );
  box(g, [0.35, 0.07, 0.2], '#404c43', [-0.36, 1.0, 0]);
  tube(
    g,
    [
      [0.47, 1.12, 0],
      [0.51, 1.1, 0.23],
      [0.73, 1.02, 0.23],
      [0.7, 0.9, 0.23],
    ],
    0.024,
    '#4c5a51',
  );
  tube(
    g,
    [
      [0.47, 1.12, 0],
      [0.51, 1.1, -0.23],
      [0.73, 1.02, -0.23],
      [0.7, 0.9, -0.23],
    ],
    0.024,
    '#4c5a51',
  );
  const crank = group(g, [-0.15, 0.48, 0]);
  tube(
    crank,
    [
      [0, 0.12, 0.16],
      [0, 0, 0],
      [0, -0.12, -0.16],
    ],
    0.02,
    '#747f6c',
  );
  const pedals = [
    box(crank, [0.17, 0.04, 0.12], '#596d65', [0, 0.12, 0.16]),
    box(crank, [0.17, 0.04, 0.12], '#596d65', [0, -0.12, -0.16]),
  ];
  return { root: g, wheels, crank, pedals };
}
export function cycling() {
  const root = new THREE.Group();
  base(root, 18, 11, '#56785f');
  box(root, [220, 0.1, 160], '#537d7c', [0, -0.01, -80.6], { roughness: 0.32, metalness: 0.18 });
  walkway(
    root,
    [
      [-8, 2.4],
      [-4.5, 1.8],
      [-1, 1.3],
      [2, 1.1],
      [5, 1.7],
      [8, 2.5],
    ],
    2.3,
    '#899586',
  );
  for (let i = 0; i < 15; i++)
    box(root, [0.4, 0.015, 0.05], '#c4c8a8', [-7.5 + i, 0.09, 1.4 + Math.abs(-7.5 + i) * 0.1]);
  for (const [x, z, s] of [
    [-6, -3.7, 1.1],
    [6.7, -3.2, 1.2],
    [-6.3, 3.8, 0.9],
    [6.3, 3.8, 1],
  ])
    tree(root, x, z, s);
  lamp(root, -4.7, 0.1);
  lamp(root, 4.5, 0.05);
  const path = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-6, 0.03, 2.1),
    new THREE.Vector3(-2, 0.03, 1.4),
    new THREE.Vector3(2, 0.03, 1.3),
    new THREE.Vector3(6, 0.03, 2.1),
  ]);
  const bikes = [bicycle(root, '#414b43'), bicycle(root, '#e3dfcd')];
  const riders = [
    person(bikes[0].root, 'popo', [-0.2124, 0.8874, 0], {
      rotation: Math.PI / 2,
      scale: 0.82,
      armLength: 1.25,
      coat: '#c8be9c',
    }),
    person(bikes[1].root, 'xiaohe', [-0.2178, 0.8928, 0], {
      rotation: Math.PI / 2,
      scale: 0.79,
      armLength: 1.25,
      coat: '#a4c5cf',
    }),
  ];
  const balloon = group(bikes[1].root, [-0.35, 0, 0]);
  const string = line(
    balloon,
    Array.from({ length: 10 }, (_, i) => [-0.1 - i * 0.035, 1.12 + i * 0.38, 0]),
    '#d0c9a2',
    0.85,
  );
  const floating = ball(balloon, 0.39, '#d9bda1', [-0.42, 4.55, 0], 1);
  floating.scale.set(0.85, 1.15, 0.85);
  const knot = mesh(balloon, new THREE.ConeGeometry(0.05, 0.09, 5), '#c4a17f', [-0.42, 4.12, 0]);
  const positions = string.geometry.attributes.position;
  return sceneResult(
    root,
    ({ time, progress }) => {
      bikes.forEach((bike, i) => {
        const t = 0.1 + progress * 0.58 + (i === 1 ? 0.29 : 0),
          point = path.getPointAt(t),
          tan = path.getTangentAt(t);
        const lateral = i === 1 ? -0.16 : 0.16;
        point.add(new THREE.Vector3(-tan.z, 0, tan.x).multiplyScalar(lateral));
        bike.root.position.copy(point);
        bike.root.rotation.y = -Math.atan2(tan.z, tan.x);
        const distance = path.getLength() * progress * 0.58;
        bike.wheels.forEach((w) => (w.rotation.z = -distance / 0.45));
        bike.crank.rotation.z = -distance * 2.6;
        bike.pedals.forEach((p) => (p.rotation.z = -bike.crank.rotation.z));
        const c = riders[i];
        c.pose({ sit: 1 });
        c.body.rotation.x = 0.9;
        c.body.position.set(0, 0.28 + 0.15 * Math.cos(0.9), 0.15 * Math.sin(0.9));
        c.idle(time);
        for (let j = 0; j < 2; j++) {
          reachHand(c, j, worldPoint(bike.root, [0.51, 1.1, j ? -0.23 : 0.23]));
          const pedal = bike.pedals[j].getWorldPosition(new THREE.Vector3());
          pedal.y += 0.02 + 0.05 * c.root.scale.y;
          reachFoot(c, j, pedal, 0.31 * 1.78, 0.25 * 1.78);
        }
      });
      const wind = Math.sin(time * 0.85) * 0.16;
      floating.position.x = -0.42 + wind;
      floating.position.z = Math.sin(time * 0.65) * 0.08;
      knot.position.x = floating.position.x;
      knot.position.z = floating.position.z;
      for (let i = 0; i < 10; i++) {
        const t = i / 9;
        positions.setXYZ(
          i,
          mix(-0.1, floating.position.x, t) +
            Math.sin(time * 0.85 + t * 2) * 0.1 * Math.sin(t * Math.PI),
          1.12 + t * 3.02,
          floating.position.z * t + Math.sin(time * 0.65 + t) * 0.05 * Math.sin(t * Math.PI),
        );
      }
      positions.needsUpdate = true;
    },
    {
      interactionAnchor: () => root.worldToLocal(floating.getWorldPosition(new THREE.Vector3())),
      contacts: { riders, bikes },
      theme: themes.night,
      view: {
        from: [11, 8.5, 19],
        to: [9, 7, 17],
        target: [0, 1.7, 1],
        endTarget: [2, 2, 1.3],
        span: 13.4,
        endSpan: 10.4,
      },
    },
  );
}

function carWheel(parent, x, z) {
  const g = group(parent, [x, 0.54, z]);
  g.rotation.y = Math.PI / 2;
  mesh(g, new THREE.TorusGeometry(0.43, 0.115, 7, 28), '#36433d', [0, 0, 0]);
  cylinder(g, 0.31, 0.31, 0.16, '#899690', [0, 0, 0], 12).rotation.x = Math.PI / 2;
  for (let i = 0; i < 5; i++) {
    const spoke = box(g, [0.045, 0.57, 0.17], '#c4cec4', [0, 0, 0.02]);
    spoke.rotation.z = (i * Math.PI) / 5;
  }
  cylinder(g, 0.09, 0.09, 0.18, '#596d64', [0, 0, 0.02], 10).rotation.x = Math.PI / 2;
  return g;
}
export function driving() {
  const root = new THREE.Group();
  base(root, 18, 12, '#8fa58b');
  const road = group(root, [0, 0, 0], -0.4);
  box(road, [6.4, 0.08, 240], '#8e9990', [0, 0.01, 0]);
  for (let z = -100; z < 100; z += 1.5) box(road, [0.06, 0.025, 0.65], '#e1ddbf', [0, 0.07, z]);
  for (const [x, z, s] of [
    [-6, -4, 1.1],
    [-2, -4.5, 1],
    [3.5, -4.4, 1.3],
    [6.7, 4, 1],
  ])
    tree(root, x, z, s);
  const car = group(root, [0, 0.06, 0.4], -0.4);
  const white = material('#e5e6db', { roughness: 0.32, metalness: 0.12 });
  const floor = box(car, [2.3, 0.12, 3.1], white, [0, 0.56, -0.15]);
  for (const x of [-1.22, 1.22]) box(car, [0.16, 0.55, 3.3], white, [x, 0.83, -0.15]);
  box(car, [2.6, 0.6, 1.15], white, [0, 0.8, 1.75]);
  box(car, [2.6, 0.6, 0.65], white, [0, 0.8, -2.0]);
  box(car, [2.53, 0.2, 4.5], '#5a6863', [0, 0.48, 0]);
  box(car, [2.4, 0.23, 1.2], white, [0, 1.28, 1.6]);
  box(car, [2.4, 0.3, 0.58], white, [0, 1.31, -2.0]);
  const front = box(car, [2.22, 0.1, 0.035], '#374d4b', [0, 1.11, 2.368]);
  box(car, [2.07, 0.034, 0.04], '#dce6d8', [0, 1.14, 2.39], {
    emissive: '#c2dacd',
    emissiveIntensity: 0.6,
  });
  box(car, [2.15, 0.035, 0.04], '#b97e76', [0, 1.18, -2.37], {
    emissive: '#b8746b',
    emissiveIntensity: 0.25,
  });
  const glass = material('#91b1b0', {
    transparent: true,
    opacity: 0.22,
    depthWrite: false,
    roughness: 0.12,
  });
  for (const x of [-1.2, 1.2]) {
    box(car, [0.045, 1.0, 2.8], glass, [x, 1.89, -0.2]);
    for (const z of [-1.63, 1.1]) box(car, [0.08, 1.12, 0.08], white, [x, 1.84, z]);
    box(car, [0.035, 0.17, 2.75], white, [x, 1.4, -0.2]);
    box(car, [0.035, 0.035, 0.28], '#a3aaa0', [x * 1.015, 1.43, -0.2]);
    box(car, [0.3, 0.15, 0.32], white, [x * 1.12, 1.86, 0.94]);
  }
  const wind = box(car, [2.33, 0.9, 0.045], glass, [0, 1.92, 1.1]);
  wind.rotation.x = -0.18;
  box(car, [2.4, 0.08, 2.85], glass, [0, 2.4, -0.2]);
  for (const x of [-1.1, 1.1]) box(car, [0.06, 0.08, 2.85], white, [x, 2.43, -0.2]);
  const rear = box(car, [2.25, 0.8, 0.04], glass, [0, 1.94, -1.65]);
  rear.rotation.x = 0.15;
  for (const x of [-0.64, 0.64]) {
    box(car, [0.9, 0.18, 1.0], '#969f98', [x, 1.0, -0.15]);
    box(car, [0.9, 0.85, 0.17], '#9ba49d', [x, 1.48, -0.67]);
    box(car, [0.43, 0.31, 0.18], '#aeb4a9', [x, 1.98, -0.67]);
  }
  box(car, [2.2, 0.28, 0.5], '#9ca59e', [0, 1.45, 0.95]);
  box(car, [0.74, 0.38, 0.035], '#596c68', [0, 1.72, 0.91]);
  const steering = mesh(
    car,
    new THREE.TorusGeometry(0.23, 0.035, 5, 28),
    '#606e68',
    [-0.64, 1.43, 0.45],
  );
  steering.rotation.x = 0.25;
  textSign(car, 'ZEEKR', 0.5, 0.09, [0, 1.32, 2.235], '#e5e6db', '#5b6e68');
  const pair = couple(
    car,
    [
      [-0.64, 1, -0.08],
      [0.64, 1, -0.08],
    ],
    { popo: { scale: 0.63, coat: '#d0c7ae' }, xiaohe: { scale: 0.63, coat: '#a7bfca' } },
  );
  // Xiaohe drives on the left, Popo accompanies her on the right.
  pair.h.root.position.set(-0.64, 0.9766, 0.18);
  pair.p.root.position.set(0.64, 0.9766, 0.18);
  const wheels = [];
  for (const x of [-1.3, 1.3]) for (const z of [-1.45, 1.48]) wheels.push(carWheel(car, x, z));
  return sceneResult(
    root,
    ({ time, progress }) => {
      const distance = progress * 2.2;
      car.position.x = Math.sin(-0.4) * (distance - 1.1);
      car.position.z = 0.4 + Math.cos(-0.4) * (distance - 1.1);
      pair.h.pose({ sit: 1, reach: 0.7 });
      pair.p.pose({ sit: 1 });
      pair.idle(time);
      pair.p.head.rotation.y = -0.2;
      steering.rotation.z = Math.sin(time * 0.7) * 0.09;
      wheels.forEach((w) => (w.rotation.z = distance / 0.43));
      for (let j = 0; j < 2; j++) {
        reachHand(pair.h, j, worldPoint(steering, [j ? 0.215 : -0.215, 0, 0]));
        localHand(pair.p, j, [j ? 0.18 : -0.18, 0.28, 0.3]);
      }
    },
    {
      contacts: { actors: [pair.p, pair.h], driver: pair.h, steering, floor, car, wheels },
      view: {
        from: [-11, 8, 17],
        to: [-7, 5, 11],
        target: [0, 1.3, 0.3],
        endTarget: [0.2, 1.65, 0.2],
        span: 12.5,
        endSpan: 7.0,
      },
    },
  );
}

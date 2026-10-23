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
  indoor,
  table,
  chair,
  cup,
  picture,
  revealPicture,
  steam,
  textSign,
  clamp,
  smooth,
  mix,
  sceneResult,
  themes,
} from './kit.js';
import { seatOn, worldPoint } from './contacts.js';
import { couple, person, reachHand, localHand } from './characters.js';

function diners(root, options = {}) {
  chair(root, [-0.72, 0, -1.02]);
  chair(root, [0.72, 0, -1.02]);
  const pair = couple(
    root,
    [
      [-0.72, 0.54, -1.02],
      [0.72, 0.54, -1.02],
    ],
    options,
  );
  seatOn(pair.p, 0.6, [-0.72, -1.02]);
  seatOn(pair.h, 0.6, [0.72, -1.02]);
  pair.p.pose({ sit: 1 });
  pair.h.pose({ sit: 1 });
  return pair;
}
function bottle(parent, position, color = '#667b50') {
  const g = group(parent, position);
  cylinder(g, 0.09, 0.11, 0.42, color, [0, 0.21, 0], 8);
  cylinder(g, 0.045, 0.07, 0.19, color, [0, 0.5, 0], 8);
  cylinder(g, 0.05, 0.05, 0.035, '#bc9e6a', [0, 0.6, 0], 8);
  box(g, [0.13, 0.17, 0.02], '#d8c9a3', [0, 0.25, 0.105]);
  return g;
}
function beerMug(parent, side) {
  const root = group(parent, [side * 0.4, 0.951, -0.16]);
  cylinder(root, 0.125, 0.105, 0.3, '#cfad72', [0, 0.15, 0], 16);
  cylinder(root, 0.112, 0.112, 0.018, '#e9d7a9', [0, 0.294, 0], 16);
  const rim = mesh(root, new THREE.TorusGeometry(0.12, 0.012, 6, 24), '#e7d8b7', [0, 0.3, 0]);
  rim.rotation.x = Math.PI / 2;
  mesh(root, new THREE.TorusGeometry(0.075, 0.023, 6, 20), '#dcca9f', [side * 0.17, 0.15, 0]);
  const grip = group(root, [side * 0.23, 0.105, 0]);
  return { root, grip, side };
}
function pendant(root, x, y, z, color = '#dcc49c') {
  tube(
    root,
    [
      [x, 4.3, z],
      [x, y + 0.2, z],
    ],
    0.014,
    '#5c5746',
  );
  mesh(root, new THREE.ConeGeometry(0.38, 0.25, 12, 1, true), color, [x, y, z], {
    side: THREE.DoubleSide,
  });
  ball(root, 0.1, '#ffe0a0', [x, y - 0.09, z], 1).material = material('#ffe0a0', {
    emissive: '#f2bd73',
    emissiveIntensity: 1.3,
  });
}

export function bar() {
  const root = indoor({ floor: '#79614f', wall: '#4c5c50' });
  for (let x = -5.6; x < 6; x += 0.43) box(root, [0.025, 2.0, 0.035], '#938061', [x, 1.0, -4.28]);
  box(root, [4.3, 0.52, 1.12], '#714d46', [0, 0.42, -1.2]);
  box(root, [4.3, 0.8, 0.2], '#895e50', [0, 1.3, -1.67]);
  for (const x of [-2.15, 2.15]) box(root, [0.3, 0.63, 1.2], '#8c6351', [x, 1, -1.2]);
  box(root, [3.6, 0.02, 2.6], '#b29170', [0, 0.035, 0.6]);
  table(root, [0, 0, 0.6], 2.8, 1.6, '#ad8e66');
  const pair = couple(root, [
    [-0.74, 0.63, -1.03],
    [0.74, 0.63, -1.03],
  ]);
  seatOn(pair.p, 0.68, [-0.74, -1.2]);
  seatOn(pair.h, 0.68, [0.74, -1.2]);
  const shelf = group(root, [-3.65, 1.35, -4.12]);
  for (let j = 0; j < 3; j++) {
    box(shelf, [3.5, 0.1, 0.43], '#a58d69', [0, j * 0.65, 0]);
    for (let i = 0; i < 7; i++)
      bottle(
        shelf,
        [-1.35 + i * 0.43, j * 0.65 + 0.05, 0],
        ['#788a5f', '#b3a071', '#855b45'][i % 3],
      );
  }
  pendant(root, -1.9, 3, -0.3);
  pendant(root, 2.5, 2.8, -2.2);
  const whiskey = group(root, [-0.6, 0.951, 0.35]);
  cylinder(whiskey, 0.14, 0.13, 0.27, '#b99356', [0, 0.14, 0], 10);
  cylinder(whiskey, 0.12, 0.12, 0.1, '#d6a65a', [0, 0.19, 0], 10);
  const ice = box(whiskey, [0.1, 0.09, 0.1], '#e6e0c8', [0.02, 0.26, 0]);
  ice.rotation.y = 0.4;
  for (const x of [0.3, 0.9]) {
    const g = group(root, [x, 0.951, 0.4]);
    cylinder(g, 0.19, 0.04, 0.25, x > 0.5 ? '#b6797b' : '#d7ae69', [0, 0.27, 0], 10);
    cylinder(g, 0.017, 0.017, 0.2, '#d4c7ad', [0, 0.11, 0], 6);
    cylinder(g, 0.13, 0.13, 0.025, '#c2b395', [0, 0.015, 0], 10);
    const citrus = cylinder(g, 0.09, 0.09, 0.025, '#c9bd70', [0.14, 0.4, 0], 10);
    citrus.rotation.x = Math.PI / 2;
  }
  box(root, [1.6, 1.35, 0.05], '#c5aa7e', [3.5, 2.4, -4.27]);
  box(root, [1.4, 1.15, 0.07], '#536a59', [3.5, 2.4, -4.23]);
  return sceneResult(
    root,
    ({ time }) => {
      pair.p.pose({ sit: 1 });
      pair.h.pose({ sit: 1 });
      pair.idle(time);
      pair.p.head.rotation.y = 0.16;
      pair.h.head.rotation.y = -0.16;
      pair.p.arms[1].shoulder.rotation.x = -0.7 + Math.sin(time) * 0.07;
      pair.h.arms[0].shoulder.rotation.x = -0.6 + Math.sin(time * 0.9) * 0.06;
    },
    {
      contacts: { actors: [pair.p, pair.h] },
      theme: themes.warm,
      view: {
        from: [10, 8, 15],
        to: [7, 5.5, 12],
        target: [0, 1, -0.3],
        endTarget: [0, 1.5, -0.6],
        span: 10.6,
        endSpan: 6.8,
      },
    },
  );
}

function bronzeMask(parent, position, scale = 1) {
  const g = group(parent, position);
  g.scale.setScalar(scale);
  const bronze = '#8f9e6c';
  const dark = '#566c52';
  box(g, [1.18, 0.85, 0.3], bronze, [0, 0, 0]);
  for (const side of [-1, 1]) {
    const ear = box(g, [0.52, 0.67, 0.17], bronze, [side * 0.78, 0, -0.035]);
    ear.rotation.z = side * 0.25;
    cylinder(g, 0.19, 0.19, 0.35, dark, [side * 0.31, 0.1, 0.2], 8).rotation.x = Math.PI / 2;
    const eye = cylinder(g, 0.125, 0.16, 0.4, bronze, [side * 0.31, 0.1, 0.34], 8);
    eye.rotation.x = Math.PI / 2;
    box(g, [0.45, 0.08, 0.15], dark, [side * 0.31, 0.33, 0.23]).rotation.z = side * -0.12;
  }
  const nose = mesh(g, new THREE.ConeGeometry(0.19, 0.5, 4), bronze, [0, -0.04, 0.4]);
  nose.rotation.x = Math.PI / 2;
  box(g, [0.62, 0.055, 0.09], dark, [0, -0.24, 0.2]);
  return g;
}
export function museum() {
  const root = indoor({ floor: '#b4b9a6', wall: '#405d51' });
  for (const x of [-3.6, 3.6]) {
    box(root, [2.4, 0.55, 1.8], '#646f5c', [x, 0.28, -2]);
    const glass = box(root, [2.3, 2.2, 1.7], '#c1d3c2', [x, 1.62, -2], {
      transparent: true,
      opacity: 0.12,
      depthWrite: false,
      roughness: 0.15,
    });
    glass.castShadow = false;
  }
  bronzeMask(root, [-3.6, 1.6, -2], 1.15);
  const tree = group(root, [3.6, 0.56, -2]);
  cylinder(tree, 0.07, 0.14, 1.8, '#9d9a60', [0, 0.9, 0], 6);
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    const branch = tube(
      tree,
      [
        [0, 0.65 + (i % 3) * 0.3, 0],
        [Math.cos(a) * 0.6, 1.1 + (i % 3) * 0.25, Math.sin(a) * 0.5],
      ],
      0.04,
      '#a4a26a',
    );
    ball(tree, 0.14, '#adae75', [Math.cos(a) * 0.62, 1.12 + (i % 3) * 0.25, Math.sin(a) * 0.52]);
  }
  bronzeMask(root, [0, 2.6, -4.05], 1.65);
  textSign(root, '三星堆', 1.7, 0.4, [0, 3.8, -4.23], '#405d51', '#d8d6aa');
  const pair = couple(
    root,
    [
      [-0.63, 0, 1.05],
      [0.63, 0, 1.05],
    ],
    { popo: { coat: '#e1e2d7' }, xiaohe: { coat: '#91b9cd' } },
  );
  const masks = [
    bronzeMask(pair.p.arms[0].hand, [0, 0.08, 0.12], 0.38),
    bronzeMask(pair.h.arms[1].hand, [0, 0.08, 0.12], 0.38),
  ];
  const photo = picture(root, '/assets/museum.webp', [4.05, 3.3, -4.25], 1.5, 2);
  photo.userData.attachment = 'wall';
  return sceneResult(
    root,
    ({ time, progress }) => {
      pair.idle(time);
      const pose = smooth((progress - 0.3) / 0.25);
      for (const [i, c] of [pair.p, pair.h].entries()) {
        c.pose({ reach: pose });
        c.root.rotation.y = mix(i ? -0.7 : 0.7, 0, pose);
        c.head.rotation.y = mix(i ? -0.35 : 0.35, 0, pose);
      }
      masks.forEach((m) => (m.visible = pose > 0.15));
      revealPicture(photo, smooth((progress - 0.6) / 0.3));
    },
    {
      memories: { photo },
      theme: themes.museum,
      view: {
        from: [11, 8, 16],
        to: [7, 5.8, 14],
        target: [0, 1.5, -0.4],
        endTarget: [1.5, 1.8, -2.3],
        span: 11.2,
        endSpan: 10.4,
      },
    },
  );
}

function skewers(parent, position, scale = 1) {
  const g = group(parent, position);
  g.scale.setScalar(scale);
  for (let i = 0; i < 12; i++) {
    const a = i * 2.399,
      r = 0.18 + (i % 4) * 0.09;
    const sk = group(g, [Math.cos(a) * r, 0, Math.sin(a) * r]);
    sk.rotation.z = Math.cos(a) * 0.22;
    sk.rotation.x = Math.sin(a) * 0.22;
    cylinder(sk, 0.012, 0.012, 0.95, '#ddbd85', [0, 0.46, 0], 4);
    for (let j = 0; j < 3; j++)
      ball(sk, 0.065, ['#bf7050', '#d1a462', '#91a262'][i % 3], [0, 0.21 + j * 0.12, 0], 0);
  }
  return g;
}
export function skewersDinner() {
  const root = indoor({ floor: '#a5805d', wall: '#a76850' });
  table(root, [0, 0, 0.65], 3.2, 2.1);
  const pair = diners(root);
  textSign(root, '重庆 · 串串', 3, 0.65, [0, 2.95, -4.27], '#805043', '#f1dbab');
  for (const x of [-3.6, 3.6]) {
    cylinder(root, 0.36, 0.36, 0.62, '#c88459', [x, 2.5, -2.5], 10);
    cylinder(root, 0.39, 0.39, 0.07, '#d4ac73', [x, 2.16, -2.5], 10);
    tube(
      root,
      [
        [x, 4, -2.5],
        [x, 2.83, -2.5],
      ],
      0.012,
      '#675641',
    );
  }
  cylinder(root, 0.56, 0.46, 0.3, '#9c9d89', [0, 1.1, 0.6], 16);
  cylinder(root, 0.5, 0.5, 0.025, '#9b513c', [0, 1.247, 0.6], 16);
  skewers(root, [0, 1.02, 0.6], 0.8);
  for (const x of [-1.1, 1.1]) {
    cylinder(root, 0.29, 0.29, 0.025, '#e0cdb1', [x, 0.964, 0.7], 16);
    cup(root, [x, 0.951, 0.1], '#d7cbb1');
  }
  const vapor = steam(root, [0, 1.7, 0.6]);
  return sceneResult(
    root,
    ({ time }) => {
      pair.idle(time);
      vapor(time);
      pair.p.head.rotation.y = 0.12;
      pair.h.head.rotation.y = -0.12;
    },
    {
      contacts: { actors: [pair.p, pair.h] },
      theme: themes.warm,
      view: {
        from: [11, 8, 16],
        to: [8, 6, 14],
        target: [0, 1, -0.2],
        endTarget: [0, 1.4, -0.1],
        span: 10.7,
        endSpan: 7.2,
      },
    },
  );
}

function plush(parent, position, color, kitty = false) {
  const g = group(parent, position);
  ball(g, 0.19, color, [0, 0.15, 0], 1).scale.set(0.85, 1, 1);
  const head = ball(g, 0.22, kitty ? '#f3eee0' : color, [0, 0.42, 0], 1);
  head.scale.set(1.18, 0.91, 0.8);
  for (const side of [-1, 1]) {
    if (kitty) {
      const ear = mesh(g, new THREE.ConeGeometry(0.1, 0.2, 3), '#f3eee0', [side * 0.16, 0.59, 0]);
      ear.rotation.z = side * -0.25;
    } else ball(g, 0.085, color, [side * 0.18, 0.6, 0]);
    ball(g, 0.018, '#403c34', [side * 0.075, 0.43, 0.163]);
    ball(g, 0.065, color, [side * 0.18, 0.16, 0.02]);
  }
  if (kitty) {
    ball(g, 0.022, '#d8be69', [0, 0.4, 0.18]);
    for (const x of [-0.12, -0.05]) ball(g, 0.05, '#c97673', [x, 0.57, 0.13]);
  } else ball(g, 0.025, '#594a3c', [0, 0.38, 0.18]);
  return g;
}
export function shop() {
  const root = indoor({ floor: '#c5bba4', wall: '#c8b5aa' });
  const colors = ['#d4c9ac', '#a5b7b4', '#c7969d', '#d0ae76', '#a1af91', '#bac3d5'];
  for (let row = 0; row < 4; row++) {
    const y = 0.65 + row * 0.8;
    box(root, [10.9, 0.1, 0.55], '#e5d9be', [0, y, -3.95]);
    for (let col = 0; col < 15; col++)
      plush(
        root,
        [-4.95 + col * 0.7, y + 0.05, -3.85],
        colors[(row + col) % colors.length],
        col % 4 === 0,
      );
  }
  for (let row = 0; row < 3; row++) {
    box(root, [0.55, 0.1, 6], '#e2d4b7', [-5.5, 0.7 + row * 0.9, -0.4]);
    for (let i = 0; i < 7; i++) {
      const p = plush(
        root,
        [-5.4, 0.75 + row * 0.9, -3 + i * 0.8],
        colors[(row + i) % 6],
        i % 3 === 0,
      );
      p.rotation.y = Math.PI / 2;
    }
  }
  for (const [i, color] of ['#789db0', '#dba593', '#a7b49c'].entries())
    chair(root, [2.15 + i * 0.9, 0, 0.3], 0, color);
  const pair = couple(
    root,
    [
      [-1.1, 0, 1],
      [0.2, 0, 1],
    ],
    { popo: { coat: '#d3c7ab' }, xiaohe: { coat: '#bdb89b', hat: '#c8bea2' } },
  );
  const toyTable = table(root, [2.3, 0, 1.6], 1.2, 0.85, '#c7ac86');
  const toy = plush(root, [2.3, 0, 1.6], '#d6c1a7', true);
  toy.rotation.y = 0.12;
  toy.position.y += 0.953 - new THREE.Box3().setFromObject(toy).min.y;
  const photoTable = table(root, [2.2, 0, -1.15], 2.05, 0.85, '#c7ac86');
  const photo = picture(root, '/assets/yiwu.webp', [2.2, 1.785, -1.15], 1.55, 1.55);
  photo.userData.attachment = 'table';
  return sceneResult(
    root,
    ({ time, progress }) => {
      const walk = smooth(progress / 0.3);
      pair.p.root.position.x = -1.1 + walk * 0.5;
      pair.h.root.position.x = 0.2 + walk * 0.5;
      for (const [i, c] of [pair.p, pair.h].entries()) {
        c.pose({
          walk: Math.sin(walk * Math.PI) * 0.6,
          phase: time * 5 + i,
          reach: smooth((progress - 0.3) / 0.2) * 0.7,
        });
        c.head.rotation.y = Math.sin(time * 0.5) * 0.15;
      }
      pair.idle(time);
      revealPicture(photo, smooth((progress - 0.57) / 0.32));
    },
    {
      memories: { photo, photoTable, toy, toyTable, actors: [pair.p, pair.h] },
      view: {
        from: [11, 8, 16],
        to: [8, 5.7, 13],
        target: [0, 1.5, -0.3],
        endTarget: [0.6, 1.55, 0.6],
        span: 10.9,
        endSpan: 8.4,
      },
    },
  );
}

export function barbecue() {
  const root = indoor({ floor: '#87745d', wall: '#8a785d' });
  const diningTable = table(root, [0, 0, 0.65], 3.1, 1.9);
  const pair = diners(group(root, [0, 0, 0.24]));
  textSign(root, '新疆和田玉烧烤', 4.4, 0.7, [-0.2, 3.1, -4.27], '#566753', '#e8d4a0');
  textSign(root, '阿里烧烤', 1.5, 0.4, [4.7, 2.8, -4.25], '#765842', '#d9c199');
  for (const x of [-4.7, 4.7])
    for (let i = 0; i < 3; i++)
      box(root, [0.12, 0.95, 0.12], '#c3aa79', [x, 1.4 + i * 0.5, -4.2]).rotation.z = Math.PI / 4;
  cylinder(root, 0.6, 0.6, 0.035, '#d0b18a', [0, 0.9685, 0.65], 16);
  for (let i = 0; i < 9; i++) {
    const stick = box(root, [1.1, 0.02, 0.025], '#c9a566', [0, 1.0 + i * 0.008, 0.28 + i * 0.085]);
    stick.rotation.y = 0.12;
    for (let j = 0; j < 3; j++)
      ball(root, 0.075, ['#a85c3f', '#c28b4e', '#a67c4d'][i % 3], [
        -0.2 + j * 0.2,
        1.06 + i * 0.009,
        0.28 + i * 0.085,
      ]);
  }
  bottle(root, [-1.1, 0.951, 0.6], '#7a8353');
  bottle(root, [1.05, 0.951, 0.6], '#7a8353');
  const mugs = [beerMug(root, -1), beerMug(root, 1)];
  pendant(root, -2.7, 2.9, -1.3);
  pendant(root, 2.4, 2.7, 0.8);
  return sceneResult(
    root,
    ({ time, progress }) => {
      const a = clamp((progress - 5 / 12) / (1 - 5 / 12));
      const lift = smooth((a - 0.32) / 0.44);
      const together = smooth((a - 0.76) / 0.16);
      const hold = smooth(a / 0.32);
      pair.p.pose({ sit: 1 });
      pair.h.pose({ sit: 1 });
      pair.p.body.position.z = pair.h.body.position.z = lift * 0.1;
      pair.idle(time);
      pair.p.head.rotation.y = 0.17 + lift * 0.1;
      pair.h.head.rotation.y = -0.17 - lift * 0.1;
      pair.p.head.rotation.x = pair.h.head.rotation.x = lift * 0.04;
      for (const [i, character] of [pair.p, pair.h].entries()) {
        const mug = mugs[i];
        mug.root.position.set(
          mug.side * mix(0.4, mix(0.25, 0.132, together), lift),
          0.951 + lift * 0.2,
          mix(-0.16, -0.08, lift),
        );
        localHand(character, i ? 1 : 0, [mug.side * 0.28, 0.32, 0.08]);
        const resting = worldPoint(character.root, [-mug.side * 0.25, 0.34, 0.1]);
        const grip = worldPoint(mug.grip, [0, 0, 0]);
        // Clear the table edge before reaching forward, without passing through the chin.
        const forward = smooth((hold - 0.35) / 0.65);
        const hand = new THREE.Vector3(
          mix(resting.x, grip.x, forward),
          mix(resting.y, 1.04, smooth(hold / 0.4)) + (grip.y - 1.04) * smooth((hold - 0.65) / 0.35),
          mix(resting.z, grip.z, forward),
        );
        const elbow = worldPoint(character.root, [
          -mug.side * 0.65,
          mix(0.35, 0.85, smooth(hold / 0.5)),
          0.08,
        ]);
        reachHand(character, i ? 0 : 1, hand, 1, elbow);
      }
    },
    {
      contacts: { actors: [pair.p, pair.h], mugs, table: diningTable },
      theme: themes.warm,
      view: {
        from: [10, 8, 16],
        to: [7, 5.3, 13],
        target: [0, 1, -0.3],
        endTarget: [0, 1.5, -0.3],
        span: 10.4,
        endSpan: 7,
      },
    },
  );
}

export function coffee() {
  const root = indoor({ floor: '#c5c6b8', wall: '#deded1' });
  // An impression of an indoor coffee shop, with the confirmed three pour-overs.
  for (let i = 0; i < 4; i++) {
    box(root, [1.55, 2.75, 0.08], '#9ab7b4', [-3.9 + i * 1.8, 2.4, -4.27], { roughness: 0.35 });
    box(root, [0.05, 3.1, 0.12], '#c0bfaa', [-4.7 + i * 1.8, 2.4, -4.2]);
  }
  textSign(root, 'APARTMENT COFFEE', 4.1, 0.48, [1.7, 3.4, -4.1], '#deded1', '#697969');
  box(root, [3.5, 1.3, 1.2], '#b69e7b', [-3.5, 0.65, -2.6]);
  box(root, [3.6, 0.1, 1.3], '#d8d2bd', [-3.5, 1.35, -2.6]);
  for (let i = 0; i < 3; i++) {
    const x = -4.5 + i * 0.9;
    const dripper = mesh(
      root,
      new THREE.ConeGeometry(0.17, 0.3, 12, 1, true),
      '#e7e3d0',
      [x, 1.7, -2.6],
      { side: THREE.DoubleSide },
    );
    dripper.rotation.z = Math.PI;
    cup(root, [x, 1.4, -2.6]);
  }
  table(root, [0.2, 0, 0.65], 3.1, 1.9, '#c8b28f');
  const pair = diners(root);
  const cups = [
    cup(root, [-0.8, 0.951, 0.43]),
    cup(root, [0.2, 0.951, 0.5]),
    cup(root, [1.15, 0.951, 0.45]),
  ];
  const vapors = cups.map((c) => steam(c, [0, 0.25, 0]));
  const plant = group(root, [4.4, 0, -2.7]);
  cylinder(plant, 0.42, 0.3, 0.7, '#a69e83', [0, 0.35, 0], 10);
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    const leaf = ball(
      plant,
      0.38,
      '#83a082',
      [Math.cos(a) * 0.3, 1.25 + (i % 2) * 0.3, Math.sin(a) * 0.3],
      1,
    );
    leaf.scale.set(0.55, 1.4, 0.6);
  }
  return sceneResult(
    root,
    ({ time, progress }) => {
      pair.idle(time);
      cups.forEach((c, i) => {
        const appear = smooth((progress - i * 0.23) / 0.18);
        c.scale.setScalar(Math.max(0.001, appear));
        vapors[i](time);
      });
      pair.p.head.rotation.y = 0.14;
      pair.h.head.rotation.y = -0.14;
    },
    {
      contacts: { actors: [pair.p, pair.h] },
      view: {
        from: [11, 8, 15],
        to: [7, 5.1, 13],
        target: [0, 1.4, -0.2],
        endTarget: [0.1, 1.3, 0.2],
        span: 10.8,
        endSpan: 7.4,
      },
    },
  );
}

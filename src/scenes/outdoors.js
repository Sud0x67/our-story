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
  plane,
  base,
  tree,
  grassTuft,
  flower,
  table,
  chair,
  cup,
  walkway,
  smooth,
  mix,
  clamp,
  themes,
  sceneResult,
} from './kit.js';
import { seatOn } from './contacts.js';
import { couple, person, stroll, reachHand } from './characters.js';
import { natureDetails } from './landscape.js';

function crab(parent, position, scale = 1) {
  const g = group(parent, position);
  g.scale.setScalar(scale);
  const shell = ball(g, 0.12, '#a96e4e', [0, 0.075, 0], 0);
  shell.scale.set(1.3, 0.5, 1);
  for (const side of [-1, 1]) {
    for (let i = 0; i < 3; i++)
      tube(
        g,
        [
          [side * 0.1, 0.08, (i - 1) * 0.06],
          [side * 0.21, 0.035, (i - 1) * 0.11],
          [side * 0.26, 0.015, (i - 1) * 0.14],
        ],
        0.012,
        '#97634a',
      );
    tube(
      g,
      [
        [side * 0.08, 0.08, 0.1],
        [side * 0.2, 0.14, 0.2],
        [side * 0.21, 0.16, 0.27],
      ],
      0.02,
      '#b7825b',
    );
    const claw = ball(g, 0.055, '#c09264', [side * 0.21, 0.17, 0.28], 0);
    claw.scale.set(1, 0.7, 1.2);
    ball(g, 0.018, '#383e32', [side * 0.05, 0.13, 0.095]);
  }
  return g;
}
function bucket(parent, position) {
  const g = group(parent, position);
  const profile = [
    [0, 0],
    [0.25, 0],
    [0.264, 0.035],
    [0.33, 0.46],
    [0.307, 0.46],
    [0.241, 0.045],
    [0, 0.045],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const shell = mesh(g, new THREE.LatheGeometry(profile, 28), '#abc2b6');
  shell.userData.bucketShell = true;
  const rim = mesh(g, new THREE.TorusGeometry(0.319, 0.018, 8, 32), '#d2d6bc', [0, 0.46, 0]);
  rim.rotation.x = Math.PI / 2;
  const handle = group(g, [0, 0.435, 0]);
  const arc = Array.from({ length: 17 }, (_, i) => {
    const angle = -Math.PI / 2 + (i * Math.PI) / 16;
    return [Math.sin(angle) * 0.32, Math.cos(angle) * 0.35, 0];
  });
  tube(handle, arc, 0.014, '#6c8777');
  for (const side of [-1, 1]) ball(handle, 0.025, '#708e7e', [side * 0.32, 0, 0], 1);
  const grip = cylinder(handle, 0.029, 0.029, 0.15, '#d5c7a6', [0, 0.35, 0], 12);
  grip.rotation.z = Math.PI / 2;
  const held = group(g, [0, 0.785, 0]);
  const water = mesh(g, new THREE.CircleGeometry(0.248, 28), '#8ba99e', [0, 0.072, 0], {
    transparent: true,
    opacity: 0.36,
    depthWrite: false,
  });
  water.rotation.x = -Math.PI / 2;
  water.castShadow = false;
  const catchCrabs = [];
  for (const [i, [x, z]] of [
    [-0.12, 0.075],
    [0.11, 0.08],
    [-0.1, -0.105],
    [0.12, -0.1],
    [0, -0.005],
  ].entries()) {
    const caught = crab(g, [x, 0.05, z], 0.3);
    caught.rotation.y = i * 1.7;
    catchCrabs.push(caught);
  }
  g.userData.held = held;
  g.userData.catchCrabs = catchCrabs;
  g.userData.shell = shell;
  return g;
}
export function crabs() {
  const root = new THREE.Group();
  base(root, 17, 11, '#a59c7e');
  plane(root, 180, 220, '#8ba29b', [90.8, 0.015, 0], { roughness: 0.35, metalness: 0.15 });
  const puddles = [];
  for (let i = 0; i < 8; i++) {
    const m = mesh(
      root,
      new THREE.CircleGeometry(0.5 + (i % 3) * 0.22, 9),
      '#93a89a',
      [-5 + (i % 4) * 2.3, 0.035, -2 + Math.floor(i / 4) * 3],
      { roughness: 0.4 },
    );
    m.rotation.x = -Math.PI / 2;
    m.scale.y = 0.6;
    puddles.push(m);
  }
  const smallCrabs = [];
  for (let i = 0; i < 9; i++) {
    const c = crab(root, [-4 + (i % 4) * 1.5, 0, -2 + Math.floor(i / 4) * 1.8], 0.9);
    c.position.y += 0.012 - new THREE.Box3().setFromObject(c).min.y;
    smallCrabs.push(c);
  }
  const pair = couple(
    root,
    [
      [-1.1, 0.03, 1.6],
      [0.25, 0.0288, 1.6],
    ],
    { popo: { coat: '#c9b798' }, xiaohe: { coat: '#a8b9b8' } },
  );
  const pail = bucket(root, [0.9, 0.012, 1.89]);
  const tool = group(pair.p.arms[0].hand, [0, -0.04, 0.1]);
  cylinder(tool, 0.012, 0.012, 0.65, '#b9b69b', [0, 0, 0.2], 4).rotation.x = Math.PI / 2;
  box(tool, [0.1, 0.025, 0.16], '#a9aba0', [0, 0, 0.55]);
  natureDetails(root, 'crabs');
  const crabOrigins = smallCrabs.map((c) => c.position.x);
  return sceneResult(
    root,
    ({ time, progress }) => {
      const lift = smooth((progress - 0.48) / 0.26);
      pair.p.pose({ lean: (1 - lift) * 0.55, reach: 0.18 });
      pair.h.pose({ lean: (1 - lift) * 0.35 });
      pair.idle(time);
      pair.p.root.rotation.y = 0.25;
      pair.h.root.rotation.y = -0.25;
      pail.position.set(mix(0.9, 0.94, lift), 0.012 + lift * 0.21, mix(1.89, 1.9, lift));
      const held = pail.userData.held.getWorldPosition(new THREE.Vector3());
      reachHand(pair.h, 1, held);
      smallCrabs.forEach((c, i) => {
        c.position.x = crabOrigins[i] + Math.sin(time * 0.8 + i) * 0.075;
        c.rotation.y = Math.sin(time * 0.3 + i) * 0.15;
      });
    },
    {
      contacts: { actors: [pair.p, pair.h], pail, held: pail.userData.held, smallCrabs, tool },
      waterHeight: 0.024,
      interactionAnchor: () => pail.localToWorld(new THREE.Vector3(0, 0.9, 0)),
      theme: themes.dusk,
      view: {
        from: [13, 11, 18],
        to: [5.8, 11, 10.5],
        target: [0, 0.8, 0],
        endTarget: [0.3, 0.85, 1.65],
        span: 12.1,
        endSpan: 7.5,
      },
    },
  );
}

export function stars() {
  const root = new THREE.Group();
  base(root, 13, 8, '#384b47');
  tree(root, -4.8, -2.5, 1.25, 'pine');
  tree(root, 5.2, -2.6, 1, 'pine');
  for (let i = 0; i < 7; i++) {
    const rock = ball(root, 0.5, '#52615a', [-5 + i * 1.6, 0.16, -2.8], 0);
    rock.scale.y = 0.6;
  }
  const pair = couple(
    root,
    [
      [-1, 0, 1],
      [0.5, 0, 1],
    ],
    {
      popo: { rotation: Math.PI, coat: '#a5aaa2' },
      xiaohe: { rotation: Math.PI, coat: '#a1b8c4' },
    },
  );
  const tripod = group(root, [1.65, 0, -0.45]);
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    tube(
      tripod,
      [
        [0, 1.23, 0],
        [Math.cos(a) * 0.46, 0.03, Math.sin(a) * 0.46],
      ],
      0.025,
      '#a7b6ac',
    );
  }
  box(tripod, [0.38, 0.25, 0.25], '#333f3c', [0, 1.38, 0]);
  const lens = cylinder(tripod, 0.1, 0.1, 0.23, '#6e837c', [0, 1.38, -0.23], 12);
  lens.rotation.x = Math.PI / 2;
  const vertices = [],
    colors = [];
  for (let i = 0; i < 1350; i++) {
    const u = (Math.sin(i * 127.1 + 17) * 43758.5453) % 1;
    const v = (Math.sin(i * 311.7 + 43) * 23421.631) % 1;
    const x = (Math.abs(u) - 0.5) * 48,
      y = 2 + Math.abs(v) * 23,
      z = -12 - ((i * 17) % 100) / 10;
    vertices.push(x, y, z);
    const col = new THREE.Color(i % 7 === 0 ? '#eed5b0' : i % 3 === 0 ? '#adc5da' : '#dce4d8');
    colors.push(col.r, col.g, col.b);
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  starGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  const sky = new THREE.Points(
    starGeo,
    new THREE.PointsMaterial({
      size: 1.9,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: false,
      depthWrite: false,
    }),
  );
  root.add(sky);
  const galaxyPositions = [];
  for (let i = 0; i < 1700; i++) {
    const x = -24 + ((i % 170) / 170) * 48;
    const noise = Math.sin(i * 127.1) * Math.cos(i * 41.7);
    galaxyPositions.push(
      x,
      7 + x * 0.13 + noise * (1.2 + Math.sin(i) * 0.7),
      -19 + Math.sin(i * 0.45) * 2.5,
    );
  }
  const galaxyGeo = new THREE.BufferGeometry();
  galaxyGeo.setAttribute('position', new THREE.Float32BufferAttribute(galaxyPositions, 3));
  const galaxy = new THREE.Points(
    galaxyGeo,
    new THREE.PointsMaterial({
      color: '#c1bcd5',
      size: 1.6,
      transparent: true,
      opacity: 0.4,
      sizeAttenuation: false,
      depthWrite: false,
    }),
  );
  root.add(galaxy);
  const cloudCanvas = document.createElement('canvas');
  cloudCanvas.width = 512;
  cloudCanvas.height = 128;
  const ctx = cloudCanvas.getContext('2d');
  ctx.scale(1, 0.25);
  const glow = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
  glow.addColorStop(0, 'rgba(190,184,219,.35)');
  glow.addColorStop(0.45, 'rgba(156,173,203,.18)');
  glow.addColorStop(1, 'rgba(128,155,195,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 512, 512);
  const cloudTexture = new THREE.CanvasTexture(cloudCanvas);
  const cloud = mesh(
    root,
    new THREE.PlaneGeometry(42, 6),
    new THREE.MeshBasicMaterial({
      map: cloudTexture,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
    [0, 7, -19.2],
  );
  cloud.rotation.z = 0.13;
  cloud.castShadow = false;
  const meteor = line(
    root,
    [
      [0, 0, 0],
      [1.6, 1.0, 0],
    ],
    '#e9dfc8',
  );
  meteor.material.transparent = true;
  meteor.material.opacity = 0;
  meteor.userData.meteor = true;
  natureDetails(root, 'stars');
  return sceneResult(
    root,
    ({ time, progress }) => {
      pair.idle(time);
      pair.p.head.rotation.x = -0.18;
      pair.h.head.rotation.x = -0.18;
      sky.rotation.z = Math.sin(time * 0.012) * 0.015;
      galaxy.material.opacity = 0.4 + Math.sin(time * 0.22) * 0.035;
      const m = clamp((progress - 0.49) / 0.12);
      meteor.material.opacity = m > 0 && m < 1 ? Math.sin(m * Math.PI) * 0.95 : 0;
      meteor.position.set(mix(7, -3, m), mix(12, 6, m), -12);
    },
    {
      nativeInteraction: true,
      memories: { meteor },
      theme: {
        ...themes.night,
        background: '#0d1b2b',
        bottom: '#102e30',
        ambient: 0.65,
        intensity: 1.1,
      },
      view: {
        from: [10, 6.5, 17],
        to: [7, 5, 15],
        target: [0, 4, -2],
        endTarget: [0, 5, -4],
        span: 14,
        endSpan: 13.7,
      },
    },
  );
}

export function camp() {
  const root = new THREE.Group();
  base(root, 16, 11, '#93a978');
  for (const [x, z, s] of [
    [-6, -3, 1.4],
    [5.8, -2.9, 1.2],
    [-6, 3, 1],
    [6.1, 3, 0.9],
  ])
    tree(root, x, z, s);
  for (let i = 0; i < 16; i++)
    flower(root, -6 + (i % 6) * 2.1, -3 + Math.floor(i / 6) * 2.8, i % 2 ? '#d9c897' : '#bba4a0');
  const canopy = group(root, [0, 0, -0.3]);
  for (const x of [-4.2, 4.2])
    for (const z of [-2.7, 2.7]) cylinder(canopy, 0.025, 0.04, 3.7, '#a9a88b', [x, 1.85, z], 6);
  const corners = [
      [-4.2, 3.7, -2.7],
      [4.2, 3.7, -2.7],
      [4.2, 3.7, 2.7],
      [-4.2, 3.7, 2.7],
    ],
    roof = [];
  for (let i = 0; i < 4; i++) roof.push(...corners[i], 0, 4.35, 0, ...corners[(i + 1) % 4]);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(roof, 3));
  geo.computeVertexNormals();
  mesh(canopy, geo, '#e4d6b4', [0, 0, 0], { side: THREE.DoubleSide });
  table(root, [0, 0, 0.35], 2.8, 1.9, '#bba67d');
  for (const [x, z, yaw] of [
    [-0.7, -1.18, 0],
    [0.7, -1.18, 0],
    [-2.02, 0.5, Math.PI / 2],
    [2.02, 0.5, -Math.PI / 2],
  ])
    chair(root, [x, 0, z], yaw, '#b6b99b');
  const pair = couple(root, [
    [-0.7, 0.54, -1],
    [0.7, 0.54, -1],
  ]);
  const friends = [
    person(root, 'friend-boy', [-1.85, 0.54, 0.5], {
      rotation: Math.PI / 2,
      coat: '#879b81',
      hair: '#665a43',
    }),
    person(root, 'friend-girl', [1.85, 0.54, 0.5], {
      rotation: -Math.PI / 2,
      coat: '#c5a698',
      hair: '#665044',
    }),
  ];
  seatOn(pair.p, 0.6, [-0.7, -1.18]);
  seatOn(pair.h, 0.6, [0.7, -1.18]);
  seatOn(friends[0], 0.6, [-2.02, 0.5], Math.PI / 2);
  seatOn(friends[1], 0.6, [2.02, 0.5], -Math.PI / 2);
  const cards = [];
  for (let i = 0; i < 5; i++) {
    const g = group(root, [-0.7 + i * 0.35, 0.958, 0.45]);
    box(g, [0.24, 0.015, 0.34], '#f0e5ce', [0, 0, 0]);
    const suit = ball(g, 0.04, i % 2 ? '#a36355' : '#47564b', [0, 0.02, 0], 0);
    suit.scale.set(1, 0.12, 1);
    cards.push(g);
  }
  for (const x of [-0.7, 0.7]) cup(root, [x, 0.951, -0.2], '#b7b39a');
  natureDetails(root, 'camp');
  return sceneResult(
    root,
    ({ time, action = 0 }) => {
      for (const c of [pair.p, pair.h, ...friends]) {
        c.pose({ sit: 1 });
        c.idle(time);
        c.arms[0].shoulder.rotation.x = -0.65 + Math.sin(time * 0.7) * 0.05;
      }
      cards[4].rotation.z = Math.sin(time * 0.4) * 0.015;
      cards[4].rotation.x = action * Math.PI * 2;
      cards[4].position.y = 0.958 + Math.sin(action * Math.PI) * 0.36;
    },
    {
      contacts: { actors: [pair.p, pair.h, ...friends] },
      view: {
        from: [12, 9, 17],
        to: [9, 6, 15],
        target: [0, 1.2, 0.1],
        endTarget: [0, 1.5, 0],
        span: 12.5,
        endSpan: 8.5,
      },
    },
  );
}

function swan(parent, position, baby = false) {
  const g = group(parent, position);
  if (baby) g.scale.setScalar(0.43);
  const color = baby ? '#b6b5a3' : '#364840';
  const body = ball(g, 0.42, color, [0, 0.28, 0], 1);
  body.scale.set(1, 0.62, 1.5);
  for (const side of [-1, 1]) {
    const wing = ball(g, 0.3, baby ? '#c4c2af' : '#465b4d', [side * 0.22, 0.36, -0.05], 0);
    wing.scale.set(0.5, 0.65, 1.4);
  }
  tube(
    g,
    [
      [0, 0.4, 0.38],
      [0, 0.7, 0.46],
      [0, 1.0, 0.3],
      [0, 1.17, 0.42],
      [0, 1.14, 0.58],
    ],
    0.085,
    color,
  );
  ball(g, 0.125, color, [0, 1.14, 0.59], 1);
  const beak = mesh(
    g,
    new THREE.ConeGeometry(0.06, 0.2, 5),
    baby ? '#928f71' : '#be7862',
    [0, 1.12, 0.77],
  );
  beak.rotation.x = Math.PI / 2;
  for (const side of [-1, 1]) ball(g, 0.017, '#1d3129', [side * 0.105, 1.18, 0.65]);
  return g;
}
export function swans() {
  const root = new THREE.Group();
  base(root, 17, 11, '#779d80');
  box(root, [220, 0.09, 160], '#709b90', [0, -0.01, -77.9], { roughness: 0.35, metalness: 0.12 });
  box(root, [220, 0.09, 2.2], '#bcb493', [0, 0.19, 2.9]);
  for (let i = 0; i < 38; i++) box(root, [0.4, 0.11, 2.2], '#bcb493', [-7.7 + i * 0.42, 0.2, 2.9]);
  for (let i = 0; i < 9; i++) {
    const x = -7.5 + i * 1.8;
    cylinder(root, 0.035, 0.04, 0.85, '#7f8469', [x, 0.7, 1.82], 6);
    if (i < 8) box(root, [1.8, 0.055, 0.06], '#959c7c', [x + 0.9, 1.1, 1.82]);
  }
  for (const [x, z, s] of [
    [-6, -3.9, 1.3],
    [-2.7, -4.1, 1.5],
    [4.4, -4.1, 1.3],
    [7, 3.7, 0.8],
  ])
    tree(root, x, z, s);
  const pair = couple(
    root,
    [
      [-0.6, 0.3, 2.8],
      [0.65, 0.3, 2.8],
    ],
    { popo: { rotation: Math.PI }, xiaohe: { rotation: Math.PI } },
  );
  const birds = [swan(root, [-0.7, 0.08, -0.7]), swan(root, [0.7, 0.08, -1.5])];
  for (let i = 0; i < 8; i++)
    birds.push(swan(root, [-2 + (i % 4) * 0.65, 0.08, -2.8 + Math.floor(i / 4) * 0.6], true));
  const ripples = [];
  birds.forEach((b) => {
    const ring = mesh(
      root,
      new THREE.RingGeometry(0.39, 0.405, 32),
      new THREE.MeshBasicMaterial({
        color: '#c5d8bc',
        transparent: true,
        opacity: 0.22,
        side: THREE.DoubleSide,
      }),
      [b.position.x, 0.065, b.position.z],
    );
    ring.rotation.x = -Math.PI / 2;
    ring.scale.y = 1.4;
    ripples.push(ring);
  });
  natureDetails(root, 'swans');
  const birdOrigins = birds.map((b) => b.position.x);
  return sceneResult(
    root,
    ({ time, action = 0 }) => {
      pair.idle(time);
      birds.forEach((b, i) => {
        b.position.x =
          birdOrigins[i] + Math.sin(time * 0.2 + i) * 0.22 + action * (i > 1 ? 0.65 : 0.35);
        b.rotation.y = 0.35 + Math.sin(time * 0.2 + i) * 0.12;
        b.position.y = 0.08 + Math.sin(time * 1.1 + i) * 0.015;
      });
      ripples.forEach((r, i) => {
        r.position.x = birds[i].position.x;
        const scale = 1 + Math.sin(time * 0.8 + i) * 0.09;
        r.scale.set(scale, scale * 1.4, 1);
      });
    },
    {
      memories: { birds, ripples },
      view: {
        from: [12, 10, 18],
        to: [9, 6.8, 15],
        target: [0, 1, 0],
        endTarget: [0, 1, -0.6],
        span: 12.8,
        endSpan: 9.3,
      },
    },
  );
}

export function forest() {
  const root = new THREE.Group();
  base(root, 16, 12, '#739273');
  walkway(
    root,
    [
      [-4.5, 4.3],
      [-1, 2],
      [0.6, -0.2],
      [2.3, -3.5],
    ],
    1.0,
    '#b6b191',
  );
  for (const [x, z, s] of [
    [-6.2, -3.7, 2.5],
    [-2.8, -4, 3.2],
    [2.1, -4.5, 3],
    [6, -3, 2.6],
    [-6.5, 2.3, 2.2],
    [6.3, 2.7, 2.7],
  ]) {
    tree(root, x, z, s);
    for (let j = 0; j < 4; j++) {
      const a = (j * Math.PI) / 2;
      tube(
        root,
        [
          [x, 0.6, z],
          [x + Math.cos(a) * 0.7, 0.12, z + Math.sin(a) * 0.7],
          [x + Math.cos(a) * 1.1, 0.04, z + Math.sin(a) * 1.1],
        ],
        0.08,
        '#6d6c4e',
      );
    }
  }
  for (let i = 0; i < 34; i++)
    grassTuft(root, -6 + (i % 9) * 1.4, -4 + Math.floor(i / 9) * 2.5, 0, '#9baa76');
  const pair = couple(
    root,
    [
      [-2, 0, 2],
      [-0.9, 0, 2.2],
    ],
    { popo: { coat: '#b9b79a' }, xiaohe: { coat: '#b6c4b0' } },
  );
  natureDetails(root, 'forest');
  return sceneResult(
    root,
    ({ time, progress, phase }) => {
      const t = smooth(progress),
        walk = phase === 'waiting' || phase === 'settled' ? 0 : 0.55;
      for (const [i, c] of [pair.p, pair.h].entries()) {
        c.root.position.set(-2 + i * 1.1 + t * 1.5, 0.0455, 2.4 - t * 2.2);
        c.root.rotation.y = 2.8;
        c.pose({ walk, phase: t * 2.66 * 12.8 + i * 0.7 });
        stroll(c, t * 2.66, walk);
      }
      pair.idle(time);
    },
    {
      view: {
        from: [12, 7.5, 19],
        to: [8, 6.3, 16],
        target: [0, 2.6, 0],
        endTarget: [0, 2.7, -0.1],
        span: 14.5,
        endSpan: 11.6,
      },
    },
  );
}

export { beach } from './beach.js';

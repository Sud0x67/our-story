import {
  THREE,
  group,
  mesh,
  box,
  cylinder,
  tube,
  line,
  base,
  grassTuft,
  smooth,
  mix,
  clamp,
  sceneResult,
} from './kit.js';
import { couple, reachHand } from './characters.js';
import { seatOn, worldPoint } from './contacts.js';
import { natureDetails } from './landscape.js';

const shore = (x) => Math.sin(x * 0.38) * 0.12 + Math.sin(x * 0.71) * 0.06;

// A curved strip keeps the shallow water and foam attached to the same shoreline.
function coastalStrip(parent, front, back, height, color, opacity = 1, width = 220) {
  const positions = [],
    indices = [],
    segments = 110;
  for (let i = 0; i <= segments; i++) {
    const x = (i / segments - 0.5) * width;
    positions.push(x, height, shore(x) + front, x, height, shore(x) + back);
    if (i < segments) {
      const n = i * 2;
      indices.push(n, n + 2, n + 1, n + 1, n + 2, n + 3);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const strip = mesh(parent, geometry, color, [0, 0, 0], {
    transparent: opacity < 1,
    opacity,
    depthWrite: opacity === 1,
    roughness: 0.48,
    side: THREE.DoubleSide,
  });
  strip.castShadow = false;
  return strip;
}

function palm(parent, x, z, scale) {
  const root = group(parent, [x, 0, z]);
  root.scale.setScalar(scale);
  tube(
    root,
    [
      [0, 0, 0],
      [0.12, 1.3, 0],
      [0.35, 2.8, 0.02],
      [0.55, 4, 0.04],
    ],
    0.13,
    '#ad8d62',
  );
  const crown = group(root, [0.55, 4.05, 0.04]);
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2,
      vertices = [];
    for (const [r, y, w] of [
      [0, 0, 0],
      [0.65, 0.22, 0.18],
      [1.3, -0.05, 0.22],
      [1.9, -0.55, 0],
    ]) {
      for (const side of [-1, 1])
        vertices.push(
          Math.cos(a) * r + Math.sin(a) * w * side,
          y,
          Math.sin(a) * r - Math.cos(a) * w * side,
        );
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex([0, 1, 2, 1, 3, 2, 2, 3, 4, 3, 5, 4, 4, 5, 6, 5, 7, 6]);
    geometry.computeVertexNormals();
    mesh(crown, geometry, i % 2 ? '#6c9368' : '#87a574', [0, 0, 0], { side: THREE.DoubleSide });
  }
  return crown;
}

function lounger(parent, x, z) {
  const root = group(parent, [x, 0, z]);
  const seat = box(root, [0.88, 0.12, 1.9], '#ddd1af', [0, 0.42, 0.2]);
  const back = box(root, [0.88, 0.08, 1.15], '#ddd1af', [
    0,
    0.48 + 0.575 * Math.cos(0.75) - 0.045 * Math.sin(0.75),
    -0.575 * Math.sin(0.75) - 0.045 * Math.cos(0.75),
  ]);
  back.rotation.x = Math.PI / 2 - 0.75;
  const armrests = [];
  for (const side of [-1, 1]) {
    box(root, [0.065, 0.1, 1.95], '#a78f68', [side * 0.38, 0.35, 0.2]);
    for (const depth of [-0.6, 0.8])
      box(root, [0.06, 0.42, 0.06], '#927d5b', [side * 0.34, 0.21, depth]);
    for (const depth of [-0.25, 0.4])
      box(root, [0.055, 0.28, 0.055], '#a78f68', [side * 0.41, 0.58, depth]);
    armrests.push(box(root, [0.14, 0.07, 0.94], '#bba179', [side * 0.41, 0.705, 0.1]));
  }
  return { root, seat, back, armrests };
}

function sailboat(parent) {
  const root = group(parent, [-5.2, -0.05, -10]);
  box(root, [1.05, 0.16, 0.38], '#d2b078', [0, 0.14, 0]);
  box(root, [0.8, 0.035, 0.29], '#f1dfb8', [0, 0.24, 0]);
  cylinder(root, 0.015, 0.018, 1.3, '#a18962', [0, 0.87, 0], 6);
  for (const side of [-1, 1]) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(
        [side * 0.04, 0.39, 0.015, side * 0.04, 1.48, 0.015, side * 0.5, 0.39, 0.015],
        3,
      ),
    );
    geometry.computeVertexNormals();
    mesh(root, geometry, side < 0 ? '#eee6ce' : '#e0c595', [0, 0, 0], { side: THREE.DoubleSide });
  }
  return root;
}

export function beach() {
  const root = new THREE.Group();
  base(root, 18, 12, '#d5c49e');
  const sea = box(root, [220, 0.1, 180], '#75a7a3', [0, -0.02, -93], { roughness: 0.42 });
  sea.castShadow = false;
  coastalStrip(root, 0.62, -1.2, 0.019, '#b8b796');
  coastalStrip(root, 0.06, -4, 0.034, '#90b9ad');
  coastalStrip(root, -1.45, -5, 0.037, '#84b1a8');
  const swash = coastalStrip(root, 0, -1.8, 0.041, '#a8c9ba', 0.58);
  const foam = coastalStrip(root, 0.015, -0.055, 0.047, '#e9edda', 0.7);
  const foamTrail = coastalStrip(root, 0.02, -0.025, 0.043, '#e2e8cf', 0.3);
  const foamBeads = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), foam.material, 64);
  foamBeads.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  foamBeads.castShadow = false;
  root.add(foamBeads);
  const ripples = [];
  for (let i = 0; i < 7; i++)
    ripples.push(
      coastalStrip(
        root,
        0,
        -0.022 - i * 0.004,
        0.044 + i * 0.001,
        '#d4e5d6',
        0.16 + (i % 2) * 0.07,
      ),
    );

  const crowns = [
    palm(root, -5.8, 4.2, 1.1),
    palm(root, 6, 4.5, 1.03),
    palm(root, -8.5, 1.8, 0.72),
    palm(root, 8.4, 2, 0.76),
  ];
  const chairs = [lounger(root, -1.1, 2.2), lounger(root, 1.1, 2.2)];
  const pair = couple(
    root,
    [
      [-1.1, 0, 2.2],
      [1.1, 0, 2.2],
    ],
    {
      popo: { coat: '#dad6bc', pants: '#7d9b9a' },
      xiaohe: { coat: '#aac4c2', pants: '#c9c5a5' },
    },
  );
  const actors = [pair.p, pair.h];
  actors.forEach((c, i) => seatOn(c, 0.48, [chairs[i].root.position.x, 2.2]));
  natureDetails(root, 'beach');
  for (const [x, z] of [
    [-5.1, 4.3],
    [-6.8, 3.7],
    [5.6, 5.2],
    [7.5, 3.3],
  ])
    grassTuft(root, x, z, 0.01, '#a7ad7d');
  const boat = sailboat(root);
  const glints = [];
  // One instanced mesh avoids a separate draw call for every patch of sunlight.
  const glintMaterial = new THREE.MeshBasicMaterial({
    color: '#e0ebd4',
    transparent: true,
    opacity: 0.38,
    depthWrite: false,
  });
  const sparkle = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), glintMaterial, 28);
  sparkle.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  const stamp = new THREE.Object3D();
  for (let i = 0; i < sparkle.count; i++) {
    const x = -8.8 + (i % 7) * 2.7 + Math.sin(i * 1.8) * 0.6,
      z = -3.5 - Math.floor(i / 7) * 2.5;
    stamp.position.set(x, 0.051, z);
    stamp.rotation.x = -Math.PI / 2;
    stamp.scale.set(0.13 + (i % 3) * 0.08, 0.018, 1);
    stamp.updateMatrix();
    sparkle.setMatrixAt(i, stamp.matrix);
    glints.push({ x, z });
  }
  root.add(sparkle);
  const birds = group(root, [1.5, 3.3, -10]);
  for (let i = 0; i < 3; i++)
    line(
      birds,
      [
        [-0.16, 0, 0],
        [0, -0.045, 0],
        [0.16, 0, 0],
      ],
      '#b2ae92',
    ).position.set(i * 0.55, (i % 2) * 0.28, -i * 0.25);

  return sceneResult(
    root,
    ({ time = 0, progress = 0 }) => {
      // Use the story clock so normal playback, autoplay, paused previews and replay agree.
      const a = clamp((progress - 6 / 16) / (1 - 6 / 16));
      const rollIn = smooth(a / 0.48),
        rollOut = smooth((a - 0.5) / 0.5);
      const arrival = rollIn * (1 - rollOut);
      const crest = mix(-1.3, 0.35, arrival) + Math.sin(time * 0.48) * 0.07;
      swash.position.z = crest;
      swash.material.opacity = 0.4 + arrival * 0.2;
      foam.position.z = crest;
      foam.material.opacity = 0.46 + arrival * 0.32;
      for (let i = 0; i < foamBeads.count; i++) {
        const x = -11 + (i / (foamBeads.count - 1)) * 22 + Math.sin(i * 2.3) * 0.07;
        stamp.position.set(x, 0.049, shore(x) + crest + Math.sin(i * 1.9) * 0.025);
        stamp.rotation.set(0, 0, 0);
        stamp.scale.set(0.025 + (i % 3) * 0.013, 0.006, 0.019 + (i % 2) * 0.01);
        stamp.updateMatrix();
        foamBeads.setMatrixAt(i, stamp.matrix);
      }
      foamBeads.instanceMatrix.needsUpdate = true;
      foamTrail.position.z = mix(-1.1, 0.38, rollIn);
      foamTrail.material.opacity = Math.sin(rollOut * Math.PI) * 0.3;
      ripples.forEach((r, i) => {
        r.position.z = -2.1 - i * 1.1 + Math.sin(time * 0.45 - i * 0.8) * 0.15 + arrival * 0.18;
      });
      crowns.forEach((crown, i) => {
        crown.rotation.z = Math.sin(time * 0.55 + i) * (0.015 + arrival * 0.016);
        crown.rotation.x = Math.cos(time * 0.43 + i) * 0.012;
      });
      boat.position.x = -5.2 + Math.sin(time * 0.06) * 1.3;
      boat.position.y = -0.05 + Math.sin(time * 0.9) * 0.008;
      boat.rotation.z = Math.sin(time * 0.9) * 0.018;
      birds.position.x = 1.5 + Math.sin(time * 0.07) * 2;
      birds.position.y = 3.3 + Math.sin(time * 0.5) * 0.06;
      glints.forEach(({ x, z }, i) => {
        stamp.position.set(x, 0.051, z + Math.sin(time * 0.55 + i) * 0.07);
        stamp.rotation.set(-Math.PI / 2, 0, 0);
        stamp.scale.set(
          (0.13 + (i % 3) * 0.08) * (0.65 + Math.sin(time * 1.1 + i * 2) ** 2 * 0.65),
          0.018,
          1,
        );
        stamp.updateMatrix();
        sparkle.setMatrixAt(i, stamp.matrix);
      });
      sparkle.instanceMatrix.needsUpdate = true;
      for (const [i, c] of actors.entries()) {
        c.pose({ sit: 1, recline: 1 });
        c.body.position.set(0, 0.6, -0.12);
        c.head.position.set(0, 0.71, 0.16);
        c.head.rotation.y = (i ? -1 : 1) * (0.055 + arrival * 0.07);
        c.head.rotation.x = 0.07;
        for (const leg of c.legs) {
          leg.hip.rotation.set(-Math.PI / 2, 0, 0);
          leg.knee.rotation.set(0, 0, 0);
          leg.shoe.rotation.x = Math.PI / 2;
          leg.shoe.position.z = -0.045;
        }
        for (let side = 0; side < 2; side++) {
          const sign = side ? 1 : -1;
          reachHand(
            c,
            side,
            worldPoint(chairs[i].root, [sign * 0.41, 0.74 + 0.084 * c.root.scale.y, 0.31]),
            1,
            worldPoint(chairs[i].root, [sign * 0.58, 1.03, 0.02]),
          );
        }
      }
      pair.idle(time);
    },
    {
      nativeInteraction: true,
      contacts: { actors, chairs, swash, foam, foamTrail, crowns, boat },
      view: {
        from: [11, 8.5, 18],
        to: [8.5, 7.2, 17],
        target: [0, 0.9, -0.3],
        endTarget: [0, 1, 1],
        span: 13.5,
        endSpan: 11.6,
      },
    },
  );
}

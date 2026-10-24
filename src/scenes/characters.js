import { THREE, group, mesh, box, ball, cylinder, tube, material, clamp, mix } from './kit.js';

function glasses(head) {
  for (const x of [-0.16, 0.16])
    tube(
      head,
      [
        [x - 0.125, 0.075, 0.455],
        [x + 0.125, 0.075, 0.455],
        [x + 0.125, -0.09, 0.455],
        [x - 0.125, -0.09, 0.455],
        [x - 0.125, 0.075, 0.455],
      ],
      0.012,
      '#5b584a',
    );
  box(head, [0.08, 0.022, 0.025], '#5b584a', [0, 0, 0.46]);
}

export function person(parent, type = 'popo', position = [0, 0, 0], options = {}) {
  const girl = type === 'xiaohe' || type === 'friend-girl';
  const root = group(parent, position, options.rotation || 0);
  root.scale.setScalar(options.scale || (girl ? 0.94 : 1));
  const coat = options.coat || (girl ? '#9bbdcc' : '#cfbc99');
  const skin = options.skin || '#f0ccad',
    hair = options.hair || '#2b2b29';
  const body = group(root, [0, 0.86, 0]);
  const torso = cylinder(
    body,
    0.25,
    0.32,
    options.long ? 0.85 : 0.62,
    coat,
    [0, options.long ? -0.1 : 0, 0],
    8,
  );
  if (options.long) {
    for (const side of [-1, 1])
      box(body, [0.16, 0.29, 0.045], '#a88968', [side * 0.16, 0.13, 0.25]).rotation.z = side * 0.2;
  } else if (options.puffer) {
    for (let i = 0; i < 4; i++) {
      const ring = mesh(body, new THREE.TorusGeometry(0.285, 0.018, 4, 8), coat, [
        0,
        -0.23 + i * 0.14,
        0,
      ]);
      ring.rotation.x = Math.PI / 2;
    }
  }
  const seam = box(body, [0.025, 0.5, 0.025], girl ? coat : '#9e947e', [0, -0.02, 0.29]);
  const head = group(body, [0, 0.65, 0]);
  const back = ball(head, girl ? 0.468 : 0.45, hair, [0, 0.06, -0.055], 1);
  back.scale.set(1, girl ? 1.08 : 1.02, 0.94);
  const face = ball(head, girl ? 0.4 : 0.39, skin, [0, 0, 0.075], 2);
  face.scale.set(1, 1, 0.98);
  if (girl) {
    for (const side of [-1, 1]) {
      const bob = ball(head, 0.19, hair, [side * 0.32, -0.12, -0.035], 1);
      bob.scale.set(0.65, 1.5, 0.95);
    }
  }
  for (let i = 0; i < 5; i++) {
    const fringe = box(head, [0.135, 0.18 + Math.abs(i - 2) * 0.015, 0.11], hair, [
      (i - 2) * 0.122,
      0.27,
      0.3,
    ]);
    fringe.rotation.z = (i - 2) * -0.08;
  }
  const eyes = [];
  for (const side of [-1, 1]) {
    const eye = group(head, [side * 0.16, -0.015, 0.432]);
    eyes.push(eye);
    if (girl) {
      const white = ball(eye, 0.105, '#fff9ee', [0, 0, 0], 2);
      white.scale.set(0.9, 1.14, 0.28);
      const iris = ball(eye, 0.074, '#55402e', [0, -0.008, 0.025], 2);
      iris.scale.set(0.83, 1.08, 0.25);
      const pupil = ball(eye, 0.051, '#292b29', [0, -0.005, 0.039], 1);
      pupil.scale.set(0.86, 1.08, 0.22);
      const highlight = ball(eye, 0.022, '#ffffff', [-0.019, 0.029, 0.052], 1);
      highlight.scale.z = 0.3;
      const small = ball(eye, 0.01, '#fff4d7', [0.021, -0.029, 0.053], 1);
      small.scale.z = 0.3;
      tube(
        eye,
        [
          [side * 0.085, 0.04, 0.012],
          [side * 0.112, 0.055, 0.006],
        ],
        0.009,
        '#473a32',
      );
      const blush = ball(head, 0.072, '#d99491', [side * 0.265, -0.13, 0.369], 1);
      blush.scale.set(1, 0.45, 0.2);
    } else {
      const e = ball(eye, 0.037, '#36382f', [0, 0, 0.006], 1);
      e.scale.set(1, 1.18, 0.4);
    }
    ball(head, 0.056, skin, [side * 0.39, -0.035, 0.045], 1);
  }
  if (type === 'popo' || options.glasses) glasses(head);
  ball(head, 0.032, skin, [0, -0.1, 0.463], 1);
  tube(
    head,
    [
      [-0.06, -0.175, 0.429],
      [0, -0.195, 0.445],
      [0.06, -0.175, 0.429],
    ],
    0.01,
    '#b57668',
  );
  const arms = [];
  const upperLength = 0.29 * (options.armLength || 1),
    lowerLength = 0.26 * (options.armLength || 1);
  for (const side of [-1, 1]) {
    const shoulder = group(body, [side * 0.29, 0.22, 0]);
    cylinder(shoulder, 0.09, 0.075, upperLength, coat, [0, -upperLength / 2, 0], 6);
    const elbow = group(shoulder, [0, -upperLength, 0]);
    cylinder(elbow, 0.075, 0.06, lowerLength - 0.02, coat, [0, -lowerLength / 2 + 0.015, 0], 6);
    const hand = ball(elbow, 0.084, skin, [0, -lowerLength, 0], 1);
    shoulder.rotation.z = side * 0.1;
    arms.push({ shoulder, elbow, hand, upperLength, lowerLength });
  }
  const legs = [];
  for (const side of [-1, 1]) {
    const hip = group(root, [side * 0.145, 0.59, 0]);
    const upper = box(
      hip,
      [0.19, 0.32, 0.2],
      options.pants || (girl ? '#4f6c7e' : '#4c554e'),
      [0, -0.16, 0],
    );
    const knee = group(hip, [0, -0.31, 0]);
    const lower = box(
      knee,
      [0.175, 0.25, 0.19],
      options.pants || (girl ? '#4f6c7e' : '#4c554e'),
      [0, -0.12, 0],
    );
    const shoe = box(knee, [0.205, 0.1, 0.31], options.shoes || '#e1d9c5', [0, -0.25, 0.055]);
    legs.push({ hip, knee, shoe, upper, lower });
  }
  if (options.hat) {
    cylinder(head, 0.46, 0.47, 0.045, options.hat, [0, 0.36, 0], 12);
    cylinder(head, 0.31, 0.36, 0.26, options.hat, [0, 0.47, 0], 10);
  }
  const baseline = position[1];
  const result = {
    root,
    body,
    head,
    arms,
    legs,
    eyes,
    girl,
    baseline,
    torso,
    pose({ walk = 0, phase = 0, sit = 0, recline = 0, lean = 0, reach = 0 } = {}) {
      body.position.set(0, 0.86 - sit * 0.43, 0);
      body.rotation.set(recline * -0.75 + lean * 0.3, 0, 0);
      torso.scale.y = options.long ? 1 - sit * 0.22 : 1 - sit * 0.18;
      seam.scale.y = 1 - sit * 0.18;
      torso.position.y = options.long ? -0.1 + sit * 0.08 : 0;
      head.position.set(0, 0.65, 0);
      head.rotation.x = 0;
      head.rotation.y = 0;
      for (let i = 0; i < 2; i++) {
        const swing = Math.sin(phase + (i ? Math.PI : 0));
        legs[i].hip.position.set((i ? 1 : -1) * 0.145, 0.59 - sit * 0.31, 0);
        legs[i].shoe.rotation.set(0, 0, 0);
        legs[i].shoe.position.set(0, -0.25, 0.055);
        legs[i].knee.position.y = -0.31;
        legs[i].upper.scale.y = 1;
        legs[i].upper.position.y = -0.16;
        legs[i].lower.scale.y = 1;
        legs[i].lower.position.y = -0.12;
        legs[i].hip.rotation.set(-sit * 1.48 + swing * 0.42 * walk, 0, (i ? 1 : -1) * sit * 0.08);
        legs[i].knee.rotation.set(sit * 1.3 + Math.max(0, -swing) * 0.3 * walk, 0, 0);
        arms[i].shoulder.rotation.set(
          -sit * 0.65 - swing * 0.3 * walk - reach * 0.8,
          0,
          (i ? 1 : -1) * 0.1,
        );
        arms[i].elbow.rotation.set(-sit * 0.65 - reach * 0.5, 0, 0);
      }
      if (walk) body.position.y += Math.abs(Math.sin(phase)) * 0.025 * walk;
    },
    idle(time) {
      const blink = (time + (girl ? 1.2 : 0)) % 5.8;
      eyes.forEach(
        (e) => (e.scale.y = blink < 0.13 ? mix(1, 0.08, Math.sin((blink / 0.13) * Math.PI)) : 1),
      );
      head.rotation.z = Math.sin(time * 0.8) * (girl ? 0.018 : 0.012);
    },
  };
  return result;
}

export function couple(
  parent,
  positions = [
    [-0.65, 0, 0],
    [0.65, 0, 0],
  ],
  options = {},
) {
  const p = person(parent, 'popo', positions[0], options.popo || {});
  const h = person(parent, 'xiaohe', positions[1], options.xiaohe || {});
  return {
    p,
    h,
    idle(time) {
      p.idle(time);
      h.idle(time + 0.6);
    },
  };
}
export function holdHands(pair, amount = 1) {
  pair.p.arms[1].shoulder.rotation.z = 0.36 * amount;
  pair.h.arms[0].shoulder.rotation.z = -0.41 * amount;
}

const down = new THREE.Vector3(0, -1, 0);
const direction = new THREE.Vector3(),
  bend = new THREE.Vector3(),
  elbowPoint = new THREE.Vector3();
const normalized = new THREE.Vector3(),
  endDirection = new THREE.Vector3();
const upperRotation = new THREE.Quaternion(),
  lowerRotation = new THREE.Quaternion(),
  endRotation = new THREE.Quaternion();
const rigs = new WeakMap();
function rigFor(character) {
  if (!rigs.has(character))
    rigs.set(character, {
      bodyInverse: new THREE.Matrix4(),
      rootInverse: new THREE.Matrix4(),
      localTarget: new THREE.Vector3(),
      localPole: new THREE.Vector3(),
      worldTarget: new THREE.Vector3(),
      joinedTarget: new THREE.Vector3(),
      otherShoulder: new THREE.Vector3(),
      forward: new THREE.Vector3(),
      scale: new THREE.Vector3(),
      probe: new THREE.Vector3(),
      rotation: new THREE.Quaternion(),
      feet: [
        { target: new THREE.Vector3(), lift: 0, support: 0 },
        { target: new THREE.Vector3(), lift: 0, support: 0 },
      ],
    });
  return rigs.get(character);
}

// Refresh just the root-to-body path once after posing, never the mesh/limb descendants.
export function prepareIK(character) {
  const rig = rigFor(character);
  character.body.updateWorldMatrix(true, false);
  rig.bodyInverse.copy(character.body.matrixWorld).invert();
  rig.rootInverse.copy(character.root.matrixWorld).invert();
  return rig;
}

// Scratch vectors are private to this synchronous solver; targets are never mutated.
export function solveLimb(joint, hinge, target, pole, upper, lower, amount = 1) {
  direction.copy(target).sub(joint.position);
  const distance = clamp(
    direction.length(),
    Math.abs(upper - lower) + 0.0001,
    upper + lower - 0.0001,
  );
  if (direction.lengthSq() < 1e-10) direction.copy(down);
  else direction.normalize();
  bend.copy(pole).sub(joint.position);
  bend.addScaledVector(direction, -bend.dot(direction));
  if (bend.lengthSq() < 0.00001) bend.set(0, 0, 1).addScaledVector(direction, -direction.z);
  if (bend.lengthSq() < 0.00001) bend.set(1, 0, 0);
  bend.normalize();
  const along = (upper * upper - lower * lower + distance * distance) / (2 * distance);
  elbowPoint
    .copy(direction)
    .multiplyScalar(along)
    .addScaledVector(bend, Math.sqrt(Math.max(0, upper * upper - along * along)));
  upperRotation.setFromUnitVectors(down, normalized.copy(elbowPoint).normalize());
  endDirection.copy(direction).multiplyScalar(distance).sub(elbowPoint).normalize();
  lowerRotation
    .copy(upperRotation)
    .invert()
    .multiply(endRotation.setFromUnitVectors(down, endDirection));
  joint.quaternion.slerp(upperRotation, amount);
  hinge.quaternion.slerp(lowerRotation, amount);
}

export function reachHand(character, index, target, amount = 1, pole, rig = prepareIK(character)) {
  const arm = character.arms[index];
  rig.localTarget.copy(target).applyMatrix4(rig.bodyInverse);
  if (pole) rig.localPole.copy(pole).applyMatrix4(rig.bodyInverse);
  else rig.localPole.set(index ? 0.72 : -0.72, -0.15, 0.12);
  solveLimb(
    arm.shoulder,
    arm.elbow,
    rig.localTarget,
    rig.localPole,
    arm.upperLength,
    arm.lowerLength,
    amount,
  );
}

export function localHand(character, index, target, amount = 1, rig = prepareIK(character)) {
  rig.worldTarget.set(...target).applyMatrix4(character.root.matrixWorld);
  reachHand(character, index, rig.worldTarget, amount, undefined, rig);
}

export function joinedHands(pair, amount = 1) {
  const p = prepareIK(pair.p),
    h = prepareIK(pair.h);
  const target = p.joinedTarget
    .copy(pair.p.arms[1].shoulder.position)
    .applyMatrix4(pair.p.body.matrixWorld);
  p.otherShoulder.copy(pair.h.arms[0].shoulder.position).applyMatrix4(pair.h.body.matrixWorld);
  p.forward.setFromMatrixColumn(pair.p.root.matrixWorld, 2).normalize().multiplyScalar(0.1);
  target.add(p.otherShoulder).multiplyScalar(0.5).add(p.forward);
  target.y -= 0.34 * p.scale.setFromMatrixScale(pair.p.root.matrixWorld).y;
  reachHand(pair.p, 1, target, amount, undefined, p);
  reachHand(pair.h, 0, target, amount, undefined, h);
  return target;
}

// Feet stay planted while knees bend; only then do the feet slide into a relaxed seat.
export function groundSeat(character, amount, time = 0) {
  const rig = rigFor(character);
  const a = clamp(amount),
    drop = ease((a - 0.1) / 0.82),
    fold = ease((a - 0.34) / 0.66);
  character.body.position.y = mix(0.86, 0.44, drop);
  character.body.rotation.x = Math.sin(a * Math.PI) * 0.24 + drop * 0.035;
  for (const [i, leg] of character.legs.entries()) {
    const side = i ? 1 : -1;
    leg.hip.position.set(side * 0.145, mix(0.59, 0.17, drop), -0.045 * drop);
    const ankle = rig.localTarget.set(
      mix(side * 0.145, side * 0.08, fold),
      0.05,
      mix(0, 0.39, fold),
    );
    solveLimb(
      leg.hip,
      leg.knee,
      ankle,
      rig.localPole.set(side * (0.22 + fold * 0.45), 0.22, 0.65),
      0.31,
      0.25,
    );
    const rotation = rig.rotation.copy(leg.hip.quaternion).multiply(leg.knee.quaternion);
    leg.shoe.quaternion.copy(rotation.invert());
    leg.shoe.position.z = 0;
  }
  prepareIK(character);
  const brace = Math.sin(a * Math.PI) * 0.8;
  for (let i = 0; i < 2; i++) {
    const side = i ? 1 : -1;
    localHand(
      character,
      i,
      [side * 0.37, mix(0.57, 0.15, drop), mix(0.02, 0.08, drop)],
      brace,
      rig,
    );
    localHand(character, i, [side * 0.17, 0.28, 0.32], ease((a - 0.76) / 0.24), rig);
  }
  character.body.rotation.z = Math.sin(time * 0.75) * 0.008 * drop;
}

export function stroll(character, distance, weight = 1, surface) {
  const cycle = distance / 0.49,
    weightShift = Math.sin(cycle * Math.PI * 2) * 0.012 * weight;
  character.body.position.y -= 0.018 * weight;
  character.body.rotation.z = weightShift;
  const rig = rigFor(character),
    feet = rig.feet;
  for (let i = 0; i < 2; i++) {
    const t = (((cycle + i * 0.5) % 1) + 1) % 1,
      swing = clamp((t - 0.62) / 0.38);
    const z = t < 0.62 ? mix(0.18, -0.18, t / 0.62) : mix(-0.18, 0.18, ease(swing));
    feet[i].target.set((i ? 1 : -1) * 0.145, 0.05, z * weight);
    feet[i].lift = Math.sin(swing * Math.PI) * 0.095 * weight;
  }
  if (surface) {
    for (const f of feet) {
      let height = -Infinity;
      for (const dx of [-0.075, 0, 0.075])
        for (const dz of [-0.12, 0, 0.12]) {
          const p = rig.probe.copy(f.target);
          p.x += dx;
          p.z += dz;
          p.multiply(character.root.scale)
            .applyEuler(character.root.rotation)
            .add(character.root.position);
          height = Math.max(height, surface(p.x, p.z));
        }
      f.support = height;
    }
    character.root.position.y = Math.min(feet[0].support, feet[1].support) + 0.003;
    for (const f of feet)
      f.target.y = (f.support - character.root.position.y) / character.root.scale.y + 0.05;
  }
  for (const [i, leg] of character.legs.entries()) {
    leg.hip.position.y = 0.59 - 0.018 * weight;
    feet[i].target.y += feet[i].lift;
    solveLimb(
      leg.hip,
      leg.knee,
      feet[i].target,
      rig.localPole.set((i ? 1 : -1) * 0.15, 0.1, 1),
      0.31,
      0.25,
    );
    const q = rig.rotation.copy(leg.hip.quaternion).multiply(leg.knee.quaternion).invert();
    leg.shoe.quaternion.copy(q);
    leg.shoe.position.z = 0;
  }
}

function ease(value) {
  const n = clamp(value);
  return n * n * (3 - 2 * n);
}

export function reachFoot(
  character,
  index,
  target,
  upper = 0.31,
  lower = 0.25,
  rig = prepareIK(character),
) {
  const leg = character.legs[index];
  leg.upper.scale.y = upper / 0.31;
  leg.upper.position.y = -upper / 2;
  leg.knee.position.y = -upper;
  leg.lower.scale.y = lower / 0.25;
  leg.lower.position.y = -lower / 2;
  leg.shoe.position.set(0, -lower, 0);
  solveLimb(
    leg.hip,
    leg.knee,
    rig.localTarget.copy(target).applyMatrix4(rig.rootInverse),
    rig.localPole.set((index ? 1 : -1) * 0.2, 0.12, 1),
    upper,
    lower,
  );
  leg.shoe.quaternion.copy(
    rig.rotation.copy(leg.hip.quaternion).multiply(leg.knee.quaternion).invert(),
  );
}

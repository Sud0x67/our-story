import test from 'node:test';
import assert from 'node:assert/strict';
import { Group, Vector3 } from 'three';
import { projectionSize, damping } from '../src/framing.js';
import { crabs, swans } from '../src/scenes/outdoors.js';
import { solveLimb } from '../src/scenes/characters.js';

function transforms(root) {
  const values = [];
  root.traverse((o) =>
    values.push(...o.position.toArray(), ...o.quaternion.toArray(), ...o.scale.toArray()),
  );
  return values;
}
for (const [name, factory] of [
  ['crabs', crabs],
  ['swans', swans],
])
  test(`${name}: pausing and revisiting the same time produces exactly the same pose`, () => {
    const scene = factory(),
      state = { time: 8, progress: 0.55 };
    scene.update(state);
    const expected = transforms(scene.root);
    for (let i = 0; i < 30; i++) scene.update(state);
    assert.deepEqual(transforms(scene.root), expected);
    scene.update({ time: 15, progress: 0.9 });
    scene.update(state);
    assert.deepEqual(transforms(scene.root), expected);
  });
test('portrait ring framing contains the full box, while landscape framing keeps the intended close-up', () => {
  for (const [w, h] of [
    [320, 740],
    [390, 844],
    [430, 932],
    [1024, 768],
    [1920, 1080],
  ]) {
    const view = projectionSize(4.7, w, h, true);
    assert.ok(view.width >= 4.6);
    assert.ok(view.height >= 4.7);
  }
  assert.equal(projectionSize(4.7, 1920, 1080, true).height, 4.7);
});
test('camera damping takes the same path at 30, 60 and 120 frames per second', () => {
  const positions = [30, 60, 120].map((fps) => {
    let x = 0;
    for (let n = 0; n < fps; n++) x += (1 - x) * damping(3.7, 1 / fps);
    return x;
  });
  assert.ok(Math.max(...positions) - Math.min(...positions) < 1e-12);
});
test('folded and unreachable limb targets keep bone lengths and finite rotations', () => {
  for (const point of [
    [0, 0, 0],
    [0, 0.001, 0],
    [0, 3, 0],
  ]) {
    const root = new Group(),
      hinge = new Group(),
      hand = new Group();
    root.add(hinge);
    hinge.position.y = -0.29;
    hinge.add(hand);
    hand.position.y = -0.26;
    solveLimb(root, hinge, new Vector3(...point), new Vector3(0, 0, 1), 0.29, 0.26);
    root.updateMatrixWorld(true);
    assert.ok(root.quaternion.toArray().every(Number.isFinite));
    assert.ok(hinge.quaternion.toArray().every(Number.isFinite));
    const start = root.getWorldPosition(new Vector3()),
      elbow = hinge.getWorldPosition(new Vector3()),
      end = hand.getWorldPosition(new Vector3());
    assert.ok(Math.abs(start.distanceTo(elbow) - 0.29) < 1e-9);
    assert.ok(Math.abs(elbow.distanceTo(end) - 0.26) < 1e-9);
    assert.ok(start.distanceTo(end) >= 0.0299 && start.distanceTo(end) <= 0.55);
  }
});

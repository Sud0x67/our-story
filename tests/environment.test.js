import './fixtures/model-environment.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { OrthographicCamera, Vector3, Box3 } from 'three';
import { river, mountain, ringScene } from '../src/scenes/beginning.js';
import { bar, museum, skewersDinner, shop, barbecue, coffee } from '../src/scenes/indoors.js';
import { crabs, stars, camp, swans, forest, beach } from '../src/scenes/outdoors.js';
import { cycling, driving } from '../src/scenes/vehicles.js';
import { live, concert } from '../src/scenes/performances.js';
import { extendEnvironment } from '../src/scenes/environment.js';
import { createInteractionEffects } from '../src/scenes/interaction-effects.js';
const factories = {
  river,
  mountain,
  bar,
  live,
  museum,
  skewers: skewersDinner,
  crabs,
  stars,
  shop,
  cycling,
  camp,
  concert,
  driving,
  barbecue,
  swans,
  forest,
  coffee,
  beach,
  ring: ringScene,
};
for (const [id, factory] of Object.entries(factories))
  test(`${id}: extended ground covers the view and interaction effects remain deterministic`, () => {
    const scene = factory();
    extendEnvironment(scene, id);
    const effects = createInteractionEffects(scene, id),
      camera = new OrthographicCamera(-10, 10, 7, -7, 0.1, 180);
    camera.position.set(12, 9, 17);
    camera.lookAt(0, 1, 0);
    const ground = scene.root.children.find((c) => c.userData.seamlessGround);
    assert.ok(ground, `${id}: missing seamless ground`);
    assert.ok(ground.geometry.parameters.width >= 256);
    assert.ok(ground.geometry.parameters.height >= 256);
    const snapshot = () => {
      const values = [];
      scene.root.traverse((o) =>
        values.push(...o.position.toArray(), ...o.quaternion.toArray(), ...o.scale.toArray()),
      );
      return values;
    };
    for (const action of [0, 0.2, 0.5, 0.8, 1]) {
      const state = {
        id,
        time: 12,
        progress: 0.8,
        action,
        phase: action < 1 ? 'acting' : 'settled',
      };
      scene.update(state);
      effects.update(state, camera);
      const first = snapshot();
      assert.ok(first.every(Number.isFinite));
      scene.update(state);
      effects.update(state, camera);
      assert.deepEqual(snapshot(), first);
    }
  });
test('the flipped camping card clears the tabletop throughout the interaction', () => {
  const scene = camp();
  for (let frame = 0; frame <= 100; frame++) {
    scene.update({ time: 0, progress: 0.8, action: frame / 100 });
    scene.root.updateMatrixWorld(true);
    // The fifth community card is the only group with this center and a face symbol.
    const card = scene.root.children.find(
      (c) =>
        c.isGroup && Math.abs(c.position.x - 0.7) < 0.001 && Math.abs(c.position.z - 0.45) < 0.001,
    );
    assert.ok(card);
    assert.ok(
      new Box3().setFromObject(card).min.y >= 0.949,
      `frame ${frame}: card intersects table`,
    );
  }
});

test('a triggered memory hides its tap marker through the action and final hold', () => {
  const effects = createInteractionEffects(crabs(), 'crabs'),
    camera = new OrthographicCamera();
  for (const state of [
    { phase: 'waiting', continuing: false, visible: true },
    { phase: 'arriving', continuing: true, visible: false },
    { phase: 'acting', continuing: true, visible: false },
    { phase: 'settled', continuing: true, visible: false },
    { phase: 'leaving', continuing: false, visible: false },
    { phase: 'settled', continuing: false, visible: true },
  ]) {
    effects.update({ time: 5, progress: 0.5, action: 0.5, ...state }, camera);
    assert.equal(effects.badge.visible, state.visible);
  }
});

test('water interaction rings lie on the water surface rather than floating around the bucket', () => {
  for (const [id, factory, height] of [
    ['crabs', crabs, 0.024],
    ['swans', swans, 0.065],
    ['beach', beach, 0.065],
  ]) {
    const scene = factory(),
      effects = createInteractionEffects(scene, id),
      camera = new OrthographicCamera();
    scene.update({ time: 10, progress: 0.8 });
    effects.update(
      { time: 10, progress: 0.8, action: 0.5, phase: 'acting', continuing: true },
      camera,
    );
    scene.root.updateMatrixWorld(true);
    const rings = [];
    effects.root.traverse((o) => {
      if (o.geometry?.type === 'TorusGeometry' && o.geometry.parameters.tube === 0.009)
        rings.push(o);
    });
    assert.equal(rings.length, 3);
    for (const ring of rings)
      assert.ok(Math.abs(ring.getWorldPosition(new Vector3()).y - height) < 1e-8);
  }
});

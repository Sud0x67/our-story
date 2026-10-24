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
import { FilmTimeline } from '../src/timeline.js';
import { SCENES } from '../src/story-data.js';
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

for (const [index, scene] of SCENES.entries())
  test(`${scene.id}: the tap marker appears only when a click is needed`, () => {
    const effects = createInteractionEffects(factories[scene.id](), scene.id),
      camera = new OrthographicCamera(),
      timeline = new FilmTimeline(SCENES, { index });
    const checkMarker = (expected) => {
      effects.update(
        {
          time: timeline.elapsed,
          progress: timeline.progress,
          action: timeline.action,
          phase: timeline.phase,
          needsInput: timeline.needsInput,
        },
        camera,
      );
      assert.equal(effects.badge.visible, expected, timeline.phase);
    };
    assert.equal(effects.badge.visible, false, 'no transient marker before the first update');
    checkMarker(false);
    timeline.tick(0.5);
    checkMarker(false);
    timeline.paused = true;
    checkMarker(true);
    timeline.interact();
    checkMarker(false);
    timeline.tick(100);
    checkMarker(true);
    timeline.interact();
    checkMarker(false);
    timeline.tick(100);
    checkMarker(false);
    if (!timeline.isFinal) {
      timeline.tick(2);
      checkMarker(false);
      timeline.tick(1);
      checkMarker(false);
    }
    timeline.goto(index);
    checkMarker(false);
    if (!timeline.isFinal) {
      timeline.interact();
      checkMarker(false);
      timeline.tick(100);
      checkMarker(false);
    }
  });

test('continuous playback shows no tap marker before the final closed box', () => {
  const timeline = new FilmTimeline(SCENES, { interactive: false });
  timeline.tick(10);
  assert.equal(timeline.needsInput, false);
  timeline.goto(18);
  assert.equal(timeline.needsInput, false);
  timeline.tick(19);
  assert.equal(timeline.needsInput, true);
  timeline.open();
  assert.equal(timeline.needsInput, false);
});

test('water interaction rings lie on the water surface rather than floating around the bucket', () => {
  for (const [id, factory, height] of [
    ['crabs', crabs, 0.024],
    ['swans', swans, 0.065],
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

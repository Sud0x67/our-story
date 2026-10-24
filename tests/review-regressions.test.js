import './fixtures/model-environment.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { Object3D, OrthographicCamera, Matrix4, Vector3, Quaternion } from 'three';
import { SCENES } from '../src/story-data.js';
import { FilmTimeline } from '../src/timeline.js';
import { swans, stars, beach } from '../src/scenes/outdoors.js';
import { shop, coffee } from '../src/scenes/indoors.js';
import { cycling, driving } from '../src/scenes/vehicles.js';
import { concert } from '../src/scenes/performances.js';
import { createInteractionEffects } from '../src/scenes/interaction-effects.js';
import { solveLimb } from '../src/scenes/characters.js';

for (const [index, scene] of SCENES.entries())
  test(`${scene.id}: ambient motion advances at a constant rate through intro, waiting, action and hold`, () => {
    const t = new FilmTimeline(SCENES, { index, speed: 1.7 });
    for (let frame = 0; frame < 2200; frame++) {
      const previous = t.ambientTime;
      t.tick(1 / 60);
      if (t.index !== index) {
        assert.equal(t.ambientTime, 0);
        break;
      }
      assert.ok(Math.abs(t.ambientTime - previous - 1.7 / 60) < 1e-10, t.phase);
      if (t.waiting && !t.autoContinue) {
        // Let the environment run while waiting, then trigger the single action.
        t.tick(0.75);
        assert.ok(Math.abs(t.ambientTime - previous - 1.7 / 60 - 0.75 * 1.7) < 1e-10);
        t.interact();
      }
    }
  });

test('ambient time freezes on pause and resets on direct previews, replay and autoplay scene changes', () => {
  const t = new FilmTimeline(SCENES, { index: 7, elapsed: 7 });
  assert.equal(t.ambientTime, 7);
  t.tick(3);
  t.paused = true;
  const paused = t.ambientTime;
  t.tick(10);
  t.tick(NaN);
  t.tick(-1);
  assert.equal(t.ambientTime, paused);
  t.interact();
  t.tick(0.5);
  assert.equal(t.ambientTime, paused + 0.5);
  t.restart();
  assert.equal(t.ambientTime, 0);
  t.goto(4, 8);
  assert.equal(t.ambientTime, 8);
  const autoplay = new FilmTimeline(SCENES, { interactive: false });
  autoplay.tick(SCENES[0].duration + 2);
  assert.equal(autoplay.index, 1);
  assert.equal(autoplay.ambientTime, 2);
});

test('swan wake ellipses keep their aspect ratio from the first update through the click', () => {
  const scene = swans();
  for (let frame = 0; frame <= 120; frame++) {
    scene.update({ time: frame / 10, action: frame / 120 });
    for (const ring of scene.memories.ripples)
      assert.ok(Math.abs(ring.scale.y / ring.scale.x - 1.4) < 1e-12);
  }
});

test('Yiwu hands stay relaxed until the click and only then start reaching', () => {
  const scene = shop(),
    t = new FilmTimeline(SCENES, { index: 8 });
  const arms = () =>
    scene.memories.actors.flatMap((c) => c.arms.map((arm) => arm.shoulder.rotation.x));
  scene.update({ time: 4.2, progress: 4.2 / 14 });
  const relaxed = arms();
  for (const elapsed of [4.4, 4.8, 5]) {
    scene.update({ time: elapsed, progress: elapsed / 14 });
    arms().forEach((angle, i) => assert.ok(Math.abs(angle - relaxed[i]) < 1e-10));
  }
  t.tick(100);
  t.interact();
  t.tick(1);
  scene.update({ time: t.ambientTime, progress: t.progress });
  assert.ok(arms().every((angle, i) => angle < relaxed[i] - 0.05));
});

test('the stargazing click uses only its authored meteors, with no duplicate shared effect', () => {
  const scene = stars(),
    effects = createInteractionEffects(scene, 'stars');
  const camera = new OrthographicCamera();
  for (const progress of [0.51, 0.54, 0.59]) {
    scene.update({ time: 15, progress });
    effects.update({ time: 15, progress, action: 0.5, phase: 'acting', needsInput: false }, camera);
    const visible = [];
    scene.root.traverse((node) => {
      if (node.isLine && node.material.opacity > 0) visible.push(node);
    });
    assert.equal(visible.length, 0, 'the shared effect must not add another shooting star');
    assert.ok(scene.memories.meteors.some((meteor) => meteor.root.visible));
  }
});

test('all three coffees are fully visible whenever the three-cup caption is shown', () => {
  const scene = coffee(),
    t = new FilmTimeline(SCENES, { index: 16 });
  t.tick(100);
  assert.ok(t.caption().text.includes('三杯'));
  for (let frame = 0; frame <= 80; frame++) {
    scene.update({ time: t.ambientTime, progress: t.progress });
    if (t.caption().text.includes('三杯')) {
      assert.equal(scene.contacts.cups.length, 3);
      for (const cup of scene.contacts.cups) assert.equal(cup.scale.x, 1);
    }
    if (frame === 0) t.interact();
    t.tick(0.05);
  }
});

for (const [name, factory] of Object.entries({ beach, cycling, driving }))
  test(`${name}: IK prepares each character once and never refreshes the full descendant tree`, () => {
    const scene = factory();
    scene.update({ time: 10, progress: 0.7 });
    const actors = scene.contacts.actors || scene.contacts.riders;
    const counts = new Map(actors.map((actor) => [actor.body, 0]));
    let subtree = 0;
    const original = Object3D.prototype.updateWorldMatrix;
    Object3D.prototype.updateWorldMatrix = function (parents, children) {
      if (children) subtree++;
      if (counts.has(this)) counts.set(this, counts.get(this) + 1);
      return original.call(this, parents, children);
    };
    try {
      scene.update({ time: 11, progress: 0.8 });
    } finally {
      Object3D.prototype.updateWorldMatrix = original;
    }
    assert.equal(subtree, 0);
    assert.ok([...counts.values()].every((n) => n === 1));
  });

test('the warmed limb solver does not clone per-frame vectors or quaternions or mutate inputs', () => {
  const joint = new Object3D(),
    hinge = new Object3D();
  joint.add(hinge);
  const target = new Vector3(0.1, -0.42, 0.1),
    pole = new Vector3(0.4, 0, 0.2);
  const expectedTarget = target.toArray(),
    expectedPole = pole.toArray();
  let clones = 0;
  const v = Vector3.prototype.clone,
    q = Quaternion.prototype.clone;
  Vector3.prototype.clone = function () {
    clones++;
    return v.call(this);
  };
  Quaternion.prototype.clone = function () {
    clones++;
    return q.call(this);
  };
  try {
    for (let i = 0; i < 100; i++) solveLimb(joint, hinge, target, pole, 0.29, 0.26);
  } finally {
    Vector3.prototype.clone = v;
    Quaternion.prototype.clone = q;
  }
  assert.equal(clones, 0);
  assert.deepEqual(target.toArray(), expectedTarget);
  assert.deepEqual(pole.toArray(), expectedPole);
});

test('shop and concert keep complete geometry with bounded render batches', () => {
  for (const [factory, maximum, originalTriangles] of [
    [shop, 120, 70488],
    [concert, 145, 32198],
  ]) {
    const scene = factory();
    let meshes = 0,
      triangles = 0;
    scene.root.traverse((node) => {
      if (!node.isMesh) return;
      meshes++;
      triangles +=
        ((node.geometry.index?.count ?? node.geometry.attributes.position.count) / 3) *
        (node.isInstancedMesh ? node.count : 1);
    });
    assert.ok(meshes <= maximum, `${meshes} mesh batches`);
    // Paper uses fewer facets, so it shares the budget check but not the clay triangle baseline.
    if (process.env.OUR_STORY_LOOK !== 'paper') assert.equal(triangles, originalTriangles);
  }
});

test('instanced spectators and light sticks retain individual motion and deterministic replay', () => {
  const scene = concert();
  const capture = () => [
    ...scene.performance.crowd.meshes.flatMap((mesh) => Array.from(mesh.instanceMatrix.array)),
    ...scene.performance.lights.mesh.instanceMatrix.array,
  ];
  scene.update({ time: 3, progress: 0.5 });
  const expected = capture();
  scene.update({ time: 5, progress: 0.5 });
  assert.notDeepEqual(capture(), expected);
  scene.update({ time: 3, progress: 0.5 });
  assert.deepEqual(capture(), expected);
  const { people, meshes } = scene.performance.crowd;
  assert.equal(people.length, 45);
  assert.equal(
    meshes.reduce((sum, mesh) => sum + mesh.count, 0),
    45 * 3,
  );
  assert.equal(scene.performance.lights.mesh.count, 70);
  const matrix = new Matrix4();
  for (const mesh of meshes)
    for (let i = 0; i < mesh.count; i++) {
      mesh.getMatrixAt(i, matrix);
      assert.ok(matrix.elements.every(Number.isFinite));
    }
});

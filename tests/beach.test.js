import './fixtures/model-environment.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { Box3, Matrix4, OrthographicCamera, Vector3 } from 'three';
import { beach } from '../src/scenes/outdoors.js';
import { createInteractionEffects } from '../src/scenes/interaction-effects.js';
import { FilmTimeline } from '../src/timeline.js';
import { SCENES } from '../src/story-data.js';
import { projectionSize } from '../src/framing.js';

const index = SCENES.findIndex((scene) => scene.id === 'beach');
const world = (node) => node.getWorldPosition(new Vector3());
const update = (scene, timeline) => {
  scene.update({ time: timeline.elapsed, progress: timeline.progress });
  scene.root.updateMatrixWorld(true);
};

test('reclining hands stay supported by armrests; arms clear faces and the chair', () => {
  const scene = beach(),
    vertex = new Vector3();
  for (let frame = 0; frame <= 60; frame++) {
    scene.update({ time: frame / 3, progress: frame / 60 });
    scene.root.updateMatrixWorld(true);
    const hull = new Box3().setFromObject(scene.contacts.boat.children[0], true);
    assert.ok(hull.min.y < 0.03 && hull.max.y > 0.03, 'boat hull must intersect the waterline');
    for (const [i, actor] of scene.contacts.actors.entries()) {
      const chair = scene.contacts.chairs[i];
      const seat = new Box3().setFromObject(chair.seat, true);
      const clothing = new Box3().setFromObject(actor.torso, true);
      assert.ok(clothing.min.y >= seat.max.y - 0.001, 'torso penetrates the seat');
      assert.ok(clothing.min.y < seat.max.y + 0.025, 'torso floats above the seat');
      const heads = actor.head.children
        .filter((node) => node.geometry?.parameters.radius > 0.18)
        .map((node) => ({
          inverse: new Matrix4().copy(node.matrixWorld).invert(),
          radius: node.geometry.parameters.radius,
        }));
      for (const [side, arm] of actor.arms.entries()) {
        const rest = new Box3().setFromObject(chair.armrests[side], true);
        const hand = new Box3().setFromObject(arm.hand, true),
          center = world(arm.hand);
        assert.ok(
          hand.min.y >= rest.max.y - 0.001 && hand.min.y < rest.max.y + 0.009,
          'hand loses support',
        );
        assert.ok(
          center.x > rest.min.x &&
            center.x < rest.max.x &&
            center.z > rest.min.z &&
            center.z < rest.max.z,
        );
        assert.ok(world(arm.elbow).y > center.y + 0.07, 'elbow bends up toward the face');
        arm.shoulder.traverse((node) => {
          if (!node.isMesh) return;
          const positions = node.geometry.getAttribute('position');
          for (let v = 0; v < positions.count; v++) {
            vertex.fromBufferAttribute(positions, v).applyMatrix4(node.matrixWorld);
            assert.ok(
              !rest.containsPoint(vertex.clone().add(new Vector3(0, 0.001, 0))),
              'arm penetrates armrest',
            );
            for (const head of heads)
              assert.ok(
                vertex.clone().applyMatrix4(head.inverse).length() > head.radius * 0.96,
                'arm penetrates head',
              );
          }
        });
      }
      const back = chair.back,
        inverse = new Matrix4().copy(back.matrixWorld).invert();
      for (const node of [actor.torso, ...actor.head.children.filter((n) => n.isMesh)]) {
        const positions = node.geometry.getAttribute('position');
        for (let v = 0; v < positions.count; v++) {
          vertex
            .fromBufferAttribute(positions, v)
            .applyMatrix4(node.matrixWorld)
            .applyMatrix4(inverse);
          if (Math.abs(vertex.x) < 0.44 && Math.abs(vertex.z) < 0.575)
            assert.ok(vertex.y >= 0.039, 'clothing or hair penetrates the reclined back');
        }
      }
    }
  }
});

test('one beach click brings in the surf, leaves fading foam and retreats before the automatic transition', () => {
  const scene = beach(),
    timeline = new FilmTimeline(SCENES, { index });
  timeline.tick(100);
  update(scene, timeline);
  const start = scene.contacts.swash.position.z;
  assert.equal(timeline.phase, 'waiting');
  timeline.interact();
  let closest = -Infinity,
    trail = 0;
  for (let frame = 0; frame < 136; frame++) {
    timeline.tick(0.05);
    update(scene, timeline);
    const { swash, foamTrail, chairs } = scene.contacts;
    closest = Math.max(closest, swash.position.z);
    trail = Math.max(trail, foamTrail.material.opacity);
    const water = new Box3().setFromObject(swash, true);
    for (const chair of chairs)
      assert.ok(
        water.max.z < new Box3().setFromObject(chair.root, true).min.z - 0.1,
        'surf reaches the loungers',
      );
  }
  assert.ok(closest - start > 1.5, 'the click should make a visible rolling wave');
  assert.ok(trail > 0.29, 'retreat should leave a fading foam line');
  assert.ok(scene.contacts.swash.position.z < closest - 1.5, 'the surf should retreat');
  timeline.tick(0.001);
  assert.equal(timeline.phase, 'settled');
  assert.equal(timeline.needsInput, false);
  timeline.tick(3);
  assert.equal(timeline.phase, 'leaving');
  timeline.tick(1);
  assert.equal(timeline.index, index + 1);
  timeline.navigate(-1);
  timeline.tick(1);
  assert.equal(timeline.elapsed, 0);
  update(scene, timeline);
  assert.ok(scene.contacts.swash.position.z < closest - 1.5, 'replay must restart the wave');
});

test('beach pause and revisit reset both instanced foam and sunlight without cumulative motion', () => {
  const scene = beach();
  const snapshot = () => {
    const values = [];
    scene.root.traverse((node) => {
      values.push(
        ...node.position.toArray(),
        ...node.quaternion.toArray(),
        ...node.scale.toArray(),
      );
      if (node.isInstancedMesh) values.push(...node.instanceMatrix.array);
      if (node.material?.transparent) values.push(node.material.opacity);
    });
    return values;
  };
  const state = { time: 11.3, progress: 11.3 / 16 };
  scene.update(state);
  const expected = snapshot();
  scene.update(state);
  assert.deepEqual(snapshot(), expected);
  scene.update({ time: 0, progress: 0 });
  scene.update(state);
  assert.deepEqual(snapshot(), expected);
});

test('both loungers remain framed on mobile and desktop; the click marker avoids the couple', () => {
  const scene = beach(),
    effects = createInteractionEffects(scene, 'beach');
  for (const [width, height] of [
    [390, 844],
    [1280, 720],
  ]) {
    for (const p of [0, 6 / 16, 0.7, 1]) {
      scene.update({ time: p * 16, progress: p });
      scene.root.updateMatrixWorld(true);
      const v = scene.view,
        t = p * p * (3 - 2 * p);
      const span = (v.span + (v.endSpan - v.span) * t) * 1.08;
      const size = projectionSize(span, width, height);
      const camera = new OrthographicCamera(
        -size.width / 2,
        size.width / 2,
        size.height / 2,
        -size.height / 2,
        0.1,
        180,
      );
      camera.position.fromArray(v.from.map((x, i) => x + (v.to[i] - x) * t));
      camera.lookAt(new Vector3(...v.target.map((x, i) => x + (v.endTarget[i] - x) * t)));
      camera.updateMatrixWorld(true);
      effects.update(
        { time: p * 16, progress: p, action: 0.5, phase: 'acting', needsInput: true },
        camera,
      );
      scene.root.updateMatrixWorld(true);
      const marker = world(effects.badge).project(camera);
      for (const node of [
        ...scene.contacts.actors.map((c) => c.root),
        ...scene.contacts.chairs.map((c) => c.root),
      ]) {
        const bounds = new Box3().setFromObject(node, true),
          projected = new Box3();
        for (const x of [bounds.min.x, bounds.max.x])
          for (const y of [bounds.min.y, bounds.max.y])
            for (const z of [bounds.min.z, bounds.max.z]) {
              const point = new Vector3(x, y, z).project(camera);
              assert.ok(
                Math.abs(point.x) < 0.94 && point.y < 0.8 && point.y > -0.65,
                'couple or chair is cropped',
              );
              projected.expandByPoint(point);
            }
        assert.ok(
          marker.x < projected.min.x - 0.035 ||
            marker.x > projected.max.x + 0.035 ||
            marker.y < projected.min.y - 0.06 ||
            marker.y > projected.max.y + 0.06,
          'click marker overlaps the couple',
        );
      }
    }
  }
  const rings = [];
  effects.root.traverse((node) => {
    if (node.geometry?.type === 'TorusGeometry' && node.geometry.parameters.tube === 0.009)
      rings.push(node);
  });
  assert.equal(rings.length, 0, 'native surf should replace generic magical ripples');
});

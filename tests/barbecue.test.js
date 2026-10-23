import './fixtures/model-environment.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { Box3, Matrix4, Vector3 } from 'three';
import { barbecue } from '../src/scenes/indoors.js';
import { FilmTimeline } from '../src/timeline.js';
import { SCENES } from '../src/story-data.js';

const index = SCENES.findIndex((scene) => scene.id === 'barbecue');
const world = (node) => node.getWorldPosition(new Vector3());
const cupPositions = (scene) => scene.contacts.mugs.map((mug) => mug.root.position.toArray());
const update = (scene, timeline) => {
  scene.update({ time: timeline.elapsed, progress: timeline.progress });
  scene.root.updateMatrixWorld(true);
};

test('one barbecue click raises both beers and holds the toast through the fade; replay starts at the table', () => {
  const scene = barbecue(),
    timeline = new FilmTimeline(SCENES, { index });
  update(scene, timeline);
  const resting = cupPositions(scene);
  timeline.tick(100);
  update(scene, timeline);
  assert.equal(timeline.phase, 'waiting');
  assert.deepEqual(cupPositions(scene), resting, 'the toast must wait for a click');
  timeline.interact();
  timeline.tick(timeline.cue.duration * 0.95);
  update(scene, timeline);
  const [left, right] = scene.contacts.mugs.map((mug) => new Box3().setFromObject(mug.root, true));
  assert.ok(Math.abs(left.max.x - right.min.x) < 0.0001, 'the rims should touch');
  assert.ok(cupPositions(scene).every((position, i) => position[1] > resting[i][1] + 0.19));
  const raised = cupPositions(scene);
  timeline.paused = true;
  timeline.tick(100);
  update(scene, timeline);
  assert.deepEqual(cupPositions(scene), raised, 'pausing must freeze the toast');
  timeline.interact();
  assert.equal(timeline.phase, 'acting', 'resume must preserve the current action');
  timeline.tick(timeline.cue.duration - timeline.actionElapsed);
  update(scene, timeline);
  assert.equal(timeline.phase, 'settled');
  assert.deepEqual(cupPositions(scene), raised, 'the beers must stay raised after clinking');
  assert.equal(timeline.needsInput, false, 'the completed toast needs no extra click');
  for (let second = 0; second < 3; second++) {
    timeline.tick(1);
    update(scene, timeline);
    assert.deepEqual(cupPositions(scene), raised, 'the toast must hold until the transition');
    for (const [i, character] of scene.contacts.actors.entries())
      assert.ok(
        world(character.arms[i ? 0 : 1].hand).distanceTo(world(scene.contacts.mugs[i].grip)) <
          0.005,
      );
  }
  assert.equal(timeline.phase, 'leaving');
  timeline.tick(0.5);
  update(scene, timeline);
  assert.deepEqual(cupPositions(scene), raised, 'fading must not lower the mugs');
  timeline.tick(0.5);
  assert.equal(timeline.index, index + 1);
  timeline.navigate(-1);
  timeline.tick(1);
  update(scene, timeline);
  assert.equal(timeline.elapsed, 0);
  assert.deepEqual(cupPositions(scene), resting);
});

test('the whole toast keeps hands on handles, rims apart and arms and mugs clear of the table and faces', () => {
  const scene = barbecue(),
    timeline = new FilmTimeline(SCENES, { index });
  timeline.tick(100);
  timeline.interact();
  const vertex = new Vector3(),
    local = new Vector3();
  for (let frame = 0; frame <= 300; frame++) {
    update(scene, timeline);
    const { actors, mugs, table } = scene.contacts;
    const tabletop = new Box3().setFromObject(table.children[0], true);
    const bounds = mugs.map((mug) => new Box3().setFromObject(mug.root, true));
    assert.ok(bounds[0].max.x <= bounds[1].min.x + 0.00001, 'beer mugs overlap');
    for (const bound of bounds) assert.ok(bound.min.y >= tabletop.max.y + 0.0009);
    const heads = actors.flatMap((character) =>
      character.head.children
        .filter((node) => node.geometry?.parameters.radius > 0.18)
        .map((node) => ({
          inverse: new Matrix4().copy(node.matrixWorld).invert(),
          radius: node.geometry.parameters.radius,
        })),
    );
    for (const [i, character] of actors.entries()) {
      if (timeline.action >= 0.32)
        assert.ok(
          world(character.arms[i ? 0 : 1].hand).distanceTo(world(mugs[i].grip)) < 0.005,
          'a hand loses its handle while carrying the mug',
        );
      for (const arm of character.arms)
        arm.shoulder.traverse((node) => {
          if (!node.isMesh) return;
          const positions = node.geometry.getAttribute('position');
          for (let v = 0; v < positions.count; v++) {
            vertex.fromBufferAttribute(positions, v).applyMatrix4(node.matrixWorld);
            assert.equal(
              tabletop.containsPoint(vertex),
              false,
              `arm inside table at frame ${frame}`,
            );
            if (node === character.arms[i ? 0 : 1].hand)
              for (const head of heads)
                assert.ok(
                  local.copy(vertex).applyMatrix4(head.inverse).length() >= head.radius - 0.005,
                  `carrying hand inside a head at frame ${frame}`,
                );
          }
        });
    }
    for (const mug of mugs)
      mug.root.traverse((node) => {
        if (!node.isMesh) return;
        const positions = node.geometry.getAttribute('position');
        for (let v = 0; v < positions.count; v++) {
          vertex.fromBufferAttribute(positions, v).applyMatrix4(node.matrixWorld);
          for (const head of heads)
            assert.ok(
              local.copy(vertex).applyMatrix4(head.inverse).length() >= head.radius - 0.005,
              `beer mug inside a head at frame ${frame}`,
            );
        }
      });
    timeline.tick(timeline.cue.duration / 300);
  }
});

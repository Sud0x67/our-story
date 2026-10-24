import './fixtures/model-environment.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { OrthographicCamera, Vector3 } from 'three';
import { stars } from '../src/scenes/outdoors.js';
import { FilmTimeline } from '../src/timeline.js';
import { SCENES } from '../src/story-data.js';
import { projectionSize } from '../src/framing.js';

const index = SCENES.findIndex((scene) => scene.id === 'stars');
const update = (scene, timeline) => {
  scene.update({ time: timeline.ambientTime, progress: timeline.progress });
  scene.root.updateMatrixWorld(true);
};

test('one stargazing click reveals five staggered meteors and then returns to a quiet sky', () => {
  const scene = stars(),
    timeline = new FilmTimeline(SCENES, { index });
  const meteors = scene.memories.meteors;
  assert.equal(meteors.length, 5);
  timeline.tick(7);
  update(scene, timeline);
  assert.equal(timeline.phase, 'waiting');
  assert.ok(meteors.every((meteor) => !meteor.root.visible));
  timeline.tick(5);
  update(scene, timeline);
  assert.ok(
    meteors.every((meteor) => !meteor.root.visible),
    'waiting must not trigger a meteor',
  );
  timeline.interact();
  const seen = new Set(),
    firstSeen = [],
    previous = new Map();
  let peak = 0;
  for (let i = 0; i < 408; i++) {
    timeline.tick(1 / 60);
    update(scene, timeline);
    const visible = meteors.filter((meteor) => meteor.root.visible);
    peak = Math.max(peak, visible.length);
    for (const meteor of visible) {
      if (!seen.has(meteor)) {
        seen.add(meteor);
        firstSeen.push(meteors.indexOf(meteor));
      }
      assert.ok(meteor.head.material.opacity > 0);
      assert.ok(meteor.core.material.opacity > meteor.haze.material.opacity);
      const before = previous.get(meteor);
      if (before) {
        assert.ok(meteor.root.position.x <= before.x, 'a meteor reverses direction');
        assert.ok(meteor.root.position.y <= before.y, 'a meteor rises back up');
      }
      previous.set(meteor, meteor.root.position.clone());
    }
  }
  assert.equal(seen.size, 5);
  assert.deepEqual(firstSeen, [0, 1, 2, 3, 4]);
  assert.equal(peak, 2, 'brief pairs should overlap without a dense shower');
  timeline.tick(0.001);
  update(scene, timeline);
  assert.equal(timeline.phase, 'settled');
  assert.ok(meteors.every((meteor) => !meteor.root.visible && meteor.head.material.opacity === 0));
  assert.equal(timeline.needsInput, false);
  timeline.tick(3);
  assert.equal(timeline.phase, 'leaving');
  timeline.tick(1);
  assert.equal(timeline.index, index + 1);
  timeline.navigate(-1);
  timeline.tick(1);
  update(scene, timeline);
  assert.equal(timeline.elapsed, 0);
  assert.ok(meteors.every((meteor) => !meteor.root.visible));
});

test('the complete meteor heads and tapered trails remain inside narrow mobile and desktop views', () => {
  const scene = stars(),
    point = new Vector3();
  for (const [width, height] of [
    [320, 740],
    [390, 844],
    [1280, 720],
  ]) {
    for (let frame = 0; frame <= 240; frame++) {
      const progress = 7 / 24 + (frame / 240) * (1 - 7 / 24);
      scene.update({ time: 10, progress });
      scene.root.updateMatrixWorld(true);
      const t = progress * progress * (3 - 2 * progress),
        view = scene.view;
      const span = (view.span + (view.endSpan - view.span) * t) * 1.08;
      const size = projectionSize(span, width, height);
      const camera = new OrthographicCamera(
        -size.width / 2,
        size.width / 2,
        size.height / 2,
        -size.height / 2,
        0.1,
        180,
      );
      camera.position.fromArray(view.from.map((v, i) => v + (view.to[i] - v) * t));
      camera.lookAt(new Vector3(...view.target.map((v, i) => v + (view.endTarget[i] - v) * t)));
      camera.updateMatrixWorld(true);
      for (const meteor of scene.memories.meteors) {
        if (!meteor.root.visible) continue;
        for (const trail of [meteor.core, meteor.haze]) {
          const positions = trail.geometry.getAttribute('position');
          for (let i = 0; i < positions.count; i++) {
            point.fromBufferAttribute(positions, i).applyMatrix4(trail.matrixWorld).project(camera);
            assert.ok(
              Math.abs(point.x) < 0.94 && point.y > 0.02 && point.y < 0.94,
              `${width}×${height} meteor ${scene.memories.meteors.indexOf(meteor)} cropped: ${point.toArray()}`,
            );
          }
        }
      }
    }
  }
});

test('meteor pause, direct previews and replay restore exactly the same positions and fade', () => {
  const scene = stars();
  const snapshot = () =>
    scene.memories.meteors.flatMap((meteor) => [
      meteor.root.visible,
      ...meteor.root.position.toArray(),
      ...meteor.core.scale.toArray(),
      meteor.head.material.opacity,
      meteor.halo.material.opacity,
      meteor.core.material.opacity,
      meteor.haze.material.opacity,
    ]);
  const state = { time: 11.2, progress: 0.65 };
  scene.update(state);
  const expected = snapshot();
  scene.update(state);
  assert.deepEqual(snapshot(), expected);
  scene.update({ time: 30, progress: 1 });
  scene.update({ time: 0, progress: 0 });
  scene.update(state);
  assert.deepEqual(snapshot(), expected);
  for (const meteor of scene.memories.meteors) {
    const colors = meteor.core.geometry.getAttribute('color');
    assert.ok(colors.getX(0) > colors.getX(colors.count - 1), 'tail should fade toward its tip');
    assert.equal(meteor.head.material.map, scene.memories.meteors[0].head.material.map);
  }
});

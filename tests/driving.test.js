import './fixtures/model-environment.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import { Box3, Vector3, Quaternion, OrthographicCamera } from 'three';
import { driving } from '../src/scenes/vehicles.js';
import { DRIVE_ROUTE } from '../src/scenes/choreography.js';
import { FilmTimeline } from '../src/timeline.js';
import { SCENES } from '../src/story-data.js';
import { projectionSize, damping } from '../src/framing.js';

test('Xiaohe and the steering wheel are on the vehicle left, with Popo in the right passenger seat', () => {
  const scene = driving();
  for (const progress of [0, 0.3, 0.6, 1]) {
    scene.update({ time: progress * 20, progress });
    scene.root.updateMatrixWorld(true);
    const { car, driver, passenger, steering } = scene.contacts;
    const forward = new Vector3(0, 0, 1).applyQuaternion(car.getWorldQuaternion(new Quaternion()));
    const left = new Vector3(0, 1, 0).cross(forward);
    const center = car.getWorldPosition(new Vector3());
    const driverPosition = driver.root.getWorldPosition(new Vector3());
    const passengerPosition = passenger.root.getWorldPosition(new Vector3());
    assert.ok(driver.girl);
    assert.equal(passenger.girl, false);
    assert.ok(driverPosition.clone().sub(center).dot(left) > 0.6);
    assert.ok(passengerPosition.clone().sub(center).dot(left) < -0.6);
    assert.ok(steering.getWorldPosition(new Vector3()).sub(center).dot(left) > 0.6);
  }
});

test('one click drives several car lengths at practice speed, within the lane and clear of roadside props', () => {
  const scene = driving(),
    t = new FilmTimeline(SCENES, { index: SCENES.findIndex((s) => s.id === 'driving') });
  // Align the road with the test coordinate frame, preserving all car/road contacts.
  scene.contacts.road.rotation.y = 0;
  scene.update({ time: 0, progress: 0 });
  const start = scene.contacts.car.position.clone();
  t.tick(100);
  scene.update({ time: t.elapsed, progress: t.progress });
  assert.deepEqual(scene.contacts.car.position, start);
  t.tick(100);
  assert.equal(t.phase, 'waiting');
  scene.root.updateMatrixWorld(true);
  const props = scene.contacts.roadside.children.map((o) => new Box3().setFromObject(o, true));
  const roadTop = new Box3().setFromObject(scene.contacts.surface, true).max.y;
  t.interact();
  let previous = start.clone(),
    peak = 0;
  for (let i = 0; i <= 170; i++) {
    t.tick(0.05);
    scene.update({ time: t.elapsed, progress: t.progress });
    scene.root.updateMatrixWorld(true);
    const { car, wheels } = scene.contacts;
    assert.ok(car.position.z >= previous.z);
    assert.equal(car.position.x, DRIVE_ROUTE.lane);
    peak = Math.max(peak, car.position.distanceTo(previous) / 0.05);
    previous = car.position.clone();
    const bounds = new Box3().setFromObject(car, true);
    assert.ok(bounds.min.x > -3.2 && bounds.max.x < 0, 'car leaves its right-hand lane');
    for (const prop of props)
      assert.equal(bounds.intersectsBox(prop), false, 'car intersects roadside scenery');
    for (const wheel of wheels) {
      const gap = new Box3().setFromObject(wheel, true).min.y - roadTop;
      assert.ok(gap >= -0.001 && gap < 0.013, 'wheel loses contact with road: ' + gap);
    }
  }
  assert.equal(t.phase, 'settled');
  assert.ok(previous.distanceTo(start) >= 17.9);
  assert.ok(peak < 3.3, 'car accelerates too fast for the practice scene');
});

test('the car remains fully framed during the camera orbit and drive-away on portrait and landscape screens', () => {
  for (const [width, height] of [
    [390, 844],
    [1280, 720],
  ]) {
    const scene = driving(),
      t = new FilmTimeline(SCENES, { index: 12 });
    const initial = scene.view({ progress: 0 }),
      camera = new OrthographicCamera();
    camera.position.set(...initial.position);
    const target = new Vector3(...initial.target);
    let span = initial.span * 1.08;
    for (let frame = 0; frame <= 900; frame++) {
      if (t.phase === 'waiting') t.interact();
      if (t.phase === 'leaving') break;
      t.tick(1 / 60);
      scene.update({ time: t.elapsed, progress: t.progress });
      scene.root.updateMatrixWorld(true);
      const view = scene.view({ progress: t.progress });
      camera.position.lerp(new Vector3(...view.position), damping(3.7, 1 / 60));
      target.lerp(new Vector3(...view.target), damping(3.7, 1 / 60));
      span += (view.span * 1.08 - span) * damping(5, 1 / 60);
      const size = projectionSize(span, width, height);
      Object.assign(camera, {
        left: -size.width / 2,
        right: size.width / 2,
        top: size.height / 2,
        bottom: -size.height / 2,
        near: 0.1,
        far: 180,
      });
      camera.lookAt(target);
      camera.updateMatrixWorld(true);
      camera.updateProjectionMatrix();
      const bounds = new Box3().setFromObject(scene.contacts.car, true);
      for (const x of [bounds.min.x, bounds.max.x])
        for (const y of [bounds.min.y, bounds.max.y])
          for (const z of [bounds.min.z, bounds.max.z]) {
            const point = new Vector3(x, y, z).project(camera);
            assert.ok(
              Math.abs(point.x) < 0.98 && Math.abs(point.y) < 0.98,
              `car cropped at frame ${frame}, ${width}×${height}`,
            );
          }
    }
    assert.ok(scene.view({ progress: 1 }).span > scene.view({ progress: 0.3 }).span * 1.3);
  }
});

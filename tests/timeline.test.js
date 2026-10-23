import test from 'node:test';
import assert from 'node:assert/strict';
import { FilmTimeline } from '../src/timeline.js';
import { SCENES } from '../src/story-data.js';

test('the whole film stops at the closed ring box until a deliberate click', () => {
  const t = new FilmTimeline(SCENES, { interactive: false });
  t.tick(10000);
  assert.equal(t.scene.id, 'ring');
  assert.equal(t.waiting, true);
  assert.equal(t.opened, false);
  assert.equal(t.opening, 0);
  t.tick(10000);
  assert.equal(t.waiting, true);
  assert.equal(t.opened, false);
});
test('a click before the final approach finishes cannot reveal the proposal', () => {
  const t = new FilmTimeline(SCENES, { interactive: false });
  assert.equal(t.open(), false);
  t.goto(SCENES.length - 1);
  t.tick(18);
  assert.equal(t.open(), false);
  assert.equal(t.opening, 0);
});
test('the final click opens once, resumes a paused preview, and holds the result', () => {
  const t = new FilmTimeline(SCENES, { interactive: false, index: 18, elapsed: 19, paused: true });
  assert.equal(t.open(), true);
  assert.equal(t.paused, false);
  t.tick(4.5);
  assert.equal(t.opening, 1);
  assert.equal(t.open(), false);
  t.tick(10000);
  assert.equal(t.scene.id, 'ring');
  assert.equal(t.opening, 1);
});
test('pausing freezes playback and resuming preserves the remaining scene time', () => {
  const t = new FilmTimeline(SCENES, { interactive: false });
  t.tick(7);
  t.paused = true;
  t.tick(300);
  assert.equal(t.scene.id, 'river');
  assert.equal(t.elapsed, 7);
  t.paused = false;
  t.tick(19);
  assert.equal(t.scene.id, 'mountain');
  assert.equal(t.elapsed, 0);
});
test('replay clears the opened ring without skipping the opening scene', () => {
  const t = new FilmTimeline(SCENES, { interactive: false, index: 18, elapsed: 19 });
  t.open();
  t.tick(5);
  t.goto(0);
  assert.equal(t.scene.id, 'river');
  assert.equal(t.elapsed, 0);
  assert.equal(t.opened, false);
  assert.equal(t.opening, 0);
});
test('large playback steps cross chapters without losing time or overshooting the final hold', () => {
  const t = new FilmTimeline(SCENES, { interactive: false });
  t.tick(SCENES[0].duration + SCENES[1].duration + 5);
  assert.equal(t.scene.id, 'bar');
  assert.equal(t.elapsed, 5);
  t.tick(NaN);
  t.tick(-2);
  assert.equal(t.elapsed, 5);
});

for (const phase of [
  'arriving',
  'waiting',
  'acting',
  'settled',
  'leaving',
  'ring-arriving',
  'ring-waiting',
  'ring-opened',
])
  test(`a paused ${phase} resumes on click without changing its pose, action or destination`, () => {
    const t = new FilmTimeline(SCENES);
    if (phase === 'arriving') t.tick(3);
    else if (phase.startsWith('ring')) {
      t.goto(18, phase === 'ring-arriving' ? 3 : 19);
      if (phase === 'ring-opened') {
        t.open();
        t.tick(2);
      }
    } else {
      t.tick(100);
      if (phase === 'acting' || phase === 'settled') {
        t.interact();
        t.tick(phase === 'acting' ? 1 : 20);
      }
      if (phase === 'leaving') {
        t.navigate(1);
        t.tick(0.3);
      }
    }
    t.paused = true;
    const snapshot = () => [
      t.index,
      t.elapsed,
      t.phase,
      t.action,
      t.actionStart,
      t.actionElapsed,
      t.settleElapsed,
      t.exitElapsed,
      t.pendingAction,
      t.autoContinue,
      t.destination,
      t.opened,
      t.openElapsed,
    ];
    const before = snapshot();
    assert.equal(t.interact(), true);
    assert.equal(t.paused, false);
    assert.deepEqual(snapshot(), before);
  });

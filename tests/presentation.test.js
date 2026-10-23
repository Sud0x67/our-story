import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { FilmTimeline } from '../src/timeline.js';
import { SCENES, PROPOSAL } from '../src/story-data.js';
import { createFilmPresenter, describeFilm } from '../src/presentation.js';
import { playbackOptions, resolveSceneIndex } from '../src/playback-options.js';
import { createThemeBootstrap } from '../src/theme-bootstrap.js';
import { scenePalette } from '../src/art-direction.js';

function documentFixture() {
  const writes = [];
  const elements = new Map();
  for (const id of ['film', 'world', 'caption', 'transition', 'proposal', 'proposal-announcement', 'loading', 'world-error', 'theme-color']) {
    const attributes = new Map();
    let text = '';
    elements.set(id, {
      dataset: {},
      attributes,
      classList: { toggle(name, value) { writes.push([id, name, value]); } },
      get textContent() { return text; },
      set textContent(value) { text = value; writes.push([id, 'text', value]); },
      setAttribute(name, value) { attributes.set(name, value); writes.push([id, name, value]); },
    });
  }
  const styles = new Map();
  return {
    writes, elements, styles,
    documentElement: { dataset: {}, style: { setProperty(name, value) { styles.set(name, value); } } },
    getElementById(id) { return elements.get(id); },
    querySelector() { return elements.get('theme-color'); },
  };
}

test('the proposal uses a persistent, atomic live region separate from its visual animation', () => {
  const html = readFileSync('index.html', 'utf8');
  const visual = html.match(/<p\b[^>]*id="proposal"[^>]*>/)[0];
  const live = html.match(/<p\b[^>]*id="proposal-announcement"[^>]*>/)[0];
  assert.match(visual, /aria-hidden="true"/);
  assert.doesNotMatch(visual, /aria-live/);
  assert.match(live, /role="status"/);
  assert.match(live, /aria-live="polite"/);
  assert.match(live, /aria-atomic="true"/);
  assert.doesNotMatch(live, /aria-hidden|\shidden/);
});

test('opening announces the proposal once, and replay clears it without hiding the live region', () => {
  const doc = documentFixture(), presenter = createFilmPresenter(doc);
  const timeline = new FilmTimeline(SCENES, { index: 18, elapsed: 19 });
  presenter.update(timeline);timeline.open();timeline.tick(3);presenter.update(timeline);
  assert.equal(doc.getElementById('proposal-announcement').textContent, '');
  timeline.tick(1);presenter.update(timeline);
  for (let i = 0; i < 100; i++) { timeline.tick(.01);presenter.update(timeline); }
  assert.deepEqual(doc.writes.filter(([id, kind, value]) => id === 'proposal-announcement' && kind === 'text' && value === PROPOSAL), [['proposal-announcement', 'text', PROPOSAL]]);
  assert.equal(doc.writes.some(([id, kind]) => id === 'proposal-announcement' && kind === 'aria-hidden'), false);
  timeline.restart();presenter.update(timeline);
  assert.equal(doc.getElementById('proposal-announcement').textContent, '');
});

test('unchanged playback states do not rewrite status or construct another label', () => {
  const doc = documentFixture(), presenter = createFilmPresenter(doc);
  const timeline = new FilmTimeline(SCENES);timeline.tick(100);presenter.update(timeline);
  doc.writes.length = 0;
  for (let i = 0; i < 120; i++) { timeline.tick(.01);presenter.update(timeline); }
  assert.deepEqual(doc.writes, []);
  timeline.paused = true;presenter.update(timeline);
  assert.match(doc.getElementById('world').attributes.get('aria-label'), /已暂停，点击继续播放/);
});

test('missing film markup fails with a useful element name', () => {
  const doc = documentFixture();doc.elements.delete('proposal-announcement');
  assert.throws(() => createFilmPresenter(doc), /Missing film element: #proposal-announcement/);
});

test('the ring approach announces its ready state when the camera reaches the closed box', () => {
  const doc = documentFixture(), presenter = createFilmPresenter(doc);
  const timeline = new FilmTimeline(SCENES, { index: 18, elapsed: 18 });
  presenter.update(timeline);assert.equal(doc.getElementById('film').dataset.status, 'arriving');
  timeline.tick(1);presenter.update(timeline);
  assert.equal(doc.getElementById('film').dataset.status, 'waiting');
  assert.equal(doc.getElementById('world').attributes.get('aria-label'), '点击打开戒指盒');
});

test('direct scene links initialize the correct label and reject fractional or non-finite indices', () => {
  for (const scene of SCENES) {
    const options = playbackOptions('?scene=' + scene.id, SCENES);
    assert.equal(SCENES[options.index].id, scene.id);
    assert.match(describeFilm(new FilmTimeline(SCENES, options)).label, new RegExp(scene.title));
  }
  assert.equal(resolveSceneIndex('8', SCENES), 7);
  for (const value of ['1.5', 'NaN', 'Infinity', 'unknown']) assert.equal(resolveSceneIndex(value, SCENES), 0);
  assert.equal(resolveSceneIndex('999', SCENES), 18);
  const options = playbackOptions('?at=Infinity&speed=NaN', SCENES);
  assert.equal(options.elapsed, 0);assert.equal(options.speed, 1);
});

test('the parser-time bootstrap matches both looks and every direct scene before 3D loads', () => {
  const source = createThemeBootstrap(SCENES);
  for (const look of ['clay', 'paper']) for (const [index, scene] of SCENES.entries()) {
    for (const requested of [scene.id, String(index + 1)]) {
      const doc = documentFixture();
      runInNewContext(source, { document: doc, location: { search: `?look=${look}&scene=${requested}` }, URLSearchParams });
      const palette = scenePalette(look, scene.id);
      assert.equal(doc.documentElement.dataset.look, look);assert.equal(doc.documentElement.dataset.scene, scene.id);
      assert.equal(doc.styles.get('--sky'), palette.sky);assert.equal(doc.styles.get('--ground'), palette.ground);
      assert.equal(doc.documentElement.style.colorScheme, palette.scheme);
      assert.equal(doc.getElementById('theme-color').attributes.get('content'), palette.sky);
    }
  }
  const html = readFileSync('index.html', 'utf8');
  assert.ok(html.indexOf('<!-- story-theme-bootstrap -->') < html.indexOf('rel="stylesheet"'));
});

import { createWorld } from './world.js';
import { SCENES } from './story-data.js';
import { FilmTimeline } from './timeline.js';
import { pointerIntent, WheelIntent } from './gestures.js';
import { Ambience } from './audio.js';
import { ART, LOOK } from './art-direction.js';
import { playbackOptions } from './playback-options.js';
import { createFilmPresenter } from './presentation.js';
document.documentElement.dataset.look = LOOK;
document.title = `坡坡与小禾 · ${ART.name}`;
const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);
const timeline = new FilmTimeline(SCENES, playbackOptions(location.search, SCENES));
const audio = new Ambience();
let world = null,
  raf = 0,
  previous = performance.now(),
  disposed = false,
  currentCaption = '',
  captionTimer = null,
  loaded = false;
let presenter = null;
let captionsEnabled = !params.has('clean'),
  pointerStart = null,
  sceneId = null;
let idleTime = 0;
const wheelIntent = new WheelIntent();
const activePointers = new Set();
let multiTouch = false;
function fail(error) {
  console.error(error);
  $('film')?.classList.add('failed');
  const message = $('world-error');
  if (message) message.hidden = false;
  cancelAnimationFrame(raf);
}
try {
  presenter = createFilmPresenter(document);
  world = createWorld($('world'), { onError: fail });
} catch (error) {
  fail(error);
}
function showCaption(text) {
  if (text === currentCaption) return;
  currentCaption = text;
  clearTimeout(captionTimer);
  $('caption').classList.remove('visible');
  captionTimer = setTimeout(() => {
    $('caption').textContent = text;
    $('caption').classList.toggle('visible', Boolean(text));
  }, 260);
}
function render(now) {
  if (disposed || !world) return;
  raf = requestAnimationFrame(render);
  const dt = Math.min(0.12, Math.max(0, (now - previous) / 1000));
  previous = now;
  if (document.hidden) return;
  timeline.tick(dt);
  const scene = timeline.scene;
  if (scene.id !== sceneId) idleTime = 0;
  if (!timeline.paused && (timeline.waiting || timeline.opened)) idleTime += dt;
  const proposed = presenter.update(timeline);
  try {
    world.render({
      id: scene.id,
      time: timeline.elapsed + idleTime,
      progress: timeline.progress,
      opening: timeline.opening,
      opened: timeline.opened,
      action: timeline.action,
      phase: timeline.phase,
      continuing: timeline.autoContinue || timeline.pendingAction,
      transition: timeline.transition,
      delta: dt,
      paused: timeline.paused,
    });
  } catch (error) {
    fail(error);
    return;
  }
  sceneId = scene.id;
  const fadeIn = Math.max(0, 1 - timeline.elapsed / 1.15);
  const fadeOut = timeline.interactive
    ? timeline.transition
    : timeline.isFinal
      ? 0
      : Math.max(0, (timeline.elapsed - scene.duration + 1.1) / 1.1);
  const opacity = String(timeline.paused ? 0 : Math.min(1, Math.max(fadeIn, fadeOut)));
  if ($('transition').style.opacity !== opacity) $('transition').style.opacity = opacity;
  showCaption(proposed ? '' : timeline.caption().text);
  $('caption').classList.toggle('suppressed', !captionsEnabled);
  if (!loaded) {
    loaded = true;
    $('loading').classList.add('ready');
    $('loading').setAttribute('aria-hidden', 'true');
  }
  audio.setQuiet(timeline.paused, proposed);
  if (!timeline.paused) audio.update();
}
if (world) raf = requestAnimationFrame(render);
async function startAudio() {
  try {
    if (!audio.started) await audio.start();
  } catch {
    /* Visual playback continues if audio is unavailable. */
  }
}
function act(intent) {
  if (!intent) return;
  if (intent === 'previous') timeline.navigate(-1);
  else if (intent === 'next') timeline.navigate(1);
  else timeline.interact();
  startAudio();
}
$('world')?.addEventListener('pointerdown', (event) => {
  if (event.button !== 0) return;
  activePointers.add(event.pointerId);
  if (activePointers.size === 1) {
    pointerStart = { x: event.clientX, y: event.clientY, id: event.pointerId };
    multiTouch = false;
  } else multiTouch = true;
  startAudio();
});
window.addEventListener('pointerup', (event) => {
  activePointers.delete(event.pointerId);
  if (activePointers.size) return;
  const intent =
    pointerStart?.id === event.pointerId
      ? pointerIntent(pointerStart, { x: event.clientX, y: event.clientY }, { multiTouch })
      : null;
  pointerStart = null;
  multiTouch = false;
  act(intent);
});
window.addEventListener('pointercancel', (event) => {
  activePointers.delete(event.pointerId);
  pointerStart = null;
  if (!activePointers.size) multiTouch = false;
});
$('world')?.addEventListener(
  'wheel',
  (event) => {
    if (event.ctrlKey || event.metaKey) return;
    event.preventDefault();
    event.stopPropagation();
    if (timeline.phase === 'leaving') return;
    const delta =
      (Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY) *
      (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1);
    act(wheelIntent.push(delta, performance.now()));
  },
  { passive: false, capture: true },
);
async function fullscreen() {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await $('film').requestFullscreen();
  } catch {
    /* Browser viewport remains full-size. */
  }
}
window.addEventListener('keydown', (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey) return;
  if (['Space', 'ArrowRight', 'ArrowLeft', 'Enter', 'Home', 'End'].includes(event.code))
    event.preventDefault();
  if (
    event.repeat &&
    [
      'Space',
      'ArrowRight',
      'ArrowLeft',
      'Enter',
      'Home',
      'End',
      'KeyR',
      'KeyT',
      'KeyM',
      'KeyF',
    ].includes(event.code)
  )
    return;
  if (event.code === 'Space') {
    timeline.paused = !timeline.paused;
    startAudio();
  } else if (event.code === 'ArrowRight') act('next');
  else if (event.code === 'ArrowLeft') act('previous');
  else if (event.code === 'Home' || event.code === 'KeyR') timeline.restart();
  else if (event.code === 'End') timeline.goto(SCENES.length - 1, SCENES.at(-1).waitAt);
  else if (event.code === 'Enter') act('tap');
  else if (event.code === 'KeyT') captionsEnabled = !captionsEnabled;
  else if (event.code === 'KeyM') audio.toggle().catch(() => {});
  else if (event.code === 'KeyF') fullscreen();
});
document.addEventListener('visibilitychange', () => {
  previous = performance.now();
  audio.setQuiet(document.hidden || timeline.paused, timeline.opening > 0.78);
});
window.addEventListener('pagehide', (event) => {
  if (event.persisted) {
    audio.setQuiet(true);
    return;
  }
  disposed = true;
  cancelAnimationFrame(raf);
  clearTimeout(captionTimer);
  world?.dispose();
  audio.dispose();
});
window.addEventListener('pageshow', () => {
  previous = performance.now();
});

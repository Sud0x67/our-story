import { PROPOSAL } from './story-data.js';

export function describeFilm(timeline) {
  const { scene, phase, paused, isFinal, opened, waiting } = timeline;
  const continuing = timeline.autoContinue || timeline.pendingAction;
  const proposed = isFinal && timeline.opening > 0.78;
  const status = paused
    ? 'paused'
    : isFinal
      ? opened
        ? 'opened'
        : waiting
          ? 'waiting'
          : 'arriving'
      : phase;
  let label;
  if (paused) label = `${scene.title}，已暂停，点击继续播放`;
  else if (isFinal) label = opened ? '戒指盒已打开' : waiting ? '点击打开戒指盒' : scene.title;
  else if (phase === 'leaving') label = `${scene.title}，正在转场`;
  else if (continuing)
    label = `${scene.title}，已触发，动作完成并停留后自动转场，左右滑动可切换场景`;
  else if (phase === 'settled') label = `${scene.title}，点击继续，左滑下一幕，右滑上一幕`;
  else label = `${scene.title}，${timeline.cue.label}，左滑下一幕，右滑上一幕`;
  return { status, label, proposed };
}

export function createFilmPresenter(doc) {
  const elements = {};
  for (const id of [
    'film',
    'world',
    'caption',
    'transition',
    'proposal',
    'proposal-announcement',
    'loading',
    'world-error',
  ]) {
    const element = doc.getElementById(id);
    if (!element) throw new Error(`Missing film element: #${id}`);
    elements[id] = element;
  }
  let previous = null;
  return {
    update(timeline) {
      const { index, phase, paused, opened, waiting } = timeline;
      const continuing = timeline.autoContinue || timeline.pendingAction;
      const proposed = timeline.isFinal && timeline.opening > 0.78;
      if (
        previous &&
        previous.index === index &&
        previous.phase === phase &&
        previous.paused === paused &&
        previous.opened === opened &&
        previous.waiting === waiting &&
        previous.continuing === continuing &&
        previous.proposed === proposed
      )
        return proposed;
      previous = { index, phase, paused, opened, waiting, continuing, proposed };
      const description = describeFilm(timeline);
      elements.film.dataset.status = description.status;
      elements.film.dataset.phase = phase;
      elements.film.dataset.scene = timeline.scene.id;
      elements.world.setAttribute('aria-label', description.label);
      const proposalText = proposed ? PROPOSAL : '';
      for (const element of [elements.proposal, elements['proposal-announcement']]) {
        if (element.textContent !== proposalText) element.textContent = proposalText;
      }
      elements.proposal.classList.toggle('visible', proposed);
      return proposed;
    },
  };
}

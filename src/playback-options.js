export function resolveSceneIndex(requested, scenes) {
  if (!requested) return 0;
  const named = scenes.findIndex((scene) => scene.id === requested);
  if (named >= 0) return named;
  const number = Number(requested);
  if (!Number.isInteger(number)) return 0;
  return Math.max(0, Math.min(scenes.length - 1, number - 1));
}

export function playbackOptions(search, scenes) {
  const params = new URLSearchParams(search);
  const elapsed = Number(params.get('at'));
  const speed = Number(params.get('speed'));
  return {
    index: resolveSceneIndex(params.get('scene'), scenes),
    elapsed: Number.isFinite(elapsed) ? Math.max(0, elapsed) : 0,
    speed: Number.isFinite(speed) && speed > 0 ? Math.max(.25, Math.min(60, speed)) : 1,
    paused: params.has('paused'),
    interactive: !params.has('autoplay'),
  };
}

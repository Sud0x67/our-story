export function projectionSize(span, width, height, final = false) {
  const aspect = Math.max(width, 1) / Math.max(height, 1);
  const vertical = final ? Math.max(span, 4.6 / aspect) : span * Math.max(1, 0.78 / aspect);
  return { width: vertical * aspect, height: vertical };
}

export function damping(rate, seconds) {
  return 1 - Math.exp(-rate * Math.max(0, seconds));
}

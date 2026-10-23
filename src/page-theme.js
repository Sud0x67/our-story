// Shared by the parser-time bootstrap and the WebGL scene switch.
export function applyPageTheme(doc, palette) {
  const root = doc.documentElement;
  root.dataset.look = palette.look;
  root.dataset.scene = palette.scene;
  root.style.setProperty('--sky', palette.sky);
  root.style.setProperty('--ground', palette.ground);
  root.style.setProperty('--transition-color', palette.curtain);
  root.style.setProperty('--caption-ink', palette.ink);
  root.style.setProperty('--caption-shadow', palette.shadow);
  root.style.colorScheme = palette.scheme;
  const meta = doc.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', palette.sky);
}

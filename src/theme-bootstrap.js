import { scenePalette, selectLook } from './art-direction.js';
import { resolveSceneIndex } from './playback-options.js';
import { applyPageTheme } from './page-theme.js';

// Vite inlines this small classic script before the stylesheet and deferred 3D bundle.
// The palette is generated from the same art direction used by the running scene.
export function createThemeBootstrap(scenes) {
  const ids = scenes.map(({ id }) => ({ id }));
  const palettes = Object.fromEntries(
    ['clay', 'paper'].map((look) => [
      look,
      scenes.map(({ id }) => ({ ...scenePalette(look, id), look, scene: id })),
    ]),
  );
  function bootstrap(resolveIndex, chooseLook, applyTheme, scenes, palettes) {
    const params = new URLSearchParams(location.search);
    const look = chooseLook(location.search);
    const index = resolveIndex(params.get('scene'), scenes);
    applyTheme(document, palettes[look][index]);
  }
  return `(${bootstrap.toString()})(${resolveSceneIndex.toString()},${selectLook.toString()},${applyPageTheme.toString()},${JSON.stringify(ids)},${JSON.stringify(palettes)});`;
}

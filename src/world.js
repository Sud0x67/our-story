import { applyPageTheme } from './page-theme.js';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { river, mountain, ringScene } from './scenes/beginning.js';
import { bar, museum, skewersDinner, shop, barbecue, coffee } from './scenes/indoors.js';
import { live, concert } from './scenes/performances.js';
import { crabs, stars, camp, swans, forest, beach } from './scenes/outdoors.js';
import { cycling, driving } from './scenes/vehicles.js';
import { mix, smooth } from './scenes/kit.js';
import { extendEnvironment } from './scenes/environment.js';
import { createInteractionEffects } from './scenes/interaction-effects.js';
import { projectionSize, damping } from './framing.js';
import { ART, LOOK, themeFor, scenePalette } from './art-direction.js';

const factories = {
  river,
  mountain,
  bar,
  live,
  museum,
  skewers: skewersDinner,
  crabs,
  stars,
  shop,
  cycling,
  camp,
  concert,
  driving,
  barbecue,
  swans,
  forest,
  coffee,
  beach,
  ring: ringScene,
};

export function createWorld(container, { onError } = {}) {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
  renderer.setClearColor(0, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = ART.exposure;
  renderer.domElement.setAttribute('aria-hidden', 'true');
  container.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-10, 10, 7, -7, 0.1, 180);
  const ambient = new THREE.HemisphereLight(ART.ambient, ART.bounce, 1.45);
  scene.add(ambient);
  const sun = new THREE.DirectionalLight('#ffe8bc', 3);
  sun.position.set(-9, 18, 11);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1536, 1536);
  Object.assign(sun.shadow.camera, {
    left: -17,
    right: 17,
    top: 17,
    bottom: -17,
    near: 0.1,
    far: 65,
  });
  sun.shadow.normalBias = 0.045;
  sun.shadow.bias = -0.0001;
  scene.add(sun);
  sun.shadow.intensity = ART.shadow;
  sun.shadow.radius = 3;
  const fill = new THREE.DirectionalLight(ART.fill, 0.8);
  fill.position.set(12, 9, -10);
  scene.add(fill);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.dampingFactor = 0.07;
  controls.mouseButtons.LEFT = null;
  controls.mouseButtons.RIGHT = THREE.MOUSE.ROTATE;
  controls.touches.ONE = null;
  controls.touches.TWO = THREE.TOUCH.DOLLY_ROTATE;
  controls.enableZoom = false;
  controls.minPolarAngle = 0.28;
  controls.maxPolarAngle = 1.3;
  controls.minZoom = 0.75;
  controls.maxZoom = 2.4;
  controls.rotateSpeed = 0.38;
  controls.zoomSpeed = 0.6;
  const cache = new Map();
  let current = null,
    currentId = null,
    width = 1,
    height = 1,
    manualUntil = 0,
    dragging = false,
    frame = 0,
    disposed = false;
  let lastState = '',
    lastSpan = 0,
    lastZoom = 0,
    needsDraw = true;
  const lastCameraPosition = new THREE.Vector3(Infinity, Infinity, Infinity),
    lastCameraRotation = new THREE.Quaternion();
  const debug = new URLSearchParams(location.search).has('debug');
  const invalidate = () => {
    needsDraw = true;
  };
  window.addEventListener('memory-assets-ready', invalidate);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const target = new THREE.Vector3(),
    position = new THREE.Vector3();
  let activeSpan = 12;
  const observer = new ResizeObserver(() => {
    width = container.clientWidth;
    height = container.clientHeight;
    renderer.setSize(width, height);
    project(activeSpan);
    needsDraw = true;
  });
  observer.observe(container);
  function project(span) {
    const size = projectionSize(span, width, height, currentId === 'ring');
    camera.left = -size.width / 2;
    camera.right = size.width / 2;
    camera.top = size.height / 2;
    camera.bottom = -size.height / 2;
    camera.updateProjectionMatrix();
  }
  controls.addEventListener('start', () => {
    dragging = true;
    manualUntil = performance.now() + 5000;
  });
  controls.addEventListener('end', () => {
    dragging = false;
    manualUntil = performance.now() + 3500;
  });
  function getView(state) {
    const view = typeof current.view === 'function' ? current.view(state) : current.view;
    const framing =
      currentId === 'ring' || currentId === 'river' || currentId === 'mountain' ? 1 : 1.08;
    if (view.position) return { ...view, span: view.span * framing };
    const p = smooth(state.progress);
    return {
      position: view.from.map((v, i) => mix(v, view.to[i], p)),
      target: view.target.map((v, i) => mix(v, view.endTarget[i], p)),
      span: mix(view.span, view.endSpan, p) * framing,
    };
  }
  function show(id, state) {
    if (!factories[id]) throw new Error(`Unknown memory: ${id}`);
    if (current) current.root.visible = false;
    if (!cache.has(id)) {
      const setting = factories[id]();
      extendEnvironment(setting, id);
      setting.effects = createInteractionEffects(setting, id);
      setting.root.visible = false;
      scene.add(setting.root);
      cache.set(id, setting);
    }
    current = cache.get(id);
    current.root.visible = true;
    currentId = id;
    controls.maxPolarAngle = id === 'stars' ? 1.55 : 1.42;
    const theme = themeFor(current.theme, id);
    applyPageTheme(document, { ...scenePalette(LOOK, id), look: LOOK, scene: id });
    scene.fog = new THREE.FogExp2(
      theme.background,
      id === 'stars' ? 0.008 : current.root.userData.indoor ? 0.014 : 0.019,
    );
    ambient.intensity = theme.ambient;
    sun.intensity = theme.intensity;
    sun.color.set(theme.sun);
    const view = getView(state);
    camera.position.set(...view.position);
    controls.target.set(...view.target);
    camera.zoom = 1;
    activeSpan = view.span;
    project(activeSpan);
    controls.update();
    manualUntil = 0;
    renderer.shadowMap.needsUpdate = true;
    current.root.userData.memory = id;
  }
  const onContextLost = (e) => {
    e.preventDefault();
    onError?.(new Error('3D context lost'));
  };
  renderer.domElement.addEventListener('webglcontextlost', onContextLost);
  return {
    render(state) {
      if (disposed) return;
      if (state.id !== currentId) show(state.id, state);
      const stamp = `${state.id}:${state.time}:${state.progress}:${state.opening}:${state.opened}:${state.action}:${state.phase}:${state.needsInput}:${state.continuing}:${state.transition}:${state.paused}`;
      const changed = stamp !== lastState;
      if (changed || !state.paused) {
        current.update?.(state);
        current.root.position.y = 0;
      }
      lastState = stamp;
      if (!dragging && performance.now() > manualUntil) {
        const view = getView(state);
        position.set(...view.position);
        target.set(...view.target);
        const follow = damping(3.7, state.delta);
        camera.position.lerp(position, follow);
        controls.target.lerp(target, follow);
        activeSpan = mix(
          activeSpan,
          view.span * (1 - (state.transition || 0) * 0.045),
          damping(5, state.delta),
        );
        camera.zoom = mix(camera.zoom, 1, damping(3, state.delta));
        project(activeSpan);
      }
      controls.update();
      current.effects.update(state, camera);
      const moved =
        lastCameraPosition.distanceToSquared(camera.position) > 1e-10 ||
        1 - Math.abs(lastCameraRotation.dot(camera.quaternion)) > 1e-10 ||
        Math.abs(lastSpan - activeSpan) > 1e-4 ||
        Math.abs(lastZoom - camera.zoom) > 1e-5;
      if (needsDraw || !state.paused || changed || moved) {
        if (frame++ % 5 === 0 || changed) renderer.shadowMap.needsUpdate = true;
        renderer.render(scene, camera);
        needsDraw = false;
        if (debug) renderer.domElement.dataset.frames = String(frame);
        lastCameraPosition.copy(camera.position);
        lastCameraRotation.copy(camera.quaternion);
        lastSpan = activeSpan;
        lastZoom = camera.zoom;
      }
    },
    dispose() {
      disposed = true;
      window.removeEventListener('memory-assets-ready', invalidate);
      observer.disconnect();
      controls.dispose();
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      const geos = new Set(),
        mats = new Set(),
        textures = new Set();
      scene.traverse((o) => {
        if (o.isInstancedMesh) o.dispose();
        if (o.geometry) geos.add(o.geometry);
        if (o.material)
          for (const m of Array.isArray(o.material) ? o.material : [o.material]) {
            mats.add(m);
            if (m.map) textures.add(m.map);
          }
      });
      geos.forEach((g) => g.dispose());
      textures.forEach((t) => t.dispose());
      mats.forEach((m) => m.dispose());
      renderer.dispose();
    },
  };
}

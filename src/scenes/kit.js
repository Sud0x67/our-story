import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { ART, LOOK, paintColor } from '../art-direction.js';

const palette = {
  grass: '#7e9665', soil: '#4c6250', dark: '#293f32', water: '#527e7c',
  leaf: '#6f8c5a', leafLight: '#a1ad73', bark: '#655440', path: '#c9b894',
  cream: '#e2d7b8', roof: '#454c43', timber: '#6c5b45', blue: '#8bb7c5',
  skin: '#efc69f', hair: '#292c29', gold: '#edc582', rose: '#c58677',
};
const matCache = new Map();
const material = (color, options = {}) => {
  const key = color + JSON.stringify(options);
  if (!matCache.has(key)) matCache.set(key, new THREE.MeshStandardMaterial({ color:paintColor(color), roughness: ART.rounded?.86:1, flatShading: !ART.rounded, ...options }));
  return matCache.get(key);
};
function mesh(parent, geometry, color, position = [0, 0, 0], options = {}) {
  const item = new THREE.Mesh(geometry, typeof color === 'string' ? material(color, options) : color);
  item.position.set(...position); item.castShadow = true; item.receiveShadow = true; parent.add(item); return item;
}
function box(parent, size, color, position, options) {
  const smallest=Math.min(...size);
  const geometry=ART.rounded&&smallest>.045&&Math.max(...size)>.16?new RoundedBoxGeometry(...size,1,Math.min(.065,smallest*.18)):new THREE.BoxGeometry(...size);
  return mesh(parent,geometry,color,position,options);
}
function ball(parent, radius, color, position, detail = 0) { return mesh(parent, new THREE.IcosahedronGeometry(radius, ART.rounded?Math.max(1,detail):detail), color, position); }
function cylinder(parent, top, bottom, height, color, position, sides = 8) { return mesh(parent, new THREE.CylinderGeometry(top, bottom, height, ART.rounded?Math.max(12,sides):sides), color, position); }
function line(parent, points, color, opacity = 1) {
  const item = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points.map(p => new THREE.Vector3(...p))), new THREE.LineBasicMaterial({ color, transparent: opacity < 1, opacity }));
  parent.add(item); return item;
}
function roundedGeometry(width, depth, height, radius = .22, bevel = .08) {
  const shape = new THREE.Shape(); const x = -width / 2, y = -depth / 2;
  shape.moveTo(x + radius, y); shape.lineTo(x + width - radius, y); shape.quadraticCurveTo(x + width, y, x + width, y + radius);
  shape.lineTo(x + width, y + depth - radius); shape.quadraticCurveTo(x + width, y + depth, x + width - radius, y + depth);
  shape.lineTo(x + radius, y + depth); shape.quadraticCurveTo(x, y + depth, x, y + depth - radius);
  shape.lineTo(x, y + radius); shape.quadraticCurveTo(x, y, x + radius, y);
  const geo = new THREE.ExtrudeGeometry(shape, { depth: height, bevelEnabled: true, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 1, steps: 1, curveSegments: 3 });
  geo.rotateX(-Math.PI / 2); return geo;
}
function base(parent, width = 16, depth = 10.5, top = palette.grass) {
  // A ground surface extending far beyond the camera replaces the miniature display plinth.
  const ground=mesh(parent,new THREE.PlaneGeometry(512,512),top,[0,.01,0]);
  ground.rotation.x=-Math.PI/2;ground.castShadow=false;ground.userData.seamlessGround=true;
  return ground;
}
function tree(parent, x, z, scale = 1, kind = 'round', y = 0) {
  const g = new THREE.Group(); g.position.set(x, y, z); g.scale.setScalar(scale); parent.add(g);
  cylinder(g, .09, .15, 1.35, palette.bark, [0, .6, 0], 5);
  if (kind === 'pine') {
    for (let i = 0; i < 3; i++) mesh(g, new THREE.ConeGeometry(.8 - i * .17, 1.3, 6), ['#45694c', '#5b7a54', '#779363'][i], [0, 1 + i * .45, 0]);
  } else {
    const colors = kind === 'pink' ? ['#cda497', '#dfb8a6', '#b58f83'] : [palette.leaf, palette.leafLight, '#a3ba93'];
    const foliage = ball(g, .85, colors[0], [0, 1.65, 0]); foliage.scale.set(1, 1.1, .9);
    ball(g, .58, colors[1], [.47, 1.56, .13]); ball(g, .54, colors[2], [-.45, 1.43, -.06]);
    cylinder(g, .04, .07, .65, palette.bark, [.25, 1.02, 0], 5).rotation.z = -.6;
  }
  return g;
}
function grassTuft(parent, x, z, y = 0, color = '#98ab71') {
  for (let i = 0; i < 3; i++) { const blade = mesh(parent, new THREE.ConeGeometry(.035, .25 + i * .035, 3), color, [x + i * .055, y + .1, z]); blade.rotation.z = (i - 1) * .22; }
}
function flower(parent, x, z, color = '#e5ce9a') {
  cylinder(parent, .015, .015, .2, '#7d9759', [x, .08, z], 3);
  ball(parent, .075, color, [x, .21, z]);
}
function textSign(parent, text, width, height, position, bg = '#68634d', fg = '#e7d5a8') {
  const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 128;
  const ctx = canvas.getContext('2d'); ctx.fillStyle = bg; ctx.fillRect(0, 0, 512, 128);
  ctx.strokeStyle = '#d3c29277'; ctx.lineWidth = 3; ctx.strokeRect(8, 8, 496, 112);
  ctx.font = '48px "Noto Serif CJK SC", SimSun, serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = fg; ctx.fillText(text, 256, 65);
  const tex = new THREE.CanvasTexture(canvas); tex.colorSpace = THREE.SRGBColorSpace;
  return mesh(parent, new THREE.PlaneGeometry(width, height), new THREE.MeshStandardMaterial({ map: tex, roughness: 1 }), position);
}
function roof(parent, w, d, h, position) {
  const A = [-w/2,0,-d/2], B = [w/2,0,-d/2], C = [w/2,0,d/2], D = [-w/2,0,d/2], E = [-w/2,h,0], F = [w/2,h,0];
  const vertices = [...A,...E,...F, ...A,...F,...B, ...D,...C,...F, ...D,...F,...E, ...A,...D,...E, ...B,...F,...C];
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3)); geo.computeVertexNormals();
  const r = mesh(parent, geo, palette.roof, position); const g = new THREE.Group(); g.position.set(...position); parent.add(g);
  for (let i = -4; i <= 4; i++) {
    const z = i * d / 9, y = h * (1 - Math.abs(z) / (d / 2)) + .012;
    line(g, [[-w/2, y, z], [w/2, y, z]], '#77766a', .45);
  }
  cylinder(g, .045, .045, w + .12, '#767869', [0, h + .02, 0], 6).rotation.z = Math.PI / 2;
  return r;
}
function house(parent, x, z, w = 2.6, d = 2, h = 1.75, sign = '小河人家') {
  const g = new THREE.Group(); g.position.set(x, 0, z); parent.add(g);
  box(g, [w + .2, .13, d + .2], '#a39a7f', [0, .02, 0]);
  box(g, [w, h, d], palette.cream, [0, h/2 + .08, 0]);
  for (const px of [-w/2 + .06, w/2 - .06]) box(g, [.09, h + .1, .11], palette.timber, [px, h/2, d/2+.015]);
  box(g, [w, .09, .08], palette.timber, [0, h*.66, d/2+.02]);
  box(g, [.5, 1.1, .07], '#655b46', [0, .62, d/2+.05]);
  for (const px of [-w*.3, w*.3]) {
    box(g, [.57, .62, .05], '#655b46', [px, h*.56, d/2+.03]);
    box(g, [.45, .5, .06], '#e2bc76', [px, h*.56, d/2+.07], { emissive: '#e6aa58', emissiveIntensity: .48 });
    box(g, [.035, .53, .07], '#75603e', [px, h*.56, d/2+.11]);
    box(g, [.46, .035, .07], '#75603e', [px, h*.56, d/2+.11]);
  }
  roof(g, w+.45, d+.45, .8, [0, h+.08, 0]);
  textSign(g, sign, 1.17, .28, [0, h*.86, d/2+.06]);
  for (const px of [-w*.48, w*.48]) {
    cylinder(g, .14, .12, .32, '#ba7854', [px, 1.2, d/2+.25], 8);
    box(g, [.02,.2,.02], '#66533b', [px, 1.48, d/2+.25]);
  }
  return g;
}
function bench(parent, x, z, angle = 0) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = angle; parent.add(g);
  for (let i = 0; i < 3; i++) box(g, [1.7, .07, .12], '#b49c71', [0, .48, i*.15]);
  for (let i = 0; i < 2; i++) box(g, [1.7, .12, .06], '#b49c71', [0, .77+i*.17, -.07]);
  for (const px of [-.65,.65]) { box(g, [.06,.48,.06], '#4c5945', [px,.22,.2]); box(g, [.06,.98,.06], '#4c5945', [px,.49,-.07]); }
}
function lamp(parent, x, z, y = 0) {
  cylinder(parent, .03, .055, 2, '#53604a', [x,y+1,z],6);
  box(parent,[.29,.35,.29],'#efd1a0',[x,y+2.03,z],{emissive:'#edb86d',emissiveIntensity:.7});
  mesh(parent,new THREE.ConeGeometry(.24,.16,4),'#4a5945',[x,y+2.28,z]);
  cylinder(parent,.15,.2,.08,'#4a5945',[x,y+.01,z],6);
}

export { THREE, palette, material, mesh, box, ball, cylinder, line, roundedGeometry, base, tree, grassTuft, flower, textSign, roof, house, bench, lamp };

export const clamp = (n, min = 0, max = 1) => Math.max(min, Math.min(max, n));
export const smooth = n => { const t = clamp(n); return t * t * (3 - 2 * t); };
export const mix = THREE.MathUtils.lerp;
export function group(parent, position = [0, 0, 0], rotation = 0) {
  const g = new THREE.Group(); g.position.set(...position); g.rotation.y = rotation; parent.add(g); return g;
}
export function tube(parent, points, radius, color, options = {}) {
  const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)));
  return mesh(parent, new THREE.TubeGeometry(curve, Math.max(12, points.length * 5), radius, 5, false), color, [0,0,0], options);
}
export function plane(parent, width, depth, color, position, options = {}) {
  const m = mesh(parent, new THREE.PlaneGeometry(width, depth), color, position, options); m.rotation.x = -Math.PI / 2; return m;
}
export function chair(parent, position = [0,0,0], angle = 0, color = '#8e7658') {
  const g = group(parent, position, angle);
  box(g, [.72,.1,.73], color, [0,.55,0]);
  for (const x of [-.28,.28]) for (const z of [-.27,.27]) box(g,[.055,.55,.055],'#695b47',[x,.27,z]);
  box(g,[.72,.62,.07],color,[0,.89,-.33]); return g;
}
export function table(parent, position = [0,0,0], width = 2.8, depth = 1.8, color = '#aa8a60') {
  const g=group(parent,position); box(g,[width,.14,depth],color,[0,.88,0]);
  for(const x of [-width*.4,width*.4])for(const z of [-depth*.36,depth*.36])box(g,[.1,.87,.1],'#665343',[x,.43,z]);return g;
}
export function cup(parent, position, color = '#ece0c9', liquid = '#644c36', scale = 1) {
  const g=group(parent,position);g.scale.setScalar(scale);
  cylinder(g,.13,.105,.23,color,[0,.12,0],12);cylinder(g,.111,.111,.012,liquid,[0,.24,0],12);
  const handle=mesh(g,new THREE.TorusGeometry(.075,.022,5,12),color,[.135,.13,0]);handle.rotation.y=Math.PI/2;
  cylinder(g,.21,.21,.022,color,[0,.015,0],16);return g;
}
const photoTextures = new Map();
export function picture(parent, url, position, width, height) {
  const assetUrl=(import.meta.env?.BASE_URL||'/')+url.replace(/^\//,'');
  if(!photoTextures.has(url)){const texture=new THREE.TextureLoader().load(assetUrl,()=>window.dispatchEvent(new Event('memory-assets-ready')));texture.colorSpace=THREE.SRGBColorSpace;photoTextures.set(url,texture);}
  const g=group(parent,position);box(g,[width+.12,height+.12,.06],'#e9dfc6',[0,0,-.04]);
  const image=mesh(g,new THREE.PlaneGeometry(width,height),new THREE.MeshBasicMaterial({map:photoTextures.get(url),transparent:true,opacity:0,depthWrite:false}),[0,0,.005]);
  image.castShadow=false;image.receiveShadow=false;g.userData.photoImage=image;return g;
}
export function revealPicture(frame,amount){frame.userData.photoImage.material.opacity=Math.max(0,Math.min(1,amount));}
export function indoor(colors = {}) {
  const root=new THREE.Group();base(root,160,160,colors.floor||'#a88f72');
  root.userData.indoor=true;
  box(root,[160,16,.18],colors.wall||'#d4c9ac',[0,8,-4.4]).castShadow=false;
  box(root,[.18,16,160],colors.wall||'#d4c9ac',[-5.9,8,75.5]).castShadow=false;
  for(let x=-5.5;x<40;x+=.55)line(root,[[x,.025,-4.3],[x,.025,60]],'#655f48',.12);
  return root;
}
export function steam(parent, position, color = '#e9e3d2') {
  const g=group(parent,position);const puffs=[];
  for(let i=0;i<4;i++){
    const m=ball(g,.08+i*.018,color,[0,i*.19,0],0);m.material=new THREE.MeshBasicMaterial({color,transparent:true,opacity:.13,depthWrite:false});puffs.push(m);
  }
  return time=>puffs.forEach((m,i)=>{const t=(time*.25+i*.24)%1;m.position.set(Math.sin(time+i)*.09,t*.9,0);m.scale.setScalar(.4+t);m.material.opacity=Math.sin(t*Math.PI)*.2;});
}
export const themes = {
  day:{background:'#c2cfb8',bottom:'#5c7860',sun:'#fff1cf',intensity:3.1,ambient:1.9},
  dusk:{background:'#b1b5ad',bottom:'#586d66',sun:'#ffe0ba',intensity:2.4,ambient:1.6},
  night:{background:'#101f2c',bottom:'#19372e',sun:'#c6dbea',intensity:1.7,ambient:1.0},
  warm:{background:'#6a5143',bottom:'#273a31',sun:'#ffddaa',intensity:2.4,ambient:1.4},
  museum:{background:'#8c9c91',bottom:'#3e5a50',sun:'#ffe6ba',intensity:2.7,ambient:1.6},
};
export function sceneResult(root, update, options = {}) {
  return {root,update,theme:themes.day,view:{from:[13,11,18],to:[11,9,17],target:[0,1,0],endTarget:[0,1,0],span:11.8,endSpan:10.8},...options};
}
export function walkway(parent, points, width=.6, color=palette.path, y=.02){
  for(let i=0;i<points.length-1;i++){
    const a=new THREE.Vector3(points[i][0],y,points[i][1]),b=new THREE.Vector3(points[i+1][0],y,points[i+1][1]);
    const slab=box(parent,[width,.045,a.distanceTo(b)+.12],color,a.clone().add(b).multiplyScalar(.5).toArray());
    slab.rotation.y=Math.atan2(b.x-a.x,b.z-a.z);
  }
}

import test from 'node:test';
import assert from 'node:assert/strict';

import './fixtures/model-environment.js';
const beginning=await import('../src/scenes/beginning.js');
const indoors=await import('../src/scenes/indoors.js');
const outdoors=await import('../src/scenes/outdoors.js');
const performances=await import('../src/scenes/performances.js');
const vehicles=await import('../src/scenes/vehicles.js');
const factories={river:beginning.river,mountain:beginning.mountain,bar:indoors.bar,live:performances.live,museum:indoors.museum,skewers:indoors.skewersDinner,crabs:outdoors.crabs,stars:outdoors.stars,shop:indoors.shop,cycling:vehicles.cycling,camp:outdoors.camp,concert:performances.concert,driving:vehicles.driving,barbecue:indoors.barbecue,swans:outdoors.swans,forest:outdoors.forest,coffee:indoors.coffee,beach:outdoors.beach,ring:beginning.ringScene};
function transforms(root){const values=[];root.traverse(o=>values.push(...o.position.toArray(),...o.quaternion.toArray(),...o.scale.toArray()));return values;}
for(const [name,factory]of Object.entries(factories))test(`${name}: complete model and animation remain finite and deterministic`,()=>{
 const scene=factory();
 scene.root.traverse(o=>{const attribute=o.geometry?.getAttribute('position');if(attribute)for(const v of attribute.array)assert.ok(Number.isFinite(v),`${name}: invalid vertex`);});
 for(const progress of [0,.2,.5,.85,1]){
  const state={time:progress*24,progress,opening:name==='ring'?progress:0};scene.update(state);
  const expected=transforms(scene.root);assert.ok(expected.every(Number.isFinite),`${name}: invalid transform`);
  scene.update(state);const repeated=transforms(scene.root);
  repeated.forEach((n,i)=>assert.ok(Math.abs(n-expected[i])<1e-10,`${name}: pause drift`));
 }
});

import './fixtures/model-environment.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {OrthographicCamera,Vector3,Box3} from 'three';
import {river,mountain,ringScene} from '../src/scenes/beginning.js';
import {bar,museum,skewersDinner,shop,barbecue,coffee} from '../src/scenes/indoors.js';
import {crabs,stars,camp,swans,forest,beach} from '../src/scenes/outdoors.js';
import {cycling,driving} from '../src/scenes/vehicles.js';
import {live,concert} from '../src/scenes/performances.js';
import {extendEnvironment} from '../src/scenes/environment.js';
import {createInteractionEffects} from '../src/scenes/interaction-effects.js';
const factories={river,mountain,bar,live,museum,skewers:skewersDinner,crabs,stars,shop,cycling,camp,concert,driving,barbecue,swans,forest,coffee,beach,ring:ringScene};
for(const [id,factory]of Object.entries(factories))test(`${id}: extended ground covers the view and interaction effects remain deterministic`,()=>{
 const scene=factory();extendEnvironment(scene,id);const effects=createInteractionEffects(scene,id),camera=new OrthographicCamera(-10,10,7,-7,.1,180);camera.position.set(12,9,17);camera.lookAt(0,1,0);
 const ground=scene.root.children.find(c=>c.userData.seamlessGround);assert.ok(ground,`${id}: missing seamless ground`);assert.ok(ground.geometry.parameters.width>=256);assert.ok(ground.geometry.parameters.height>=256);
 const snapshot=()=>{const values=[];scene.root.traverse(o=>values.push(...o.position.toArray(),...o.quaternion.toArray(),...o.scale.toArray()));return values;};
 for(const action of [0,.2,.5,.8,1]){
  const state={id,time:12,progress:.8,action,phase:action<1?'acting':'settled'};scene.update(state);effects.update(state,camera);const first=snapshot();assert.ok(first.every(Number.isFinite));scene.update(state);effects.update(state,camera);assert.deepEqual(snapshot(),first);
 }
});
test('the flipped camping card clears the tabletop throughout the interaction',()=>{
 const scene=camp();
 for(let frame=0;frame<=100;frame++){
  scene.update({time:0,progress:.8,action:frame/100});scene.root.updateMatrixWorld(true);
  // The fifth community card is the only group with this center and a face symbol.
  const card=scene.root.children.find(c=>c.isGroup&&Math.abs(c.position.x-.7)<.001&&Math.abs(c.position.z-.45)<.001);
  assert.ok(card);assert.ok(new Box3().setFromObject(card).min.y>=.949,`frame ${frame}: card intersects table`);
 }
});

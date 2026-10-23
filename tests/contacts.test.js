import './fixtures/model-environment.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {Vector3,Box3,Raycaster} from 'three';
import {mountain,ringScene} from '../src/scenes/beginning.js';
import {cycling,driving} from '../src/scenes/vehicles.js';
import {bar,coffee,skewersDinner,barbecue} from '../src/scenes/indoors.js';
import {camp} from '../src/scenes/outdoors.js';
import {concert} from '../src/scenes/performances.js';

const world=(node,p=[0,0,0])=>{node.updateWorldMatrix(true,false);return node.localToWorld(new Vector3(...p));};

test('mountain shoes clear the actual stair meshes and retain a planted foot',()=>{
 const scene=mountain();const ray=new Raycaster();
 for(let frame=0;frame<=120;frame++){
  scene.update({time:frame/5,progress:frame/120});scene.root.updateMatrixWorld(true);
  let closest=Infinity;
  for(const c of scene.contacts.actors)for(const leg of c.legs)for(const x of [-.075,0,.075])for(const z of [-.12,0,.12]){
   const sole=world(leg.shoe,[x,-.05,z]);ray.set(sole.clone().add(new Vector3(0,1,0)),new Vector3(0,-1,0));
   const hit=ray.intersectObjects(scene.contacts.steps,false)[0];
   if(hit){const gap=sole.y-hit.point.y;assert.ok(gap>-.004,`frame ${frame}: foot penetrates stair by ${-gap}`);closest=Math.min(closest,gap);}
  }
  assert.ok(closest<.025,`frame ${frame}: both feet float ${closest}`);
 }
});

test('bicycle hands hold the bars and shoes follow physical pedals through a full cycle',()=>{
 const scene=cycling();
 for(let frame=0;frame<=40;frame++){
  scene.update({time:frame/3,progress:frame/40});scene.root.updateMatrixWorld(true);
  for(const [i,c]of scene.contacts.riders.entries())for(let side=0;side<2;side++){
   const bike=scene.contacts.bikes[i];
   const grip=world(bike.root,[.51,1.10,side?-.23:.23]);
   assert.ok(world(c.arms[side].hand).distanceTo(grip)<.012,`rider ${i}: hand misses bar`);
   const sole=world(c.legs[side].shoe,[0,-.05,0]),pedal=world(bike.pedals[side],[0,.02,0]);
   assert.ok(sole.distanceTo(pedal)<.015,`rider ${i}: foot misses pedal ${sole.distanceTo(pedal)}`);
  }
 }
});

test('driver hands follow the steering wheel and feet stay above the cabin floor',()=>{
 const scene=driving();
 for(let frame=0;frame<=30;frame++){
  scene.update({time:frame/2,progress:frame/30});scene.root.updateMatrixWorld(true);
  for(let i=0;i<2;i++)assert.ok(world(scene.contacts.driver.arms[i].hand).distanceTo(world(scene.contacts.steering,[i?.215:-.215,0,0]))<.01);
  const floor=new Box3().setFromObject(scene.contacts.floor).max.y;
  for(const c of scene.contacts.actors)for(const leg of c.legs)assert.ok(new Box3().setFromObject(leg.shoe).min.y>floor);
 }
});

for(const [name,factory]of Object.entries({bar,coffee,skewersDinner,barbecue,camp,concert}))test(`${name}: seated clothing rests on the seat rather than inside it`,()=>{
 const scene=factory();scene.update({time:7,progress:.6});scene.root.updateMatrixWorld(true);
 for(const c of scene.contacts.actors){const lower=new Box3().setFromObject(c.torso).min.y;assert.ok(lower>=c.support.height-.012,`${name}: clothing inside seat`);assert.ok(lower<c.support.height+.03,`${name}: floating above seat`);}
});

test('the ring stays supported by the cushion and the diamond clears the gold band',()=>{
 const scene=ringScene();
 for(let frame=0;frame<=30;frame++){
  scene.update({time:frame/3,progress:1,opening:frame/30});scene.root.updateMatrixWorld(true);
  const {ring,cushion,diamond}=scene.contacts;
  const top=new Box3().setFromObject(cushion).max.y,band=new Box3().setFromObject(ring.children[0]);
  assert.ok(band.min.y>=top-.004&&band.min.y<top+.012);
  assert.ok(new Box3().setFromObject(diamond).min.y>=band.max.y-.001);
 }
});

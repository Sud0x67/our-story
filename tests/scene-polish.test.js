import './fixtures/model-environment.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {Box3,Vector3} from 'three';
import {cycling} from '../src/scenes/vehicles.js';
import {shop,museum} from '../src/scenes/indoors.js';
import {mountainMotion} from '../src/scenes/choreography.js';
import {FilmTimeline} from '../src/timeline.js';
import {SCENES} from '../src/story-data.js';

test('bicycles and their riders keep a visible gap along the entire curved ride',()=>{
 const scene=cycling();
 for(let frame=0;frame<=160;frame++){
  scene.update({time:frame/10,progress:frame/160});scene.root.updateMatrixWorld(true);
  const [back,front]=scene.contacts.bikes.map(b=>new Box3().setFromObject(b.root));
  assert.equal(back.intersectsBox(front),false,'bicycles overlap at frame '+frame);
  assert.ok(front.min.x-back.max.x>.2,'not enough space between bicycles');
 }
});
test('mountain interaction follows the original story clock at walking speed, without double easing',()=>{
 const t=new FilmTimeline(SCENES,{index:1,elapsed:8});t.interact();let previous=mountainMotion(t.progress).position,peak=0;
 for(let frame=1;frame<=320;frame++){
  t.tick(.05);assert.ok(Math.abs(t.elapsed-(8+frame*.05))<1e-8);
  const next=mountainMotion(t.progress).position;peak=Math.max(peak,new Vector3(...next).distanceTo(new Vector3(...previous))/.05);previous=next;
 }
 assert.equal(t.phase,'settled');assert.ok(peak<.7,'ascent is too fast: '+peak);
});
test('the Yiwu plush rests on a display table and never bobs in the air',()=>{
 const scene=shop();let expected;
 for(const progress of [0,.2,.5,.8,1]){
  scene.update({time:progress*20,progress});scene.root.updateMatrixWorld(true);
  const {toy,toyTable}=scene.memories,position=toy.getWorldPosition(new Vector3());
  if(expected)assert.ok(position.distanceTo(expected)<1e-10);else expected=position.clone();
  const gap=new Box3().setFromObject(toy).min.y-new Box3().setFromObject(toyTable).max.y;
  assert.ok(gap>=0&&gap<.012,'toy is not supported by its table: '+gap);
 }
});
for(const [name,factory]of Object.entries({museum,shop}))test(name+': a fixed frame reveals the photo smoothly without changing size or position',()=>{
 const scene=factory(),frame=scene.memories.photo;let expected,previousOpacity=0;
 for(let i=0;i<=200;i++){
  scene.update({time:i/10,progress:i/200});scene.root.updateMatrixWorld(true);
  const transform=[...frame.position.toArray(),...frame.quaternion.toArray(),...frame.scale.toArray()];
  if(expected)assert.deepEqual(transform,expected);else expected=transform;
  assert.deepEqual(frame.scale.toArray(),[1,1,1]);
  const opacity=frame.userData.photoImage.material.opacity;
  assert.ok(opacity>=previousOpacity);assert.ok(opacity-previousOpacity<.03);previousOpacity=opacity;
 }
 assert.equal(previousOpacity,1);
 if(name==='shop')assert.ok(Math.abs(new Box3().setFromObject(frame).min.y-new Box3().setFromObject(scene.memories.photoTable).max.y)<.003);
 else{const bounds=new Box3().setFromObject(frame);assert.ok(bounds.min.z<=-4.30);assert.ok(bounds.max.z>-4.31);}
});

test('both framed photos stay fully inside portrait and landscape views',async()=>{
 const {OrthographicCamera}=await import('three');const {projectionSize}=await import('../src/framing.js');
 for(const factory of [museum,shop])for(const [width,height]of [[390,844],[1280,720]]){
  const scene=factory();scene.update({time:14,progress:1});scene.root.updateMatrixWorld(true);
  const view=scene.view,size=projectionSize(view.endSpan*1.08,width,height),camera=new OrthographicCamera(-size.width/2,size.width/2,size.height/2,-size.height/2,.1,180);
  camera.position.set(...view.to);camera.lookAt(...view.endTarget);camera.updateMatrixWorld(true);camera.updateProjectionMatrix();
  const bounds=new Box3().setFromObject(scene.memories.photo);
  for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z]){
   const point=new Vector3(x,y,z).project(camera);assert.ok(Math.abs(point.x)<.96&&Math.abs(point.y)<.96,'photo cropped at '+width+'×'+height);
  }
 }
});

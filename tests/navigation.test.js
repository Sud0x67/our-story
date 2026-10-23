import test from 'node:test';
import assert from 'node:assert/strict';
import {FilmTimeline} from '../src/timeline.js';
import {SCENES} from '../src/story-data.js';

for(let index=0;index<18;index++)test(`${SCENES[index].id}: next navigation leaves immediately even during the scene action`,()=>{
 const t=new FilmTimeline(SCENES,{index});t.interact();t.tick(.4);
 const progress=t.action;assert.ok(progress>0&&progress<1);
 assert.equal(t.navigate(1),true);assert.equal(t.phase,'leaving');assert.equal(t.autoContinue,false);
 assert.equal(t.navigate(1),false);t.tick(1);assert.equal(t.index,index+1);
});
test('returning to a completed memory restores its completed pose and caption',()=>{
 const t=new FilmTimeline(SCENES);t.interact();t.tick(20);const caption=t.caption().text;
 assert.equal(t.phase,'settled');t.navigate(1);t.tick(1);t.tick(3);t.navigate(-1);t.tick(1);
 assert.equal(t.index,0);assert.equal(t.phase,'settled');assert.equal(t.progress,1);assert.equal(t.action,1);assert.equal(t.caption().text,caption);
 t.tick(100);assert.equal(t.index,0);
});
test('leaving during an action cancels pending advancement and returns to the same story position',()=>{
 const t=new FilmTimeline(SCENES);t.interact({through:true});t.tick(2);const elapsed=t.elapsed;
 t.navigate(1);t.tick(1);t.navigate(-1);t.tick(1);
 assert.equal(t.elapsed,elapsed);assert.equal(t.phase,'waiting');assert.equal(t.autoContinue,false);t.tick(100);assert.equal(t.elapsed,elapsed);
 t.interact();t.tick(20);assert.equal(t.phase,'settled');assert.equal(t.index,0);
});
test('first and last scene controls respect bounds and changing scenes never opens the box',()=>{
 const t=new FilmTimeline(SCENES);assert.equal(t.navigate(-1),false);
 t.goto(18,19);assert.equal(t.navigate(1),false);assert.equal(t.opened,false);
 t.navigate(-1);t.tick(1);t.navigate(1);t.tick(1);assert.equal(t.scene.id,'ring');assert.equal(t.opened,false);assert.equal(t.waiting,true);
});
test('restarting clears navigation history and the proposal state',()=>{
 const t=new FilmTimeline(SCENES,{index:18,elapsed:19});t.open();t.tick(5);t.navigate(-1);t.tick(1);assert.ok(t.snapshots.size);
 t.restart();assert.equal(t.index,0);assert.equal(t.snapshots.size,0);assert.equal(t.opened,false);assert.equal(t.phase,'arriving');
});
test('navigation resumes a paused preview and repeated input cannot queue a second jump',()=>{
 const t=new FilmTimeline(SCENES,{index:3,elapsed:6,paused:true});assert.equal(t.navigate(-1),true);assert.equal(t.paused,false);
 for(let i=0;i<5;i++)assert.equal(t.navigate(1),false);t.tick(1);assert.equal(t.index,2);assert.equal(t.phase,'arriving');
});

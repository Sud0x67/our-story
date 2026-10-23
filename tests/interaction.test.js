import test from 'node:test';
import assert from 'node:assert/strict';
import {FilmTimeline} from '../src/timeline.js';
import {SCENES} from '../src/story-data.js';
import {INTERACTIONS} from '../src/interaction-config.js';
import {pointerIntent,WheelIntent} from '../src/gestures.js';

for(let index=0;index<18;index++)test(`${SCENES[index].id}: one tap completes the action, holds the memory, and advances exactly one chapter`,()=>{
 const t=new FilmTimeline(SCENES,{index});t.tick(10000);
 assert.equal(t.index,index);assert.equal(t.elapsed,INTERACTIONS[t.scene.id].introAt);assert.equal(t.phase,'waiting');
 t.tick(10000);assert.equal(t.index,index);assert.equal(t.action,0);
 assert.equal(t.interact(),true);t.tick(t.cue.duration);
 assert.equal(t.index,index);assert.equal(t.phase,'settled');assert.equal(t.progress,1);assert.equal(t.action,1);
 assert.equal(t.interact(),false);t.tick(2.9);assert.equal(t.index,index);assert.equal(t.phase,'settled');
 t.tick(.2);assert.equal(t.phase,'leaving');t.tick(.4);assert.ok(t.transition>0&&t.transition<1);
 t.tick(.6);assert.equal(t.index,index+1);assert.equal(t.opened,false);
 t.tick(10000);assert.equal(t.index,index+1);assert.equal(t.waiting,true);
});
test('an early tap preserves the full intro and needs no second confirmation',()=>{
 const t=new FilmTimeline(SCENES);t.tick(3);assert.equal(t.interact(),true);
 assert.equal(t.phase,'arriving');assert.equal(t.pendingAction,true);assert.equal(t.action,0);
 t.tick(6);assert.equal(t.elapsed,9);assert.equal(t.action,0);assert.equal(t.interact(),false);
 t.tick(1);assert.equal(t.phase,'acting');assert.equal(t.elapsed,10);assert.equal(t.pendingAction,false);
 t.tick(9.5);assert.equal(t.phase,'settled');t.tick(3);assert.equal(t.phase,'leaving');
 t.tick(1);assert.equal(t.scene.id,'mountain');t.tick(10000);assert.equal(t.phase,'waiting');
});
test('extra taps during an action or its final hold do not restart or skip it',()=>{
 const t=new FilmTimeline(SCENES,{elapsed:10});t.interact();t.tick(2);const progress=t.action;
 for(let i=0;i<5;i++)assert.equal(t.interact(),false);assert.equal(t.action,progress);
 t.tick(20);assert.equal(t.phase,'settled');for(let i=0;i<5;i++)assert.equal(t.interact(),false);
 t.tick(3);assert.equal(t.phase,'leaving');assert.equal(t.interact(),false);
 t.tick(1);assert.equal(t.scene.id,'mountain');assert.equal(t.action,0);
});
test('going back transitions once; replay and direct navigation clear all pending actions',()=>{
 const t=new FilmTimeline(SCENES);assert.equal(t.back(),false);t.goto(4);assert.equal(t.back(),true);assert.equal(t.back(),false);t.tick(1);assert.equal(t.index,3);
 t.interact();t.tick(1);t.goto(0);assert.equal(t.phase,'arriving');assert.equal(t.autoContinue,false);assert.equal(t.pendingAction,false);t.tick(1000);assert.equal(t.index,0);
});
test('pausing freezes the action, final hold and outgoing transition',()=>{
 const t=new FilmTimeline(SCENES,{elapsed:10});t.interact();t.tick(2);t.paused=true;const progress=t.action;t.tick(100);assert.equal(t.action,progress);
 t.paused=false;t.tick(20);t.tick(1);t.paused=true;t.tick(100);assert.equal(t.phase,'settled');assert.equal(t.settleElapsed,1);
 t.paused=false;t.tick(2);t.tick(.3);t.paused=true;const fade=t.transition;t.tick(30);assert.equal(t.transition,fade);
});
test('one tap per chapter reaches the final box without opening it',()=>{
 const t=new FilmTimeline(SCENES);assert.equal(t.open(),false);
 for(let i=0;i<18;i++){t.tick(100);t.interact();t.tick(100);t.tick(3);t.tick(1);assert.equal(t.index,i+1);}
 assert.equal(t.open(),false);t.tick(19);assert.equal(t.interact(),true);t.tick(5);assert.equal(t.opening,1);assert.equal(t.interact(),false);
});
test('navigating away or replaying cancels an early queued tap',()=>{
 const t=new FilmTimeline(SCENES);t.interact();assert.equal(t.pendingAction,true);
 t.navigate(1);t.tick(1);assert.equal(t.pendingAction,false);t.tick(100);assert.equal(t.phase,'waiting');
 t.navigate(-1);t.tick(1);t.tick(100);assert.equal(t.phase,'waiting');assert.equal(t.action,0);
 t.interact();assert.equal(t.pendingAction,true);t.restart();assert.equal(t.pendingAction,false);t.tick(100);assert.equal(t.phase,'waiting');
});
test('touch directions, small drags and multi-touch have distinct navigation behavior',()=>{
 const a={x:300,y:300};assert.equal(pointerIntent(a,{x:303,y:302}),'tap');
 assert.equal(pointerIntent(a,{x:230,y:304}),'next');assert.equal(pointerIntent(a,{x:370,y:304}),'previous');
 assert.equal(pointerIntent(a,{x:303,y:220}),'next');assert.equal(pointerIntent(a,{x:303,y:380}),'previous');
 assert.equal(pointerIntent(a,{x:270,y:302}),null);assert.equal(pointerIntent(a,{x:230,y:230}),null);
 assert.equal(pointerIntent(a,{x:303,y:302},{multiTouch:true}),null);
});
test('trackpad inertia is debounced and opposing wheel motion does not accidentally add up',()=>{
 const w=new WheelIntent();assert.equal(w.push(40,0),null);assert.equal(w.push(45,50),'next');assert.equal(w.push(200,300),null);
 assert.equal(w.push(-90,1200),'previous');assert.equal(w.push(100,1300),null);
 const v=new WheelIntent();v.push(60,0);assert.equal(v.push(-60,20),null);assert.equal(v.push(-25,60),'previous');
});

test('swiping and scrolling at the final box never opens it',()=>{
 const t=new FilmTimeline(SCENES,{index:18,elapsed:19});
 assert.equal(t.interact({through:true}),false);assert.equal(t.opening,0);assert.equal(t.opened,false);
 assert.equal(t.interact(),true);t.tick(5);assert.equal(t.opening,1);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { Group, Vector3 } from 'three';
import { person, groundSeat, joinedHands, stroll } from '../src/scenes/characters.js';
import { riverMotion, mountainMotion } from '../src/scenes/choreography.js';

const worldPoint=node=>node.getWorldPosition(new Vector3());

test('feet stay on the grass throughout sitting down, including at different character scales',()=>{
  for(const scale of [.79,.84,1]){
    const root=new Group(),c=person(root,'popo',[0,0,0],{scale});
    for(let i=0;i<=100;i++){
      c.pose({sit:i/100});groundSeat(c,i/100);root.updateMatrixWorld(true);
      for(const leg of c.legs){
        assert.ok(Math.abs(worldPoint(leg.shoe).y-.05*scale)<1e-6);
        assert.ok(leg.shoe.getWorldQuaternion(c.root.quaternion.clone()).angleTo(root.quaternion)<1e-6);
      }
    }
  }
});

test('inside hands remain in contact through the entire turn and ascent',()=>{
  const root=new Group();
  const pair={p:person(root,'popo',[0,0,0],{scale:.84,armLength:1.16}),h:person(root,'xiaohe',[0,0,0],{scale:.79,armLength:1.08})};
  for(let i=48;i<=100;i++){
    for(const [index,c] of [pair.p,pair.h].entries()){
      const m=mountainMotion(i/100,index);c.root.position.set(...m.position);c.root.rotation.y=m.yaw;
      c.pose({walk:m.walking*.55,phase:m.distance*12.8});stroll(c,m.distance,m.walking);
    }
    joinedHands(pair);root.updateMatrixWorld(true);
    assert.ok(worldPoint(pair.p.arms[1].hand).distanceTo(worldPoint(pair.h.arms[0].hand))<1e-6);
  }
});

test('scene motion stays continuous across every choreography transition',()=>{
  for(const motion of [riverMotion,mountainMotion])for(const index of [0,1]){
    let prev=motion(0,index);
    for(let i=1;i<=2000;i++){
      const next=motion(i/2000,index);
      assert.ok(new Vector3(...prev.position).distanceTo(new Vector3(...next.position))<.025);
      assert.ok(Math.abs(prev.yaw-next.yaw)<.025);
      prev=next;
    }
  }
});

test('the viewpoint pause keeps both people side by side before holding hands',()=>{
  for(let step=0;step<=35;step++){
    const p=mountainMotion(step/100,0),h=mountainMotion(step/100,1);
    const separation=new Vector3(...h.position).sub(new Vector3(...p.position));
    const forward=new Vector3(Math.sin(p.yaw),0,Math.cos(p.yaw));
    assert.ok(Math.abs(separation.dot(forward))<1e-9);
    assert.ok(separation.length()>.75);
    assert.equal(p.hands,0);assert.equal(h.hands,0);
  }
});

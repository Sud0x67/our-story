import { THREE, group, mesh, box, ball, cylinder, tube, material, clamp, mix } from './kit.js';

function glasses(head) {
  for(const x of [-.16,.16])tube(head,[[x-.125,.075,.455],[x+.125,.075,.455],[x+.125,-.09,.455],[x-.125,-.09,.455],[x-.125,.075,.455]],.012,'#5b584a');
  box(head,[.08,.022,.025],'#5b584a',[0,0,.46]);
}

export function person(parent, type = 'popo', position = [0,0,0], options = {}) {
  const girl=type==='xiaohe'||type==='friend-girl';
  const root=group(parent,position,options.rotation||0);root.scale.setScalar(options.scale||(girl?.94:1));
  const coat=options.coat||(girl?'#9bbdcc':'#cfbc99');
  const skin=options.skin||'#f0ccad',hair=options.hair||'#2b2b29';
  const body=group(root,[0,.86,0]);
  const torso=cylinder(body,.25,.32,options.long?.85:.62,coat,[0,options.long?-.1:0,0],8);
  if(options.long){for(const side of [-1,1])box(body,[.16,.29,.045],'#a88968',[side*.16,.13,.25]).rotation.z=side*.2;}
  else if(options.puffer){
    for(let i=0;i<4;i++){const ring=mesh(body,new THREE.TorusGeometry(.285,.018,4,8),coat,[0,-.23+i*.14,0]);ring.rotation.x=Math.PI/2;}
  }
  const seam=box(body,[.025,.5,.025],girl?coat:'#9e947e',[0,-.02,.29]);
  const head=group(body,[0,.65,0]);
  const back=ball(head,girl?.468:.45,hair,[0,.06,-.055],1);back.scale.set(1,girl?1.08:1.02,.94);
  const face=ball(head,girl?.4:.39,skin,[0,0,.075],2);face.scale.set(1,1,.98);
  if(girl){for(const side of [-1,1]){const bob=ball(head,.19,hair,[side*.32,-.12,-.035],1);bob.scale.set(.65,1.5,.95);}}
  for(let i=0;i<5;i++){
    const fringe=box(head,[.135,.18+Math.abs(i-2)*.015,.11],hair,[(i-2)*.122,.27,.3]);fringe.rotation.z=(i-2)*-.08;
  }
  const eyes=[];
  for(const side of [-1,1]){
    const eye=group(head,[side*.16,-.015,.432]);eyes.push(eye);
    if(girl){
      const white=ball(eye,.105,'#fff9ee',[0,0,0],2);white.scale.set(.9,1.14,.28);
      const iris=ball(eye,.074,'#55402e',[0,-.008,.025],2);iris.scale.set(.83,1.08,.25);
      const pupil=ball(eye,.051,'#292b29',[0,-.005,.039],1);pupil.scale.set(.86,1.08,.22);
      const highlight=ball(eye,.022,'#ffffff',[-.019,.029,.052],1);highlight.scale.z=.3;
      const small=ball(eye,.01,'#fff4d7',[.021,-.029,.053],1);small.scale.z=.3;
      tube(eye,[[side*.085,.04,.012],[side*.112,.055,.006]],.009,'#473a32');
      const blush=ball(head,.072,'#d99491',[side*.265,-.13,.369],1);blush.scale.set(1,.45,.2);
    }else{const e=ball(eye,.037,'#36382f',[0,0,.006],1);e.scale.set(1,1.18,.4);}
    ball(head,.056,skin,[side*.39,-.035,.045],1);
  }
  if(type==='popo'||options.glasses)glasses(head);
  ball(head,.032,skin,[0,-.1,.463],1);
  tube(head,[[-.06,-.175,.429],[0,-.195,.445],[.06,-.175,.429]],.01,'#b57668');
  const arms=[];
  const upperLength=.29*(options.armLength||1),lowerLength=.26*(options.armLength||1);
  for(const side of [-1,1]){
    const shoulder=group(body,[side*.29,.22,0]);
    cylinder(shoulder,.09,.075,upperLength,coat,[0,-upperLength/2,0],6);
    const elbow=group(shoulder,[0,-upperLength,0]);
    cylinder(elbow,.075,.06,lowerLength-.02,coat,[0,-lowerLength/2+.015,0],6);
    const hand=ball(elbow,.084,skin,[0,-lowerLength,0],1);shoulder.rotation.z=side*.1;
    arms.push({shoulder,elbow,hand,upperLength,lowerLength});
  }
  const legs=[];
  for(const side of [-1,1]){
    const hip=group(root,[side*.145,.59,0]);
    const upper=box(hip,[.19,.32,.2],options.pants||(girl?'#4f6c7e':'#4c554e'),[0,-.16,0]);
    const knee=group(hip,[0,-.31,0]);
    const lower=box(knee,[.175,.25,.19],options.pants||(girl?'#4f6c7e':'#4c554e'),[0,-.12,0]);
    const shoe=box(knee,[.205,.1,.31],options.shoes||'#e1d9c5',[0,-.25,.055]);legs.push({hip,knee,shoe,upper,lower});
  }
  if(options.hat){
    cylinder(head,.46,.47,.045,options.hat,[0,.36,0],12);
    cylinder(head,.31,.36,.26,options.hat,[0,.47,0],10);
  }
  const baseline=position[1];
  const result={root,body,head,arms,legs,eyes,girl,baseline,torso,
    pose({walk=0,phase=0,sit=0,recline=0,lean=0,reach=0}={}){
      body.position.set(0,.86-sit*.43,0);body.rotation.set(recline*-.75+lean*.3,0,0);
      torso.scale.y=options.long?1-sit*.22:1-sit*.18;seam.scale.y=1-sit*.18;torso.position.y=options.long?-.1+sit*.08:0;
      head.position.set(0,.65,0);head.rotation.x=0;head.rotation.y=0;
      for(let i=0;i<2;i++){
        const swing=Math.sin(phase+(i?Math.PI:0));
        legs[i].hip.position.set((i?1:-1)*.145,.59-sit*.31,0);
        legs[i].shoe.rotation.set(0,0,0);legs[i].shoe.position.set(0,-.25,.055);
        legs[i].knee.position.y=-.31;legs[i].upper.scale.y=1;legs[i].upper.position.y=-.16;legs[i].lower.scale.y=1;legs[i].lower.position.y=-.12;
        legs[i].hip.rotation.set(-sit*1.48+swing*.42*walk,0,(i?1:-1)*sit*.08);
        legs[i].knee.rotation.set(sit*1.3+Math.max(0,-swing)*.3*walk,0,0);
        arms[i].shoulder.rotation.set(-sit*.65-swing*.3*walk-reach*.8,0,(i?1:-1)*.1);
        arms[i].elbow.rotation.set(-sit*.65-reach*.5,0,0);
      }
      if(walk)body.position.y+=Math.abs(Math.sin(phase))*.025*walk;
    },
    idle(time){
      const blink=(time+(girl?1.2:0))%5.8;
      eyes.forEach(e=>e.scale.y=blink<.13?mix(1,.08,Math.sin(blink/.13*Math.PI)):1);
      head.rotation.z=Math.sin(time*.8)*(girl?.018:.012);
    },
  };
  return result;
}

export function couple(parent, positions = [[-.65,0,0],[.65,0,0]], options = {}) {
  const p=person(parent,'popo',positions[0],options.popo||{});
  const h=person(parent,'xiaohe',positions[1],options.xiaohe||{});
  return {p,h,idle(time){p.idle(time);h.idle(time+.6);}};
}
export function holdHands(pair, amount=1) {
  pair.p.arms[1].shoulder.rotation.z=.36*amount;
  pair.h.arms[0].shoulder.rotation.z=-.41*amount;
}

const down=new THREE.Vector3(0,-1,0);

// Solve in the joint parent's space so contacts also work on scaled/turned figures.
export function solveLimb(joint,hinge,target,pole,upper,lower,amount=1){
  const direction=target.clone().sub(joint.position);
  const distance=clamp(direction.length(),Math.abs(upper-lower)+.0001,upper+lower-.0001);
  if(direction.lengthSq()<1e-10)direction.copy(down);else direction.normalize();
  const bend=pole.clone().sub(joint.position);
  bend.addScaledVector(direction,-bend.dot(direction));
  if(bend.lengthSq()<.00001)bend.set(0,0,1).addScaledVector(direction,-direction.z);
  if(bend.lengthSq()<.00001)bend.set(1,0,0);
  bend.normalize();
  const along=(upper*upper-lower*lower+distance*distance)/(2*distance);
  const elbow=direction.clone().multiplyScalar(along).addScaledVector(bend,Math.sqrt(Math.max(0,upper*upper-along*along)));
  const q=new THREE.Quaternion().setFromUnitVectors(down,elbow.clone().normalize());
  const end=direction.multiplyScalar(distance).sub(elbow).normalize();
  const lowerQ=q.clone().invert().multiply(new THREE.Quaternion().setFromUnitVectors(down,end));
  joint.quaternion.slerp(q,amount);hinge.quaternion.slerp(lowerQ,amount);
}

export function reachHand(character,index,target,amount=1,pole){
  const arm=character.arms[index];character.root.updateWorldMatrix(true,true);
  const local=character.body.worldToLocal(target.clone());
  const elbow=pole?character.body.worldToLocal(pole.clone()):new THREE.Vector3(index?.72:-.72,-.15,.12);
  solveLimb(arm.shoulder,arm.elbow,local,elbow,arm.upperLength,arm.lowerLength,amount);
}

export function localHand(character,index,target,amount=1){
  character.root.updateWorldMatrix(true,false);
  reachHand(character,index,character.root.localToWorld(new THREE.Vector3(...target)),amount);
}

export function joinedHands(pair,amount=1){
  pair.p.root.updateWorldMatrix(true,true);pair.h.root.updateWorldMatrix(true,true);
  const p=pair.p.arms[1].shoulder.getWorldPosition(new THREE.Vector3());
  const h=pair.h.arms[0].shoulder.getWorldPosition(new THREE.Vector3());
  const front=new THREE.Vector3(0,0,.10).applyQuaternion(pair.p.root.getWorldQuaternion(new THREE.Quaternion()));
  const target=p.add(h).multiplyScalar(.5).add(front);target.y-=.34*pair.p.root.getWorldScale(new THREE.Vector3()).y;
  reachHand(pair.p,1,target,amount);reachHand(pair.h,0,target,amount);
  return target;
}

// Feet stay planted while knees bend; only then do the feet slide into a relaxed seat.
export function groundSeat(character,amount,time=0){
  const a=clamp(amount),drop=ease((a-.10)/.82),fold=ease((a-.34)/.66);
  character.body.position.y=mix(.86,.44,drop);
  character.body.rotation.x=Math.sin(a*Math.PI)*.24+drop*.035;
  for(const [i,leg] of character.legs.entries()){
    const side=i?1:-1;
    leg.hip.position.set(side*.145,mix(.59,.17,drop),-.045*drop);
    const ankle=new THREE.Vector3(mix(side*.145,side*.08,fold),.05,mix(0,.39,fold));
    solveLimb(leg.hip,leg.knee,ankle,new THREE.Vector3(side*(.22+fold*.45),.22,.65),.31,.25);
    const rotation=leg.hip.quaternion.clone().multiply(leg.knee.quaternion);
    leg.shoe.quaternion.copy(rotation.invert());leg.shoe.position.z=0;
  }
  const brace=Math.sin(a*Math.PI)*.8;
  for(let i=0;i<2;i++){
    const side=i?1:-1;
    localHand(character,i,[side*.37,mix(.57,.15,drop),mix(.02,.08,drop)],brace);
    localHand(character,i,[side*.17,.28,.32],ease((a-.76)/.24));
  }
  character.body.rotation.z=Math.sin(time*.75)*.008*drop;
}

export function stroll(character,distance,weight=1,surface){
  const cycle=distance/.49,weightShift=Math.sin(cycle*Math.PI*2)*.012*weight;
  character.body.position.y-=.018*weight;
  character.body.rotation.z=weightShift;
  const feet=[];
  for(let i=0;i<2;i++){
    const t=((cycle+i*.5)%1+1)%1,swing=clamp((t-.62)/.38);
    const z=t<.62?mix(.18,-.18,t/.62):mix(-.18,.18,ease(swing));
    feet.push({target:new THREE.Vector3((i?1:-1)*.145,.05,z*weight),lift:Math.sin(swing*Math.PI)*.095*weight});
  }
  if(surface){
    const supports=feet.map(f=>{
      let height=-Infinity;
      for(const dx of [-.075,0,.075])for(const dz of [-.12,0,.12]){
        const p=f.target.clone().add(new THREE.Vector3(dx,0,dz)).multiply(character.root.scale).applyEuler(character.root.rotation).add(character.root.position);
        height=Math.max(height,surface(p.x,p.z));
      }return height;
    });
    character.root.position.y=Math.min(...supports)+.003;
    supports.forEach((height,i)=>feet[i].target.y=(height-character.root.position.y)/character.root.scale.y+.05);
  }
  for(const [i,leg]of character.legs.entries()){
    leg.hip.position.y=.59-.018*weight;
    feet[i].target.y+=feet[i].lift;
    solveLimb(leg.hip,leg.knee,feet[i].target,new THREE.Vector3((i?1:-1)*.15,.1,1),.31,.25);
    const q=leg.hip.quaternion.clone().multiply(leg.knee.quaternion).invert();
    leg.shoe.quaternion.copy(q);leg.shoe.position.z=0;
  }
}

function ease(value){const n=clamp(value);return n*n*(3-2*n);}

export function reachFoot(character,index,target,upper=.31,lower=.25){
 const leg=character.legs[index];
 leg.upper.scale.y=upper/.31;leg.upper.position.y=-upper/2;
 leg.knee.position.y=-upper;leg.lower.scale.y=lower/.25;leg.lower.position.y=-lower/2;
 leg.shoe.position.set(0,-lower,0);
 character.root.updateWorldMatrix(true,true);
 solveLimb(leg.hip,leg.knee,character.root.worldToLocal(target.clone()),new THREE.Vector3((index?1:-1)*.2,.12,1),upper,lower);
 leg.shoe.quaternion.copy(leg.hip.quaternion.clone().multiply(leg.knee.quaternion).invert());
}

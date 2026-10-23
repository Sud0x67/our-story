import { THREE, palette, material, mesh, box, ball, cylinder, line, roundedGeometry, base, tree, grassTuft, flower, textSign, roof, house, bench, lamp, walkway, group, tube, smooth, mix, clamp, themes, sceneResult } from './kit.js';
import { couple, localHand, joinedHands, groundSeat, stroll } from './characters.js';
import { riverMotion, mountainMotion } from './choreography.js';
import { riverDetails, mountainDetails } from './landscape.js';
import { trailSteps,trailHeight,surfaceAlongPaths } from './contacts.js';

export function river(){
  const root=new THREE.Group();base(root,16.5,10.7);
  // The narrow waterway and white-walled storefronts suggest Xiaohe Street.
  box(root,[2.5,.14,220],palette.water,[-2.45,-.015,0],{roughness:.32,metalness:.18});
  for(const x of [-3.83,-1.08]){
    box(root,[.22,.2,220],'#a59e84',[x,.08,0]);
    for(let z=-4.8;z<5;z+=.55)box(root,[.25,.035,.02],'#7f8976',[x,.193,z]);
  }
  const ripples=[];
  for(let i=0;i<18;i++){
    const z=-4.7+i*.54; const x=-3.45+(i%4)*.42;
    const ripple=line(root,[[x,.07,z],[x+.28,.07,z-.025],[x+.56,.07,z]],'#b3c5b1',.32);ripples.push(ripple);
  }
  walkway(root,[[-.55,-4.6],[-.55,4.6]],.8,'#c6baa0');
  walkway(root,[[-7.6,1],[-.4,1]],.75);
  walkway(root,[[0,1],[1.4,1.6],[3.1,2.6],[5.6,3.6]],.53);
  // Stepped stone bridge, with low stone rails.
  for(let i=0;i<9;i++){
    const x=-3.8+i*.35, h=.13+Math.sin(i/8*Math.PI)*.4;
    box(root,[.38,.15,.88],'#c3bca0',[x,h,1]);
    for(const z of [.52,1.48])box(root,[.38,.13,.1],'#b6ae92',[x,h+.25,z]);
    if(i%2===0)for(const z of [.52,1.48])box(root,[.09,.34,.1],'#aea88e',[x,h+.08,z]);
  }
  house(root,-5.35,-3.35,2.8,2.15,1.85,'河边茶馆');
  house(root,-5.45,-.55,2.5,1.8,1.55,'慢慢生活');
  house(root,1.45,-3.6,2.7,2.1,1.8,'小河人家');
  house(root,4.45,-3.55,2.4,2.05,2.1,'一间小店');
  // Small side street stalls and warm lanterns.
  for(let i=0;i<3;i++)box(root,[.32,.33,.32],['#c8a572','#9c9f68','#c8997a'][i],[.9+i*.38,.16,-2.1]);
  const boat=new THREE.Group();boat.position.set(-2.4,.05,-2.5);root.add(boat);
  const hull=mesh(boat,new THREE.CylinderGeometry(.33,.22,1.55,6),'#7c6750',[0,0,0]);hull.rotation.x=Math.PI/2;
  box(boat,[.46,.15,1.1],'#ac9163',[0,.2,0]);roof(boat,.65,.8,.3,[0,.6,0]);
  for(const z of [-.35,.35])for(const x of [-.22,.22])box(boat,[.04,.45,.04],'#7e7054',[x,.41,z]);
  tree(root,6.25,2.1,1.25);tree(root,6.75,-2.4,.93);tree(root,3.4,-.1,.9,'pink');tree(root,-6.3,3.7,1.13);tree(root,-.2,-4.5,.65);
  lamp(root,-.85,-1.9);lamp(root,.05,3.6);lamp(root,-4.1,3.65);
  // Grassy patch, stepping stones, daisies and a picnic cloth.
  for(let i=0;i<18;i++){
    const x=1.1+((i*37)%50)/10,z=1+((i*19)%36)/10;
    if(i%3===0)grassTuft(root,x,z);else flower(root,x,z,i%2?'#e2cf99':'#d4b0a0');
  }
  riverDetails(root);
  const ground=surfaceAlongPaths([{points:[[-.55,-4.6],[-.55,4.6]],width:.8},{points:[[0,1],[1.4,1.6],[3.1,2.6],[5.6,3.6]],width:.53},{points:[[-7.6,1],[-.4,1]],width:.75}]);
  const pair=couple(root,[[-.35,.015,1.1],[.47,.015,1.22]],{popo:{coat:'#947359',long:true,scale:.84},xiaohe:{coat:'#a78ab8',scale:.79}});
  return sceneResult(root,({time,progress})=>{
    for(const [i,c] of [pair.p,pair.h].entries()){
      const motion=riverMotion(progress,i);
      c.root.position.set(...motion.position);c.root.rotation.y=motion.yaw;
      c.pose({walk:motion.walking*.65,phase:motion.distance*12.8,sit:motion.sitting});
      stroll(c,motion.distance,motion.walking,motion.sitting?undefined:ground);
      if(motion.sitting>0)groundSeat(c,motion.sitting,time+i);
      // Quiet listening, a small nod and one occasional hand gesture, with different rhythms.
      const listening=motion.chatting;
      c.head.rotation.y=(i?-.34:.30)*listening+Math.sin(time*.47+i)*.04*listening;
      c.head.rotation.x=(.025+Math.sin(time*.91+i*2)*.024)*listening;
      const gesture=Math.pow(Math.max(0,Math.sin(time*.63+i*2.5)),4)*listening;
      localHand(c,i?0:1,[i?-.19:.23,.32+gesture*.14,.33+gesture*.09],gesture*.65);
      c.idle(time+i*.6);
    }
    boat.position.y=.05+Math.sin(time*1.3)*.025;boat.rotation.z=Math.sin(time)*.016;
    ripples.forEach((r,i)=>r.position.x=Math.sin(time*.7+i)*.07);
  },{view:{from:[14,12,20],to:[11,7.8,17],target:[0,1,0],endTarget:[1.7,.7,2.25],span:13.8,endSpan:9.4}});
}

function rock(parent,x,y,z,s,color='#83917a'){
  const r=ball(parent,1,color,[x,y,z]);r.scale.set(s,s*.8,s*.85);r.rotation.set(.4,x,.2);return r;
}
function pagoda(parent,x,y,z){
  const g=new THREE.Group();g.position.set(x,y,z);parent.add(g);
  cylinder(g,.65,.86,.2,'#bcab88',[0,.08,0],8);
  for(let i=0;i<4;i++){
    cylinder(g,.36-i*.045,.4-i*.045,.65,'#c19a76',[0,.5+i*.69,0],6);
    const cap=mesh(g,new THREE.ConeGeometry(.7-i*.075,.3,6),'#7b6354',[0,.88+i*.69,0]);cap.rotation.y=Math.PI/6;
  }
  mesh(g,new THREE.ConeGeometry(.14,.55,6),'#b19c76',[0,3.4,0]);
}
export function mountain(){
  const root=new THREE.Group();base(root,16.5,10.7,'#5d7c61');
  // A distant lake and a little city at the foot of the hill.
  box(root,[220,.1,180],'#5d8582',[111.2,-.02,-87.25],{roughness:.48,metalness:.08});
  box(root,[7.8,.08,3.6],'#8fa487',[4.7,.035,-4.2]);
  for(let i=0;i<26;i++){
    const x=1.5+(i%8)*.74,z=-4.7+Math.floor(i/8)*.57,h=.25+((i*13)%9)/14;
    box(root,[.42,h,.35],['#9ba88e','#c3bfa3','#7c968b'][i%3],[x,h/2,z]);
    if(i%2===0)box(root,[.07,.09,.02],'#e4c27c',[x,h*.7,z+.18],{emissive:'#e3b265',emissiveIntensity:.9});
  }
  const land=mesh(root,new THREE.CylinderGeometry(4.2,5.1,1.55,8),'#6e8264',[-2,.64,.2]);land.rotation.y=.23;
  const plateau=mesh(root,new THREE.CylinderGeometry(2.45,3.3,1,7),'#8b9a73',[-1.5,1.6,.85]);plateau.rotation.y=.4;
  for(let i=0;i<12;i++)rock(root,-5.4+(i%4)*1.9,.3+(i%3)*.25,-3.6+Math.floor(i/4)*2.3,.6+((i*7)%4)/7,['#6f826a','#8f9c7b','#667c64'][i%3]);
  // Winding stone steps to the viewpoint.
  for(let i=0;i<16;i++){
    const t=i/15,x=-5.9+t*5.1,z=3.6-Math.sin(t*Math.PI)*1.2;
    const step=box(root,[.54,.12,.56],'#bfba99',[x,.1+t*1.94,z]);step.rotation.y=-.22;
  }
  const lookout=cylinder(root,2.05,2.3,.15,'#b1af88',[-1.05,2.11,1.35],8);
  // A view toward the lake, with a clear opening onto the upper path.
  for(let i=0;i<7;i++){
    const t=-1.15+i*.36,x=-1.05+Math.cos(t)*1.98,z=1.35+Math.sin(t)*1.98;
    cylinder(root,.035,.045,.65,'#776f52',[x,2.48,z],5);
    if(i<6){const t2=t+.36,x2=-1.05+Math.cos(t2)*1.98,z2=1.35+Math.sin(t2)*1.98;
      tube(root,[[x,2.76,z],[x2,2.76,z2]],.024,'#9f9876');
      tube(root,[[x,2.46,z],[x2,2.46,z2]],.019,'#9f9876');}
  }

  for(const [x,z,s,y] of [[-6,1,1.1,.3],[-6,-3.8,.9,0],[-3.4,-3.2,.8,1.3],[.2,-2.4,.8,.8],[.5,3.8,.7,.5],[-3.5,3.9,.75,.3],[-5.1,2.6,.8,.7]])tree(root,x,z,s,'pine',y);
  lamp(root,-2.8,1.8,2.17);
  mountainDetails(root);
  const steps=trailSteps(root);
  const pair=couple(root,[mountainMotion(0,0).position,mountainMotion(0,1).position],{popo:{coat:'#e9e5d7',puffer:true,scale:.84,armLength:1.16},xiaohe:{coat:'#323936',puffer:true,scale:.79,armLength:1.08}});
  return sceneResult(root,({time,progress})=>{
    const motions=[mountainMotion(progress,0),mountainMotion(progress,1)];
    for(const [i,c]of[pair.p,pair.h].entries()){
      const m=motions[i];c.root.position.set(...m.position);c.root.rotation.y=m.yaw;
      const moving=Math.max(m.walking,m.turning*.4);
      const distance=m.distance+(m.yaw-.3)*.08;
      c.pose({walk:moving*.55,phase:distance*12.8});stroll(c,distance,moving,trailHeight);
      c.idle(time+i*.6);
    }
    // They pause side by side, join hands, then turn and climb together.
    joinedHands(pair,motions[0].hands);
    pair.p.head.rotation.y+=Math.sin(time*.6)*.025;
    pair.h.head.rotation.y=Math.sin(time*.45+.8)*.025;
  },{theme:themes.dusk,contacts:{actors:[pair.p,pair.h],steps:[lookout,...steps],surface:trailHeight},view:{from:[13,9,18],to:[13,8,15],target:[-.4,2,0],endTarget:[-.8,2.3,-.15],span:13.1,endSpan:10.2}});
}

function diamondGeometry(){
  const vertices=[],indices=[];const n=8;
  for(const [r,y] of [[.22,.3],[.43,.07],[.42,0],[0,-.48]])for(let i=0;i<n;i++){const a=i/n*Math.PI*2;vertices.push(Math.cos(a)*r,y,Math.sin(a)*r);}
  for(let layer=0;layer<3;layer++)for(let i=0;i<n;i++){let a=layer*n+i,b=layer*n+(i+1)%n,c=(layer+1)*n+i,d=(layer+1)*n+(i+1)%n;indices.push(a,b,c,b,d,c);}
  for(let i=1;i<n-1;i++)indices.push(0,i+1,i);
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();return geo.toNonIndexed();
}
export function ringScene(){
  const root=new THREE.Group();base(root,160,160,'#39343a');
  /* no display plinth */
  // A burgundy velvet box, with its hinge along the rear edge.
  const boxGroup=new THREE.Group();boxGroup.position.y=.09;root.add(boxGroup);
  mesh(boxGroup,roundedGeometry(2.3,1.85,.72,.2),'#643948',[0,0,0]);
  mesh(boxGroup,roundedGeometry(2.15,1.7,.04,.16),'#d4b887',[0,.72,0]);
  const cushion=mesh(boxGroup,roundedGeometry(2.02,1.57,.07,.16),'#3d5848',[0,.76,0]);
  const hinge=new THREE.Group();hinge.position.set(0,.81,-.93);boxGroup.add(hinge);
  const lid=mesh(hinge,roundedGeometry(2.3,1.85,.32,.2),'#794655',[0,0,.93]);
  lid.material=lid.material.clone();lid.material.emissive.set('#895463');
  mesh(hinge,roundedGeometry(2.05,1.6,.04,.14),'#e3ceb0',[0,-.055,.93]);
  box(boxGroup,[.22,.13,.07],'#e1bf7d',[0,.59,.984],{metalness:.6,roughness:.25});
  const ring=new THREE.Group();ring.position.set(0,.92,.12);ring.scale.setScalar(.02);boxGroup.add(ring);
  mesh(ring,new THREE.TorusGeometry(.53,.047,10,64),material('#e9c97d',{metalness:.75,roughness:.19}),[0,.37,0]);
  mesh(ring,new THREE.TorusGeometry(.53,.019,8,48),material('#f5e6be',{metalness:.7,roughness:.15}),[0,.37,.044]);
  const diamond=mesh(ring,diamondGeometry(),material('#f4fbff',{metalness:.1,roughness:.08,flatShading:true,emissive:'#7a9c9b',emissiveIntensity:.13}),[0,1.44,0]);
  for(let i=0;i<4;i++){
    const a=i/4*Math.PI*2;
    tube(ring,[[Math.cos(a)*.18,.88,Math.sin(a)*.18],[Math.cos(a)*.25,1.10,Math.sin(a)*.25],[Math.cos(a)*.41,1.49,Math.sin(a)*.41],[Math.cos(a)*.36,1.56,Math.sin(a)*.36]],.019,'#ead5a1');
  }
  const sparkles=[];
  for(let i=0;i<22;i++){
    const a=i*2.399,r=2.5+(i%4)*.4;
    const spark=ball(root,.018+i%3*.008,'#ebd5a4',[Math.cos(a)*r,.3+(i%5)*.43,Math.sin(a)*r]);spark.material=material('#ebd5a4',{emissive:'#ebd5a4',emissiveIntensity:.8});sparkles.push(spark);
  }
  return sceneResult(root,({time,progress,opening=0})=>{
    lid.material.emissiveIntensity=opening>0?0:.035+(.5+.5*Math.sin(time*.8))*.05;
    const e=smooth(opening);hinge.rotation.x=-e*1.92;
    const reveal=smooth((e-.55)/.45);ring.scale.setScalar(.02+reveal*1.18);
    ring.position.y=.92+reveal*.24;
    ring.rotation.y=Math.sin(time*.4)*.18;
    sparkles.forEach((s,i)=>s.scale.setScalar(.5+Math.sin(time*1.2+i)*.3));
  },{contacts:{ring,diamond,cushion,lid},theme:{...themes.night,background:'#1c3029',bottom:'#102018',sun:'#ffe4b9',intensity:3,ambient:1.4},
    view:({progress,opening})=>({position:[mix(9,6,progress),mix(8,5.6,progress),mix(15,11,progress)],target:[0,mix(.6,1.35,smooth(opening)),0],span:mix(mix(10,6.3,progress),4.7,smooth(opening))})});
}

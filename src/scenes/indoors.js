import { THREE, palette, material, mesh, box, ball, cylinder, line, group, tube, indoor, table, chair, cup, picture, revealPicture, steam, textSign, smooth, mix, sceneResult, themes } from './kit.js';
import { seatOn } from './contacts.js';
import { couple, person } from './characters.js';

function diners(root, options={}) {
  chair(root,[-.72,0,-1.02]);chair(root,[.72,0,-1.02]);
  const pair=couple(root,[[-.72,.54,-1.02],[.72,.54,-1.02]],options);
  seatOn(pair.p,.6,[-.72,-1.02]);seatOn(pair.h,.6,[.72,-1.02]);
  pair.p.pose({sit:1});pair.h.pose({sit:1});return pair;
}
function bottle(parent,position,color='#667b50') {
  const g=group(parent,position);cylinder(g,.09,.11,.42,color,[0,.21,0],8);cylinder(g,.045,.07,.19,color,[0,.5,0],8);
  cylinder(g,.05,.05,.035,'#bc9e6a',[0,.6,0],8);box(g,[.13,.17,.02],'#d8c9a3',[0,.25,.105]);return g;
}
function pendant(root,x,y,z,color='#dcc49c') {
  tube(root,[[x,4.3,z],[x,y+.2,z]],.014,'#5c5746');
  mesh(root,new THREE.ConeGeometry(.38,.25,12,1,true),color,[x,y,z],{side:THREE.DoubleSide});
  ball(root,.1,'#ffe0a0',[x,y-.09,z],1).material=material('#ffe0a0',{emissive:'#f2bd73',emissiveIntensity:1.3});
}

export function bar(){
  const root=indoor({floor:'#79614f',wall:'#4c5c50'});
  for(let x=-5.6;x<6;x+=.43)box(root,[.025,2.0,.035],'#938061',[x,1.0,-4.28]);
  box(root,[4.3,.52,1.12],'#714d46',[0,.42,-1.2]);box(root,[4.3,.8,.2],'#895e50',[0,1.3,-1.67]);
  for(const x of [-2.15,2.15])box(root,[.3,.63,1.2],'#8c6351',[x,1,-1.2]);
  box(root,[3.6,.02,2.6],'#b29170',[0,.035,.6]);table(root,[0,0,.6],2.8,1.6,'#ad8e66');
  const pair=couple(root,[[-.74,.63,-1.03],[.74,.63,-1.03]]);
  seatOn(pair.p,.68,[-.74,-1.2]);seatOn(pair.h,.68,[.74,-1.2]);
  const shelf=group(root,[-3.65,1.35,-4.12]);
  for(let j=0;j<3;j++){
    box(shelf,[3.5,.1,.43],'#a58d69',[0,j*.65,0]);
    for(let i=0;i<7;i++)bottle(shelf,[-1.35+i*.43,j*.65+.05,0],['#788a5f','#b3a071','#855b45'][i%3]);
  }
  pendant(root,-1.9,3,-.3);pendant(root,2.5,2.8,-2.2);
  const whiskey=group(root,[-.6,.951,.35]);cylinder(whiskey,.14,.13,.27,'#b99356',[0,.14,0],10);cylinder(whiskey,.12,.12,.1,'#d6a65a',[0,.19,0],10);
  const ice=box(whiskey,[.1,.09,.1],'#e6e0c8',[.02,.26,0]);ice.rotation.y=.4;
  for(const x of [.3,.9]){
    const g=group(root,[x,.951,.4]);cylinder(g,.19,.04,.25,x>.5?'#b6797b':'#d7ae69',[0,.27,0],10);cylinder(g,.017,.017,.2,'#d4c7ad',[0,.11,0],6);cylinder(g,.13,.13,.025,'#c2b395',[0,.015,0],10);
    const citrus=cylinder(g,.09,.09,.025,'#c9bd70',[.14,.4,0],10);citrus.rotation.x=Math.PI/2;
  }
  box(root,[1.6,1.35,.05],'#c5aa7e',[3.5,2.4,-4.27]);box(root,[1.4,1.15,.07],'#536a59',[3.5,2.4,-4.23]);
  return sceneResult(root,({time})=>{pair.p.pose({sit:1});pair.h.pose({sit:1});pair.idle(time);pair.p.head.rotation.y=.16;pair.h.head.rotation.y=-.16;pair.p.arms[1].shoulder.rotation.x=-.7+Math.sin(time)*.07;pair.h.arms[0].shoulder.rotation.x=-.6+Math.sin(time*.9)*.06;},{contacts:{actors:[pair.p,pair.h]},theme:themes.warm,view:{from:[10,8,15],to:[7,5.5,12],target:[0,1,-.3],endTarget:[0,1.5,-.6],span:10.6,endSpan:6.8}});
}

function bronzeMask(parent,position,scale=1){
  const g=group(parent,position);g.scale.setScalar(scale);
  const bronze='#8f9e6c';const dark='#566c52';
  box(g,[1.18,.85,.3],bronze,[0,0,0]);
  for(const side of [-1,1]){
    const ear=box(g,[.52,.67,.17],bronze,[side*.78,0,-.035]);ear.rotation.z=side*.25;
    cylinder(g,.19,.19,.35,dark,[side*.31,.1,.2],8).rotation.x=Math.PI/2;
    const eye=cylinder(g,.125,.16,.4,bronze,[side*.31,.1,.34],8);eye.rotation.x=Math.PI/2;
    box(g,[.45,.08,.15],dark,[side*.31,.33,.23]).rotation.z=side*-.12;
  }
  const nose=mesh(g,new THREE.ConeGeometry(.19,.5,4),bronze,[0,-.04,.4]);nose.rotation.x=Math.PI/2;
  box(g,[.62,.055,.09],dark,[0,-.24,.2]);return g;
}
export function museum(){
  const root=indoor({floor:'#b4b9a6',wall:'#405d51'});
  for(const x of [-3.6,3.6]){
    box(root,[2.4,.55,1.8],'#646f5c',[x,.28,-2]);
    const glass=box(root,[2.3,2.2,1.7],'#c1d3c2',[x,1.62,-2],{transparent:true,opacity:.12,depthWrite:false,roughness:.15});glass.castShadow=false;
  }
  bronzeMask(root,[-3.6,1.6,-2],1.15);
  const tree=group(root,[3.6,.56,-2]);cylinder(tree,.07,.14,1.8,'#9d9a60',[0,.9,0],6);
  for(let i=0;i<6;i++){const a=i*Math.PI/3;const branch=tube(tree,[[0,.65+(i%3)*.3,0],[Math.cos(a)*.6,1.1+(i%3)*.25,Math.sin(a)*.5]],.04,'#a4a26a');ball(tree,.14,'#adae75',[Math.cos(a)*.62,1.12+(i%3)*.25,Math.sin(a)*.52]);}
  bronzeMask(root,[0,2.6,-4.05],1.65);textSign(root,'三星堆',1.7,.4,[0,3.8,-4.23],'#405d51','#d8d6aa');
  const pair=couple(root,[[-.63,0,1.05],[.63,0,1.05]],{popo:{coat:'#e1e2d7'},xiaohe:{coat:'#91b9cd'}});
  const masks=[bronzeMask(pair.p.arms[0].hand,[0,.08,.12],.38),bronzeMask(pair.h.arms[1].hand,[0,.08,.12],.38)];
  const photo=picture(root,'/assets/museum.webp',[4.05,3.30,-4.25],1.5,2);
  photo.userData.attachment='wall';
  return sceneResult(root,({time,progress})=>{
    pair.idle(time);const pose=smooth((progress-.3)/.25);
    for(const [i,c]of[pair.p,pair.h].entries()){c.pose({reach:pose});c.root.rotation.y=mix(i?-.7:.7,0,pose);c.head.rotation.y=mix(i?-.35:.35,0,pose);}
    masks.forEach(m=>m.visible=pose>.15);revealPicture(photo,smooth((progress-.60)/.30));
  },{memories:{photo},theme:themes.museum,view:{from:[11,8,16],to:[7,5.8,14],target:[0,1.5,-.4],endTarget:[1.5,1.8,-2.3],span:11.2,endSpan:10.4}});
}

function skewers(parent,position,scale=1){
  const g=group(parent,position);g.scale.setScalar(scale);
  for(let i=0;i<12;i++){
    const a=i*2.399,r=.18+(i%4)*.09;
    const sk=group(g,[Math.cos(a)*r,0,Math.sin(a)*r]);sk.rotation.z=Math.cos(a)*.22;sk.rotation.x=Math.sin(a)*.22;
    cylinder(sk,.012,.012,.95,'#ddbd85',[0,.46,0],4);
    for(let j=0;j<3;j++)ball(sk,.065,['#bf7050','#d1a462','#91a262'][i%3],[0,.21+j*.12,0],0);
  }return g;
}
export function skewersDinner(){
  const root=indoor({floor:'#a5805d',wall:'#a76850'});table(root,[0,0,.65],3.2,2.1);const pair=diners(root);
  textSign(root,'重庆 · 串串',3,.65,[0,2.95,-4.27],'#805043','#f1dbab');
  for(const x of [-3.6,3.6]){
    cylinder(root,.36,.36,.62,'#c88459',[x,2.5,-2.5],10);cylinder(root,.39,.39,.07,'#d4ac73',[x,2.16,-2.5],10);
    tube(root,[[x,4,-2.5],[x,2.83,-2.5]],.012,'#675641');
  }
  cylinder(root,.56,.46,.3,'#9c9d89',[0,1.10,.6],16);cylinder(root,.5,.5,.025,'#9b513c',[0,1.247,.6],16);skewers(root,[0,1.02,.6],.8);
  for(const x of [-1.1,1.1]){cylinder(root,.29,.29,.025,'#e0cdb1',[x,.964,.7],16);cup(root,[x,.951,.1],'#d7cbb1');}
  const vapor=steam(root,[0,1.7,.6]);
  return sceneResult(root,({time})=>{pair.idle(time);vapor(time);pair.p.head.rotation.y=.12;pair.h.head.rotation.y=-.12;},{contacts:{actors:[pair.p,pair.h]},theme:themes.warm,view:{from:[11,8,16],to:[8,6,14],target:[0,1,-.2],endTarget:[0,1.4,-.1],span:10.7,endSpan:7.2}});
}

function plush(parent,position,color,kitty=false){
  const g=group(parent,position);ball(g,.19,color,[0,.15,0],1).scale.set(.85,1,1);
  const head=ball(g,.22,kitty?'#f3eee0':color,[0,.42,0],1);head.scale.set(1.18,.91,.8);
  for(const side of [-1,1]){
    if(kitty){const ear=mesh(g,new THREE.ConeGeometry(.1,.2,3),'#f3eee0',[side*.16,.59,0]);ear.rotation.z=side*-.25;}
    else ball(g,.085,color,[side*.18,.6,0]);
    ball(g,.018,'#403c34',[side*.075,.43,.163]);ball(g,.065,color,[side*.18,.16,.02]);
  }
  if(kitty){ball(g,.022,'#d8be69',[0,.4,.18]);for(const x of [-.12,-.05])ball(g,.05,'#c97673',[x,.57,.13]);}
  else ball(g,.025,'#594a3c',[0,.38,.18]);return g;
}
export function shop(){
  const root=indoor({floor:'#c5bba4',wall:'#c8b5aa'});
  const colors=['#d4c9ac','#a5b7b4','#c7969d','#d0ae76','#a1af91','#bac3d5'];
  for(let row=0;row<4;row++){
    const y=.65+row*.8;box(root,[10.9,.1,.55],'#e5d9be',[0,y,-3.95]);
    for(let col=0;col<15;col++)plush(root,[-4.95+col*.7,y+.05,-3.85],colors[(row+col)%colors.length],col%4===0);
  }
  for(let row=0;row<3;row++){
    box(root,[.55,.1,6],'#e2d4b7',[-5.5,.7+row*.9,-.4]);
    for(let i=0;i<7;i++){const p=plush(root,[-5.4,.75+row*.9,-3+i*.8],colors[(row+i)%6],i%3===0);p.rotation.y=Math.PI/2;}
  }
  for(const [i,color] of ['#789db0','#dba593','#a7b49c'].entries())chair(root,[2.15+i*.9,0,.3],0,color);
  const pair=couple(root,[[-1.1,0,1],[.2,0,1]],{popo:{coat:'#d3c7ab'},xiaohe:{coat:'#bdb89b',hat:'#c8bea2'}});
  const toyTable=table(root,[2.3,0,1.6],1.2,.85,'#c7ac86');
  const toy=plush(root,[2.3,0,1.6],'#d6c1a7',true);toy.rotation.y=.12;
  toy.position.y+=.953-new THREE.Box3().setFromObject(toy).min.y;
  const photoTable=table(root,[2.2,0,-1.15],2.05,.85,'#c7ac86');
  const photo=picture(root,'/assets/yiwu.webp',[2.2,1.785,-1.15],1.55,1.55);
  photo.userData.attachment='table';
  return sceneResult(root,({time,progress})=>{
    const walk=smooth(progress/.3);pair.p.root.position.x=-1.1+walk*.5;pair.h.root.position.x=.2+walk*.5;
    for(const [i,c]of[pair.p,pair.h].entries()){c.pose({walk:Math.sin(walk*Math.PI)*.6,phase:time*5+i,reach:smooth((progress-.3)/.2)*.7});c.head.rotation.y=Math.sin(time*.5)*.15;}
    pair.idle(time);
    revealPicture(photo,smooth((progress-.57)/.32));
  },{memories:{photo,photoTable,toy,toyTable,actors:[pair.p,pair.h]},view:{from:[11,8,16],to:[8,5.7,13],target:[0,1.5,-.3],endTarget:[.6,1.55,.6],span:10.9,endSpan:8.4}});
}

export function barbecue(){
  const root=indoor({floor:'#87745d',wall:'#8a785d'});table(root,[0,0,.65],3.1,1.9);const pair=diners(root);
  textSign(root,'新疆和田玉烧烤',4.4,.7,[-.2,3.1,-4.27],'#566753','#e8d4a0');
  textSign(root,'阿里烧烤',1.5,.4,[4.7,2.8,-4.25],'#765842','#d9c199');
  for(const x of [-4.7,4.7])for(let i=0;i<3;i++)box(root,[.12,.95,.12],'#c3aa79',[x,1.4+i*.5,-4.2]).rotation.z=Math.PI/4;
  cylinder(root,.6,.6,.035,'#d0b18a',[0,.9685,.65],16);
  for(let i=0;i<9;i++){
    const stick=box(root,[1.1,.02,.025],'#c9a566',[0,1.0+i*.008,.28+i*.085]);stick.rotation.y=.12;
    for(let j=0;j<3;j++)ball(root,.075,['#a85c3f','#c28b4e','#a67c4d'][i%3],[-.2+j*.2,1.06+i*.009,.28+i*.085]);
  }
  bottle(root,[-1.1,.951,.6],'#7a8353');bottle(root,[1.05,.951,.6],'#7a8353');
  cup(root,[-.75,.951,.04],'#c7bc94','#c2944b',.9);cup(root,[.75,.951,.04],'#c7bc94','#c2944b',.9);
  pendant(root,-2.7,2.9,-1.3);pendant(root,2.4,2.7,.8);
  return sceneResult(root,({time})=>{pair.idle(time);pair.p.head.rotation.y=.17;pair.h.head.rotation.y=-.17;},{contacts:{actors:[pair.p,pair.h]},theme:themes.warm,view:{from:[10,8,16],to:[7,5.3,13],target:[0,1,-.3],endTarget:[0,1.5,-.3],span:10.4,endSpan:7}});
}

export function coffee(){
  const root=indoor({floor:'#c5c6b8',wall:'#deded1'});
  // An impression of an indoor coffee shop, with the confirmed three pour-overs.
  for(let i=0;i<4;i++){
    box(root,[1.55,2.75,.08],'#9ab7b4',[-3.9+i*1.8,2.4,-4.27],{roughness:.35});
    box(root,[.05,3.1,.12],'#c0bfaa',[-4.7+i*1.8,2.4,-4.2]);
  }
  textSign(root,'APARTMENT COFFEE',4.1,.48,[1.7,3.4,-4.1],'#deded1','#697969');
  box(root,[3.5,1.3,1.2],'#b69e7b',[-3.5,.65,-2.6]);box(root,[3.6,.1,1.3],'#d8d2bd',[-3.5,1.35,-2.6]);
  for(let i=0;i<3;i++){
    const x=-4.5+i*.9;const dripper=mesh(root,new THREE.ConeGeometry(.17,.3,12,1,true),'#e7e3d0',[x,1.7,-2.6],{side:THREE.DoubleSide});
    dripper.rotation.z=Math.PI;cup(root,[x,1.4,-2.6]);
  }
  table(root,[.2,0,.65],3.1,1.9,'#c8b28f');const pair=diners(root);
  const cups=[cup(root,[-.8,.951,.43]),cup(root,[.2,.951,.5]),cup(root,[1.15,.951,.45])];
  const vapors=cups.map(c=>steam(c,[0,.25,0]));
  const plant=group(root,[4.4,0,-2.7]);cylinder(plant,.42,.3,.7,'#a69e83',[0,.35,0],10);
  for(let i=0;i<6;i++){const a=i*Math.PI/3;const leaf=ball(plant,.38,'#83a082',[Math.cos(a)*.3,1.25+(i%2)*.3,Math.sin(a)*.3],1);leaf.scale.set(.55,1.4,.6);}
  return sceneResult(root,({time,progress})=>{
    pair.idle(time);cups.forEach((c,i)=>{const appear=smooth((progress-i*.23)/.18);c.scale.setScalar(Math.max(.001,appear));vapors[i](time);});
    pair.p.head.rotation.y=.14;pair.h.head.rotation.y=-.14;
  },{contacts:{actors:[pair.p,pair.h]},view:{from:[11,8,15],to:[7,5.1,13],target:[0,1.4,-.2],endTarget:[.1,1.3,.2],span:10.8,endSpan:7.4}});
}

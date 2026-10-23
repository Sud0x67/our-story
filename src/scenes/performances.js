import { THREE, material, mesh, box, ball, cylinder, group, tube, textSign, base, sceneResult, themes } from './kit.js';
import { seatOn } from './contacts.js';
import { couple, person } from './characters.js';
function mic(root,position,scale=1){
  const g=group(root,position);g.scale.setScalar(scale);cylinder(g,.02,.035,1.2,'#515851',[0,.6,0],6);
  cylinder(g,.18,.18,.04,'#3e4942',[0,.02,0],10);tube(g,[[0,1.16,0],[.16,1.35,.05]],.018,'#6c7166');
  const head=cylinder(g,.05,.04,.18,'#acb3a2',[.16,1.36,.1],8);head.rotation.x=Math.PI/2;
}
function guitar(parent,position){
  const g=group(parent,position);const body=ball(g,.31,'#b39666',[0,0,0],1);body.scale.set(.83,1.12,.27);
  const top=ball(g,.23,'#b39666',[0,.23,0],1);top.scale.set(.8,1,.3);
  box(g,[.1,.7,.07],'#9b7c51',[0,.66,0]);ball(g,.08,'#554b38',[0,.06,.09],1).scale.z=.25;
  for(let i=0;i<3;i++)tube(g,[[i*.019-.02,-.1,.092],[i*.019-.02,.95,.05]],.003,'#d3c399');g.rotation.z=-.4;return g;
}
function audience(root, rows, columns, zStart, step, y=0){
  const people=[];
  for(let r=0;r<rows;r++)for(let c=0;c<columns;c++){
    const x=(c-(columns-1)/2)*.72,z=zStart+r*step;
    const g=group(root,[x,y, z]);
    cylinder(g,.14,.2,.38,['#7a8876','#879297','#a3917e','#8b777f'][(r+c)%4],[0,.5,0],5);
    ball(g,.19,'#c7b69c',[0,.87,0],1);const hair=ball(g,.2,['#343c36','#4c463a','#615541'][(r+c)%3],[0,.94,.035],0);hair.scale.y=.7;
    people.push(g);
  }return people;
}
function lightCone(root,position,color,rotation=0){
  const g=group(root,position);g.rotation.z=rotation;
  const cone=mesh(g,new THREE.ConeGeometry(1.25,5.3,24,1,true),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.055,side:THREE.DoubleSide,depthWrite:false}),[0,-2.65,0]);
  cylinder(g,.12,.12,.25,'#777b68',[0,0,0],8);return g;
}
export function live(){
  const root=new THREE.Group();base(root,14,11,'#46534a');
  box(root,[11.5,.5,3.7],'#3b463e',[0,.2,-3.0]);box(root,[12,4.6,.2],'#263c37',[0,2.4,-5.1]);
  for(let x=-5.8;x<6;x+=.3)box(root,[.12,4.4,.08],'#30483f',[x,2.4,-4.95]);
  for(const x of [-5.1,5.1]){box(root,[.85,1.6,.7],'#2e3832',[x,.85,-2.0]);for(const y of [.45,1.2])cylinder(root,.27,.27,.02,'#495247',[x,y,-1.64],12).rotation.x=Math.PI/2;}
  const singer=person(root,'performer',[0,.5,-3.2],{coat:'#696b59',hair:'#3c3932',glasses:true,scale:.9});singer.pose({reach:.55});guitar(root,[.02,1.35,-2.9]);mic(root,[.2,.5,-2.65]);
  textSign(root,'周云蓬',2.8,.6,[0,3.7,-4.92],'#30483f','#e2d0a4');
  const crowd=audience(root,3,11,-.8,.75);
  const pair=couple(root,[[-.65,0,3.15],[.65,0,3.15]],{popo:{rotation:Math.PI},xiaohe:{rotation:Math.PI}});
  const spots=[lightCone(root,[-3.5,5,-2.5],'#e6c895',-.25),lightCone(root,[3.2,5,-2.7],'#acb7d2',.28)];
  return sceneResult(root,({time})=>{
    pair.idle(time);singer.idle(time);singer.arms[1].elbow.rotation.x=-.7+Math.sin(time*1.8)*.045;
    crowd.forEach((g,i)=>g.rotation.z=Math.sin(time*.7+i)*.018);spots.forEach((g,i)=>g.rotation.z=Math.sin(time*.13+i)*.07+(i?.25:-.25));
  },{theme:themes.night,view:{from:[11,9,17],to:[8,6.5,16],target:[0,1,-.5],endTarget:[0,1.5,-1],span:12.3,endSpan:9.6}});
}
export function concert(){
  const root=new THREE.Group();base(root,18,14,'#344c4c');
  box(root,[11,.65,4],'#3e4753',[0,.2,-4.5]);box(root,[11,4.6,.2],'#2e3b56',[0,2.9,-6.55]);
  // Abstract stage imagery rather than an invented reconstruction of the actual show.
  for(let i=0;i<7;i++){
    const arc=mesh(root,new THREE.TorusGeometry(1.2+i*.16,.018,5,64,Math.PI),material(i%2?'#a7b4c2':'#d0ad97',{emissive:i%2?'#849eae':'#c3a58b',emissiveIntensity:.65}),[0,1.7,-6.37]);
  }
  textSign(root,'一粒 · 陈粒',3.2,.65,[0,3.5,-6.3],'#2e3b56','#e5cfbb');
  const singer=person(root,'friend-girl',[0,.6,-4.6],{coat:'#c4b5c4',scale:.62,hair:'#393c3d'});mic(root,[.12,.6,-4.1],.7);
  for(const x of [-6.3,6.3]){
    box(root,[1.1,3.3,.4],'#1f313d',[x,2.1,-5]);box(root,[.9,2.8,.05],'#7491a3',[x,2.1,-4.76],{emissive:'#728da1',emissiveIntensity:.4});
  }
  const crowd=audience(root,3,15,-1.9,.8,.1);
  for(let i=0;i<3;i++)box(root,[16,.35,1.3],'#66767a',[0,.15+i*.38,1.7+i*1.25]);
  for(const x of [-.75,.75]){box(root,[.7,.12,.65],'#a2ac9c',[x,1.5,4]);box(root,[.7,.5,.08],'#a2ac9c',[x,1.75,4.3]);}
  const pair=couple(root,[[-.75,1.4,4.0],[.75,1.4,4]],{popo:{rotation:Math.PI},xiaohe:{rotation:Math.PI}});
  seatOn(pair.p,1.56,[-.75,4],Math.PI);seatOn(pair.h,1.56,[.75,4],Math.PI);
  const lights=[];
  for(let i=0;i<70;i++){
    const m=ball(root,.027,'#e2c9a2',[-7+(i%15),.9+Math.floor(i/15)*.12,-1.4+Math.floor(i/15)*.6]);m.material=material('#e2c9a2',{emissive:'#e9c99d',emissiveIntensity:1.2});lights.push(m);
  }
  const spots=[lightCone(root,[-4,6.2,-4],'#becfe1',-.45),lightCone(root,[4,6.2,-4],'#e7bea5',.45)];
  return sceneResult(root,({time})=>{pair.p.pose({sit:1});pair.h.pose({sit:1});pair.idle(time);singer.idle(time);crowd.forEach((g,i)=>g.rotation.z=Math.sin(time*.6+i)*.015);lights.forEach((g,i)=>g.scale.setScalar(.7+Math.sin(time*.9+i)*.2));spots.forEach((g,i)=>g.rotation.z=(i?1:-1)*(.35+Math.sin(time*.18)*.1));},{contacts:{actors:[pair.p,pair.h]},theme:{...themes.night,background:'#202938',bottom:'#142c32'},view:{from:[13,11,22],to:[10,8,19],target:[0,1.6,0],endTarget:[0,1.9,0],span:15,endSpan:11.8}});
}

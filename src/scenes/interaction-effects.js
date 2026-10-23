import {THREE,group,mesh,ball,line} from './kit.js';
import {sceneCue} from '../interaction-config.js';
const fade=p=>Math.sin(Math.max(0,Math.min(1,p))*Math.PI);
export function createInteractionEffects(setting,id){
 const cue=sceneCue(id),root=group(setting.root),origin=group(root,cue.anchor),ink='#f4d8a2';
 root.userData.interactionEffect=true;
 const mat=(color=ink,opacity=0)=>new THREE.MeshBasicMaterial({color,transparent:true,opacity,depthWrite:false,toneMapped:false});
 const badge=group(origin),outline='#a86a4b';
 const disc=mesh(badge,new THREE.CircleGeometry(.245,40),mat('#fff1d6',.7));
 const halo=mesh(badge,new THREE.TorusGeometry(.275,.017,5,48),mat(outline,.75));
 const center=mesh(badge,new THREE.RingGeometry(.055,.082,24),mat(outline,.8),[0,0,.008]);
 const dot=ball(badge,.025,mat(outline,.9),[0,0,.014],1);
 const hint=ball(badge,.028,mat(outline,.7),[.275,0,0],1);
 for(const item of [disc,halo,center,dot,hint]){item.castShadow=false;item.renderOrder=900;item.material.depthTest=false;}
 const motes=[];
 for(let i=0;i<9;i++){
  const kind=cue.kind,leaf=kind==='leaves'||kind==='petals';
  const m=mesh(origin,leaf?new THREE.SphereGeometry(.055,5,4):new THREE.SphereGeometry(.025,5,4),mat(leaf?(i%2?'#c4b580':'#a0b58d'):ink));
  if(leaf)m.scale.set(1,.25,1.7);m.castShadow=false;motes.push(m);
 }
 const rings=[];
 if(['music','ripple','wave','wind','steam'].includes(cue.kind))for(let i=0;i<3;i++){
  const r=mesh(origin,new THREE.TorusGeometry(.3,.009,4,56,cue.kind==='wind'?Math.PI*1.25:Math.PI*2),mat(cue.kind==='steam'?'#f2ede0':cue.kind==='ripple'||cue.kind==='wave'?'#e1efdb':ink));
  r.castShadow=false;rings.push(r);
 }
 let shooting=null;
 if(cue.kind==='meteor'){shooting=line(root,[[0,0,0],[1.8,.9,0]],'#fff2ce');shooting.material.transparent=true;shooting.material.opacity=0;shooting.material.depthWrite=false;}
 function update(state,camera){
  const a=state.action||0,active=state.phase==='acting',pulse=fade(a),t=state.time||0;
  const anchor=setting.interactionAnchor?.();origin.position.copy(anchor||new THREE.Vector3(...cue.anchor));
  badge.quaternion.copy(camera.quaternion);
  const waiting=state.phase==='waiting'||state.phase==='settled';
  badge.visible=!active&&!state.continuing&&state.phase!=='leaving'&&!state.opened&&!(state.opening>0)&&(id!=='ring'||state.progress>=1);
  const strength=waiting?.78:.45;
  halo.material.opacity=strength+Math.sin(t*1.7)*.06;disc.material.opacity=waiting?.68:.4;
  center.material.opacity=strength;dot.material.opacity=strength;hint.material.opacity=strength;
  badge.scale.setScalar(1+Math.sin(t*1.7)*.035);
  hint.position.set(Math.cos(t*.7)*.275,Math.sin(t*.7)*.275,.012);
  const water=cue.kind==='ripple'||cue.kind==='wave';
  for(const [i,m]of motes.entries()){
   const angle=i*2.399+a*1.8,r=.24+pulse*.55;
   m.position.set(Math.cos(angle)*r,(cue.kind==='leaves'?2-a*2.7:a*1.2)+Math.sin(angle)*.16,Math.sin(angle)*r*.6);
   m.rotation.set(a*3+i,a*2+i,a*2+i*.5);m.material.opacity=active?pulse*(cue.kind==='leaves'?.8:.6):0;
  }
  for(const [i,r]of rings.entries()){
   const p=(a+i*.23)%1;
   if(water){r.rotation.set(-Math.PI/2,0,0);r.position.set(0,(setting.waterHeight??.065)-origin.position.y,i*.1);r.scale.setScalar(1+p*4);}
   else if(cue.kind==='steam'){r.rotation.set(.5,0,a*2+i);r.position.set(Math.sin(a*5+i)*.15,a*1.4+i*.2,0);r.scale.set(.55+p*.6,.2,1);}
   else{r.quaternion.copy(camera.quaternion);r.position.set(0,i*.1,0);r.scale.setScalar(.5+p*4);}
   r.material.opacity=active?pulse*(1-p)*.5:0;
  }
  if(shooting){shooting.position.set(8-a*15,13-a*7,-12);shooting.material.opacity=active?pulse*.95:0;}
 }
 return {root,badge,update};
}

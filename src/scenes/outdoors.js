import { THREE, palette, material, mesh, box, ball, cylinder, line, group, tube, plane, base, tree, grassTuft, flower, table, chair, cup, walkway, smooth, mix, clamp, themes, sceneResult } from './kit.js';
import { seatOn } from './contacts.js';
import { couple, person, stroll } from './characters.js';
import { natureDetails } from './landscape.js';

function crab(parent,position,scale=1){
  const g=group(parent,position);g.scale.setScalar(scale);
  const shell=ball(g,.12,'#a96e4e',[0,.075,0],0);shell.scale.set(1.3,.5,1);
  for(const side of [-1,1]){
    for(let i=0;i<3;i++)tube(g,[[side*.1,.08,(i-1)*.06],[side*.21,.035,(i-1)*.11],[side*.26,.015,(i-1)*.14]],.012,'#97634a');
    tube(g,[[side*.08,.08,.1],[side*.2,.14,.2],[side*.21,.16,.27]],.02,'#b7825b');
    const claw=ball(g,.055,'#c09264',[side*.21,.17,.28],0);claw.scale.set(1,.7,1.2);
    ball(g,.018,'#383e32',[side*.05,.13,.095]);
  }return g;
}
function bucket(parent,position){
  const g=group(parent,position);const bucketMat=new THREE.MeshStandardMaterial({color:'#b3c8ba',side:THREE.DoubleSide,roughness:.7});
  mesh(g,new THREE.CylinderGeometry(.34,.26,.56,12,1,true),bucketMat,[0,.28,0]);
  cylinder(g,.26,.26,.035,'#94b0a1',[0,.025,0],12);
  const rim=mesh(g,new THREE.TorusGeometry(.34,.025,5,24),'#d2d6bc',[0,.56,0]);rim.rotation.x=Math.PI/2;
  tube(g,[[-.33,.48,0],[-.34,.87,0],[0,.99,0],[.34,.87,0],[.33,.48,0]],.018,'#6c8777');
  for(let i=0;i<5;i++)crab(g,[Math.cos(i*2.4)*.15,.1+i*.055,Math.sin(i*2.4)*.13],.64);
  return g;
}
export function crabs(){
  const root=new THREE.Group();base(root,17,11,'#a59c7e');
  plane(root,180,220,'#8ba29b',[90.8,.015,0],{roughness:.35,metalness:.15});
  const puddles=[];
  for(let i=0;i<8;i++){
    const m=mesh(root,new THREE.CircleGeometry(.5+i%3*.22,9),'#93a89a',[-5+(i%4)*2.3,.035,-2+Math.floor(i/4)*3],{roughness:.4});m.rotation.x=-Math.PI/2;m.scale.y=.6;puddles.push(m);
  }
  const smallCrabs=[];
  for(let i=0;i<9;i++)smallCrabs.push(crab(root,[-4+(i%4)*1.5,.055,-2+Math.floor(i/4)*1.8],.9));
  const pair=couple(root,[[-1.1,.04,1.6],[.25,.04,1.6]],{popo:{coat:'#c9b798'},xiaohe:{coat:'#a8b9b8'}});
  const pail=bucket(root,[1.2,.05,1.5]);
  for(const [i,c]of[pair.p,pair.h].entries()){
    const tool=group(c.arms[i].hand,[0,-.04,.1]);cylinder(tool,.012,.012,.65,'#b9b69b',[0,0,.2],4).rotation.x=Math.PI/2;
    const end=box(tool,[.1,.025,.16],'#a9aba0',[0,0,.55]);
  }
  natureDetails(root,'crabs');
  const crabOrigins=smallCrabs.map(c=>c.position.x);
  return sceneResult(root,({time,progress})=>{
    const lift=smooth((progress-.48)/.26);pair.idle(time);
    pair.p.pose({lean:1-lift,reach:.25});pair.h.pose({lean:1-lift,reach:lift*.6});
    pair.p.root.rotation.y=.25;pair.h.root.rotation.y=-.25;
    pail.position.set(mix(1.2,.8,lift),.05+lift*.58,1.5);pair.h.arms[1].shoulder.rotation.x=-lift*.75;
    smallCrabs.forEach((c,i)=>{c.position.x=crabOrigins[i]+Math.sin(time*.8+i)*.075;c.rotation.y=Math.sin(time*.3+i)*.15;});
  },{theme:themes.dusk,view:{from:[13,11,18],to:[8,6.5,14],target:[0,.8,0],endTarget:[.4,1,1.5],span:12.1,endSpan:7.8}});
}

export function stars(){
  const root=new THREE.Group();base(root,13,8,'#384b47');
  tree(root,-4.8,-2.5,1.25,'pine');tree(root,5.2,-2.6,1,'pine');
  for(let i=0;i<7;i++){const rock=ball(root,.5,'#52615a',[-5+i*1.6,.16,-2.8],0);rock.scale.y=.6;}
  const pair=couple(root,[[-1,0,1],[.5,0,1]],{popo:{rotation:Math.PI,coat:'#a5aaa2'},xiaohe:{rotation:Math.PI,coat:'#a1b8c4'}});
  const tripod=group(root,[1.65,0,-.45]);
  for(let i=0;i<3;i++){const a=i/3*Math.PI*2;tube(tripod,[[0,1.23,0],[Math.cos(a)*.46,.03,Math.sin(a)*.46]],.025,'#a7b6ac');}
  box(tripod,[.38,.25,.25],'#333f3c',[0,1.38,0]);const lens=cylinder(tripod,.1,.1,.23,'#6e837c',[0,1.38,-.23],12);lens.rotation.x=Math.PI/2;
  const vertices=[],colors=[];
  for(let i=0;i<1350;i++){
    const u=(Math.sin(i*127.1+17)*43758.5453)%1;const v=(Math.sin(i*311.7+43)*23421.631)%1;
    const x=(Math.abs(u)-.5)*48,y=2+Math.abs(v)*23,z=-12-((i*17)%100)/10;
    vertices.push(x,y,z);const col=new THREE.Color(i%7===0?'#eed5b0':i%3===0?'#adc5da':'#dce4d8');colors.push(col.r,col.g,col.b);
  }
  const starGeo=new THREE.BufferGeometry();starGeo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));starGeo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
  const sky=new THREE.Points(starGeo,new THREE.PointsMaterial({size:1.9,vertexColors:true,transparent:true,opacity:.9,sizeAttenuation:false,depthWrite:false}));root.add(sky);
  const galaxyPositions=[];
  for(let i=0;i<1700;i++){
    const x=-24+(i%170)/170*48;const noise=Math.sin(i*127.1)*Math.cos(i*41.7);
    galaxyPositions.push(x,7+x*.13+noise*(1.2+Math.sin(i)*.7),-19+Math.sin(i*.45)*2.5);
  }
  const galaxyGeo=new THREE.BufferGeometry();galaxyGeo.setAttribute('position',new THREE.Float32BufferAttribute(galaxyPositions,3));
  const galaxy=new THREE.Points(galaxyGeo,new THREE.PointsMaterial({color:'#c1bcd5',size:1.6,transparent:true,opacity:.4,sizeAttenuation:false,depthWrite:false}));root.add(galaxy);
  const cloudCanvas=document.createElement('canvas');cloudCanvas.width=512;cloudCanvas.height=128;
  const ctx=cloudCanvas.getContext('2d');ctx.scale(1,.25);
  const glow=ctx.createRadialGradient(256,256,0,256,256,256);glow.addColorStop(0,'rgba(190,184,219,.35)');glow.addColorStop(.45,'rgba(156,173,203,.18)');glow.addColorStop(1,'rgba(128,155,195,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,512,512);
  const cloudTexture=new THREE.CanvasTexture(cloudCanvas);
  const cloud=mesh(root,new THREE.PlaneGeometry(42,6),new THREE.MeshBasicMaterial({map:cloudTexture,transparent:true,opacity:.4,blending:THREE.AdditiveBlending,depthWrite:false}),[0,7,-19.2]);cloud.rotation.z=.13;cloud.castShadow=false;
  const meteor=line(root,[[0,0,0],[1.6,1.0,0]],'#e9dfc8');meteor.material.transparent=true;meteor.material.opacity=0;
  natureDetails(root,'stars');
  return sceneResult(root,({time,progress})=>{
    pair.idle(time);pair.p.head.rotation.x=-.18;pair.h.head.rotation.x=-.18;
    sky.rotation.z=Math.sin(time*.012)*.015;galaxy.material.opacity=.4+Math.sin(time*.22)*.035;
    const m=clamp((progress-.49)/.12);meteor.material.opacity=m>0&&m<1?Math.sin(m*Math.PI)*.95:0;meteor.position.set(mix(7,-3,m),mix(12,6,m),-12);
  },{theme:{...themes.night,background:'#0d1b2b',bottom:'#102e30',ambient:.65,intensity:1.1},view:{from:[10,6.5,17],to:[7,5,15],target:[0,4,-2],endTarget:[0,5,-4],span:14,endSpan:13.7}});
}

export function camp(){
  const root=new THREE.Group();base(root,16,11,'#93a978');
  for(const [x,z,s] of [[-6,-3,1.4],[5.8,-2.9,1.2],[-6,3,1],[6.1,3,.9]])tree(root,x,z,s);
  for(let i=0;i<16;i++)flower(root,-6+(i%6)*2.1,-3+Math.floor(i/6)*2.8,i%2?'#d9c897':'#bba4a0');
  const canopy=group(root,[0,0,-.3]);
  for(const x of [-4.2,4.2])for(const z of [-2.7,2.7])cylinder(canopy,.025,.04,3.7,'#a9a88b',[x,1.85,z],6);
  const corners=[[-4.2,3.7,-2.7],[4.2,3.7,-2.7],[4.2,3.7,2.7],[-4.2,3.7,2.7]],roof=[];
  for(let i=0;i<4;i++)roof.push(...corners[i],0,4.35,0,...corners[(i+1)%4]);
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(roof,3));geo.computeVertexNormals();
  mesh(canopy,geo,'#e4d6b4',[0,0,0],{side:THREE.DoubleSide});
  table(root,[0,0,.35],2.8,1.9,'#bba67d');
  for(const [x,z,yaw] of [[-.7,-1.18,0],[.7,-1.18,0],[-2.02,.5,Math.PI/2],[2.02,.5,-Math.PI/2]])chair(root,[x,0,z],yaw,'#b6b99b');
  const pair=couple(root,[[-.7,.54,-1],[.7,.54,-1]]);
  const friends=[person(root,'friend-boy',[-1.85,.54,.5],{rotation:Math.PI/2,coat:'#879b81',hair:'#665a43'}),person(root,'friend-girl',[1.85,.54,.5],{rotation:-Math.PI/2,coat:'#c5a698',hair:'#665044'})];
  seatOn(pair.p,.6,[-.7,-1.18]);seatOn(pair.h,.6,[.7,-1.18]);
  seatOn(friends[0],.6,[-2.02,.5],Math.PI/2);seatOn(friends[1],.6,[2.02,.5],-Math.PI/2);
  const cards=[];
  for(let i=0;i<5;i++){
    const g=group(root,[-.7+i*.35,.958,.45]);box(g,[.24,.015,.34],'#f0e5ce',[0,0,0]);const suit=ball(g,.04,i%2?'#a36355':'#47564b',[0,.02,0],0);suit.scale.set(1,.12,1);cards.push(g);
  }
  for(const x of [-.7,.7])cup(root,[x,.951,-.2],'#b7b39a');
  natureDetails(root,'camp');
  return sceneResult(root,({time,action=0})=>{
    for(const c of [pair.p,pair.h,...friends]){c.pose({sit:1});c.idle(time);c.arms[0].shoulder.rotation.x=-.65+Math.sin(time*.7)*.05;}
    cards[4].rotation.z=Math.sin(time*.4)*.015;cards[4].rotation.x=action*Math.PI*2;cards[4].position.y=.958+Math.sin(action*Math.PI)*.36;
  },{contacts:{actors:[pair.p,pair.h,...friends]},view:{from:[12,9,17],to:[9,6,15],target:[0,1.2,.1],endTarget:[0,1.5,0],span:12.5,endSpan:8.5}});
}

function swan(parent,position,baby=false){
  const g=group(parent,position);if(baby)g.scale.setScalar(.43);
  const color=baby?'#b6b5a3':'#364840';
  const body=ball(g,.42,color,[0,.28,0],1);body.scale.set(1,.62,1.5);
  for(const side of [-1,1]){const wing=ball(g,.3,baby?'#c4c2af':'#465b4d',[side*.22,.36,-.05],0);wing.scale.set(.5,.65,1.4);}
  tube(g,[[0,.4,.38],[0,.7,.46],[0,1.0,.3],[0,1.17,.42],[0,1.14,.58]],.085,color);
  ball(g,.125,color,[0,1.14,.59],1);
  const beak=mesh(g,new THREE.ConeGeometry(.06,.2,5),baby?'#928f71':'#be7862',[0,1.12,.77]);beak.rotation.x=Math.PI/2;
  for(const side of [-1,1])ball(g,.017,'#1d3129',[side*.105,1.18,.65]);return g;
}
export function swans(){
  const root=new THREE.Group();base(root,17,11,'#779d80');
  box(root,[220,.09,160],'#709b90',[0,-.01,-77.9],{roughness:.35,metalness:.12});
  box(root,[220,.09,2.2],'#bcb493',[0,.19,2.9]);
  for(let i=0;i<38;i++)box(root,[.4,.11,2.2],'#bcb493',[-7.7+i*.42,.2,2.9]);
  for(let i=0;i<9;i++){
    const x=-7.5+i*1.8;cylinder(root,.035,.04,.85,'#7f8469',[x,.7,1.82],6);
    if(i<8)box(root,[1.8,.055,.06],'#959c7c',[x+.9,1.1,1.82]);
  }
  for(const [x,z,s]of[[-6,-3.9,1.3],[-2.7,-4.1,1.5],[4.4,-4.1,1.3],[7,3.7,.8]])tree(root,x,z,s);
  const pair=couple(root,[[-.6,.3,2.8],[.65,.3,2.8]],{popo:{rotation:Math.PI},xiaohe:{rotation:Math.PI}});
  const birds=[swan(root,[-.7,.08,-.7]),swan(root,[.7,.08,-1.5])];
  for(let i=0;i<8;i++)birds.push(swan(root,[-2+(i%4)*.65,.08,-2.8+Math.floor(i/4)*.6],true));
  const ripples=[];
  birds.forEach(b=>{const ring=mesh(root,new THREE.RingGeometry(.39,.405,32),new THREE.MeshBasicMaterial({color:'#c5d8bc',transparent:true,opacity:.22,side:THREE.DoubleSide}),[b.position.x,.065,b.position.z]);ring.rotation.x=-Math.PI/2;ring.scale.y=1.4;ripples.push(ring);});
  natureDetails(root,'swans');
  const birdOrigins=birds.map(b=>b.position.x);
  return sceneResult(root,({time,action=0})=>{
    pair.idle(time);birds.forEach((b,i)=>{b.position.x=birdOrigins[i]+Math.sin(time*.2+i)*.22+action*(i>1?.65:.35);b.rotation.y=.35+Math.sin(time*.2+i)*.12;b.position.y=.08+Math.sin(time*1.1+i)*.015;});
    ripples.forEach((r,i)=>{r.position.x=birds[i].position.x;r.scale.setScalar(1+Math.sin(time*.8+i)*.09);});
  },{view:{from:[12,10,18],to:[9,6.8,15],target:[0,1,0],endTarget:[0,1,-.6],span:12.8,endSpan:9.3}});
}

export function forest(){
  const root=new THREE.Group();base(root,16,12,'#739273');
  walkway(root,[[-4.5,4.3],[-1,2],[.6,-.2],[2.3,-3.5]],1.0,'#b6b191');
  for(const [x,z,s]of[[-6.2,-3.7,2.5],[-2.8,-4,3.2],[2.1,-4.5,3],[6,-3,2.6],[-6.5,2.3,2.2],[6.3,2.7,2.7]]){
    tree(root,x,z,s);for(let j=0;j<4;j++){const a=j*Math.PI/2;tube(root,[[x,.6,z],[x+Math.cos(a)*.7,.12,z+Math.sin(a)*.7],[x+Math.cos(a)*1.1,.04,z+Math.sin(a)*1.1]],.08,'#6d6c4e');}
  }
  for(let i=0;i<34;i++)grassTuft(root,-6+(i%9)*1.4,-4+Math.floor(i/9)*2.5,0,'#9baa76');
  const pair=couple(root,[[-2,0,2],[-.9,0,2.2]],{popo:{coat:'#b9b79a'},xiaohe:{coat:'#b6c4b0'}});
  natureDetails(root,'forest');
  return sceneResult(root,({time,progress,phase})=>{
    const t=smooth(progress),walk=phase==='waiting'||phase==='settled'?0:.55;
    for(const [i,c]of[pair.p,pair.h].entries()){c.root.position.set(-2+i*1.1+t*1.5,.0455,2.4-t*2.2);c.root.rotation.y=2.8;c.pose({walk,phase:t*2.66*12.8+i*.7});stroll(c,t*2.66,walk);}pair.idle(time);
  },{view:{from:[12,7.5,19],to:[8,6.3,16],target:[0,2.6,0],endTarget:[0,2.7,-.1],span:14.5,endSpan:11.6}});
}

function palm(parent,x,z,scale=1){
  const g=group(parent,[x,0,z]);g.scale.setScalar(scale);
  tube(g,[[0,0,0],[.12,1.3,0],[.35,2.8,.02],[.55,4,.04]],.13,'#ad8d62');
  for(let i=0;i<7;i++){
    const a=i/7*Math.PI*2,leaves=[];
    for(const [r,y,w]of[[0,4.05,0],[.65,4.27,.18],[1.3,4,.22],[1.9,3.5,0]]){
      leaves.push(Math.cos(a)*r-Math.sin(a)*w+.55,y,Math.sin(a)*r+Math.cos(a)*w,
        Math.cos(a)*r+Math.sin(a)*w+.55,y,Math.sin(a)*r-Math.cos(a)*w);
    }
    const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(leaves,3));geo.setIndex([0,1,2,1,3,2,2,3,4,3,5,4,4,5,6,5,7,6]);geo.computeVertexNormals();mesh(g,geo,i%2?'#6c9368':'#87a574',[0,0,0],{side:THREE.DoubleSide});
  }
}
function lounger(root,position){
  const g=group(root,position);box(g,[.88,.12,1.9],'#c5b087',[0,.42,.2]);
  const back=box(g,[.88,.11,1.05],'#ddd1af',[0,.72,-.68]);back.rotation.x=.62;
  for(const x of [-.34,.34])for(const z of [-.6,.8])box(g,[.06,.42,.06],'#927d5b',[x,.2,z]);
  for(let i=0;i<7;i++)box(g,[.84,.02,.025],'#ad9c78',[0,.49,-.3+i*.2]);return g;
}
export function beach(){
  const root=new THREE.Group();base(root,18,12,'#d5c49e');
  box(root,[220,.1,180],'#75a7a3',[0,-.02,-89.45],{roughness:.25,metalness:.15});
  for(let i=0;i<5;i++){const wave=box(root,[220,.012,.05],'#d2dfc5',[0,.05,-.1-i*.65],{transparent:true,opacity:.5-i*.07});wave.userData.offset=i;}
  palm(root,-6.2,1.8,1.15);palm(root,6.4,2,1.05);
  lounger(root,[-1.15,0,1.55]);lounger(root,[1.15,0,1.55]);
  const pair=couple(root,[[-1.15,.36,1.5],[1.15,.36,1.5]],{popo:{coat:'#dad6bc',pants:'#7d9b9a'},xiaohe:{coat:'#aac4c2',pants:'#c9c5a5'}});
  seatOn(pair.p,.48,[-1.15,1.55]);seatOn(pair.h,.48,[1.15,1.55]);
  const waterWaves=root.children.filter(c=>c.userData.offset!==undefined);
  natureDetails(root,'beach');
  return sceneResult(root,({time,action=0})=>{
    for(const c of [pair.p,pair.h]){
      c.pose({sit:1,recline:1});c.body.position.z=-.12;c.body.position.y=.40;
      for(const leg of c.legs){leg.hip.rotation.set(-Math.PI/2,0,0);leg.knee.rotation.set(0,0,0);leg.shoe.rotation.x=Math.PI/2;leg.shoe.position.z=-.045;}
    }pair.idle(time);
    waterWaves.forEach((w,i)=>{w.position.z=-.1-i*.65+Math.sin(time*.6+i*.2)*.15+Math.sin(action*Math.PI)*.4;w.scale.x=1+Math.sin(time*.4+i)*.004;});
  },{contacts:{actors:[pair.p,pair.h]},view:{from:[12,10,18],to:[9,7,16],target:[0,1,.3],endTarget:[0,1.1,1.2],span:13.2,endSpan:9.5}});
}

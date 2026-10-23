import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { THREE, group, box, ball, cylinder, line, tube, tree, grassTuft, flower, roof, bench, mesh } from './kit.js';

function shrub(parent,x,y,z,size=.4,color='#879564'){
  for(let j=0;j<3;j++){
    const leaf=ball(parent,size*(1-j*.12),color,[x+(j-1)*size*.7,y+size*.45,z+(j%2)*size*.25],0);
    leaf.scale.y=.7;
  }
}
function pot(parent,x,z,color='#c0a27d'){
  cylinder(parent,.17,.12,.3,color,[x,.15,z],7);
  shrub(parent,x,.3,z,.2,'#8b9f70');
}
function reed(parent,x,z,y=0){
  for(let j=0;j<4;j++){
    const stem=cylinder(parent,.009,.014,.38+j*.08,'#a1ac78',[x+j*.07,y+.18+j*.04,z+(j%2)*.05],4);stem.rotation.z=(j-1.5)*.12;
    if(j%2===0)cylinder(parent,.025,.027,.14,'#8b7957',[x+j*.07,y+.43+j*.04,z],5);
  }
}

// Bake the small static details per material, keeping richer scenery inexpensive to draw.
export function bakeScenery(root){
  root.updateWorldMatrix(true,true);
  const inverse=root.matrixWorld.clone().invert(),batches=new Map(),originals=new Set();
  const remove=[];
  root.traverse(node=>{
    if(!node.isMesh||Array.isArray(node.material))return;
    const geometry=node.geometry.index?node.geometry.toNonIndexed():node.geometry.clone();
    geometry.applyMatrix4(inverse.clone().multiply(node.matrixWorld));
    if(!geometry.getAttribute('uv'))geometry.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(geometry.getAttribute('position').count*2),2));
    if(!batches.has(node.material))batches.set(node.material,[]);
    batches.get(node.material).push(geometry);originals.add(node.geometry);remove.push(node);
  });
  for(const node of remove)node.removeFromParent();
  for(const [mat,geos]of batches){
    const geometry=mergeGeometries(geos,false);
    mesh(root,geometry,mat);geos.forEach(g=>g.dispose());
  }
  originals.forEach(g=>g.dispose());
}

export function riverDetails(root){
  const g=group(root);
  // Individual paving stones, a timber landing, and moss along the old canal wall.
  for(let i=0;i<48;i++){
    const z=-4.7+(i%24)*.4,x=-.74+Math.floor(i/24)*.39;
    box(g,[.34,.025,.33],i%3?'#c2b79e':'#ada58d',[x,.061,z]);
  }
  for(let i=0;i<21;i++){
    const z=-4.8+i*.47;
    box(g,[.035,.05,.19],i%2?'#87916b':'#96a27a',[-1.21,.02,z]);
    if(i%3===0)reed(g,-3.58,z,.025);
  }
  for(let i=0;i<7;i++)box(g,[.72,.075,.14],'#9b8b67',[-1.65,.14,-.65+i*.16]);
  for(const x of [-1.92,-1.4])for(const z of [-.75,.4])cylinder(g,.045,.06,.46,'#736a4d',[x,-.03,z],5);
  for(let i=0;i<4;i++)box(g,[.42,.09,.28],'#aca38b',[-1.02-i*.13,.1-i*.09,2.5]);
  tube(g,[[-1.35,.2,.38],[-1.5,.08,.5],[-1.7,.08,.42]],.018,'#c5b788');
  // Window shutters, roof vents, outdoor shelves and flowerpots vary the street frontage.
  for(const [x,z,w,h,d]of[[-5.35,-3.35,2.8,1.85,2.15],[-5.45,-.55,2.5,1.55,1.8],[1.45,-3.6,2.7,1.8,2.1],[4.45,-3.55,2.4,2.1,2.05]]){
    box(g,[.28,.6,.35],'#9b9b85',[x+w*.28,h+.55,z-.5]);
    for(const side of [-1,1]){
      const shutter=box(g,[.23,.62,.055],'#7b8064',[x+side*w*.42,h*.56,z+d*.5+.16]);shutter.rotation.y=side*.35;
      pot(g,x+side*w*.43,z+d*.5+.48);
    }
    for(let j=0;j<5;j++)box(g,[.24,.03,d*.94],'#777d6b',[x+(j-2)*.35,h+.17,z]);
  }
  // A few quiet courtyards around the open lawn.
  bench(g,5.05,.15,-.3);
  for(let j=0;j<5;j++){
    const x=4+j*.65;
    cylinder(g,.035,.04,.55,'#9d9b7b',[x,.23,4.45],5);
    if(j<4)box(g,[.65,.065,.045],'#b2ad8c',[x+.32,.42,4.45]);
  }
  for(const [x,z,s,col]of[[5.5,2.8,.55,'#929e6a'],[6.6,3.8,.48,'#788b61'],[4.5,4.1,.36,'#9b9e69'],[.5,4.4,.32,'#8b9d6f'],[6,-1,.42,'#8d9d70'],[-6.5,2.5,.45,'#9da375'],[-4.9,4.2,.42,'#7d9369']])shrub(g,x,0,z,s,col);
  tree(g,7.1,.3,.8);tree(g,-7,-3.2,.7,'pine');
  for(let i=0;i<62;i++){
    const x=.5+((i*37)%66)/10,z=.7+((i*23)%40)/10;
    if(Math.hypot(x-2.45,z-3.4)<1.12)continue;
    if(i%4===0)grassTuft(g,x,z);else if(i%3===0)flower(g,x,z,i%2?'#dec697':'#e7d8b4');
    else{const stone=ball(g,.045+(i%3)*.02,'#a7ac87',[x,-.015,z]);stone.scale.y=.3;}
  }
  // Creeping vines and scattered fallen leaves keep the geometry organic.
  for(let j=0;j<9;j++)ball(g,.12,'#8d9c6c',[6.75+j*.035,.2+j*.15,-2.7+Math.sin(j)*.07]);
  for(let i=0;i<24;i++){
    const leaf=ball(g,.055,i%2?'#c6b17b':'#a5a273',[-6.7+(i%8)*1.8,-.012,-1.3+Math.floor(i/8)*2.6]);leaf.scale.set(1,.12,.6);
  }
  bakeScenery(g);return g;
}

export function mountainDetails(root){
  const g=group(root);
  // Distant, layered ridgelines sit beyond the small lake and roofscape.
  for(let i=0;i<7;i++){
    const hill=ball(g,1,i%2?'#879b87':'#98a58f',[-6.5+i*1.9,.18,-4.3],0);hill.scale.set(1.8,.7+(i%3)*.22,.85);
  }
  for(let i=0;i<26;i++){
    const x=1.5+(i%8)*.74,z=-4.7+Math.floor(i/8)*.57,h=.25+((i*13)%9)/14;
    roof(g,.47,.4,.13,[x,h+.03,z]);
  }
  for(const [x,z,s]of[[5.9,-.9,.38],[7,1.4,.43],[3.6,-1.6,.27]]){
    const island=ball(g,s,'#7a947b',[x,.035,z],0);island.scale.set(1,.16,1.6);
    shrub(g,x,.03,z,s*.45,'#96a27c');
  }
  for(let i=0;i<13;i++){
    const x=1.8+(i%4)*1.5,z=-1.9+Math.floor(i/4)*1.1;
    line(g,[[x,.045,z],[x+.35,.045,z+.02],[x+.6,.045,z]],'#aec1ad',.35);
  }
  // Weathered boulders, mixed conifers, fern clumps and amber leaves.
  for(let i=0;i<24;i++){
    const x=-6.4+(i%6)*1.1,z=-3.5+Math.floor(i/6)*2.1;
    if(Math.hypot(x+1.05,z-1.35)<2.2||Math.hypot(x+1.4,z+1.2)<1.1)continue;
    const r=ball(g,.24+(i%4)*.08,['#8d967b','#778970','#a5a88a'][i%3],[x,.45+(i%3)*.28,z],0);r.scale.set(1.3,.7,1);
    shrub(g,x+.28,r.position.y-.12,z,.24,'#82936a');
  }
  for(let i=0;i<17;i++){
    const angle=i/17*Math.PI*2,x=-2+Math.cos(angle)*4.15,z=.2+Math.sin(angle)*3.55;
    const stone=ball(g,.4+(i%3)*.12,['#7e8e72','#8a9579','#a0a58a'][i%3],[x,.42+(i%4)*.15,z]);
    stone.scale.set(1.25,.65,.8);stone.rotation.y=angle;
    if(i%2===0)shrub(g,x-.1,stone.position.y+.2,z,.2,'#97a070');
  }
  for(const [x,z,s]of[[-2.9,2.4,.2],[-2.4,2.7,.15],[-.2,3.5,.18]]){
    const stone=ball(g,s,'#b5b294',[x,2.19,z]);stone.scale.y=.4;
  }
  for(const [x,z,s,y]of[[-5,-2.6,.9,1],[-4.4,-3.9,.75,.3],[-6.8,-1.4,.8,.2],[-4.4,.1,.7,1.4],[.8,-1.6,.57,.4],[-4,3.5,.65,.6]])tree(g,x,z,s,x<-5?'round':'pine',y);
  for(let i=0;i<25;i++){
    const x=-6.4+(i%5)*.7,z=-2.9+Math.floor(i/5)*1.45;
    grassTuft(g,x,z,.8+(i%3)*.12,i%3?'#9ca273':'#b4a573');
  }
  // Support the ascending path with a rocky spine, rather than floating treads.
  for(let i=0;i<12;i++){
    const t=i/11;
    const rock=ball(g,.58,'#899576',[-.03-1.4*t,1.9+t*.52,1.3-3.2*t]);rock.scale.set(1.35,.5,1);
  }
  bakeScenery(g);return g;
}

export function natureDetails(root,kind){
  const g=group(root);
  if(kind==='swans'){
    for(const x of [-7,-5.8,4.8,6.5])reed(g,x,-3.4,.05);
    for(let i=0;i<14;i++){
      const pad=cylinder(g,.13+(i%3)*.04,.13,.012,i%2?'#8ca77c':'#a2b28b',[-6+(i%7)*1.8,.055,-3.8+Math.floor(i/7)*.75],7);pad.rotation.y=i;
    }
    for(const [x,z,s]of[[-6.2,4.25,.45],[4.9,4.3,.38],[6.6,3.8,.45]])shrub(g,x,0,z,s);
  }else if(kind==='forest'){
    for(let i=0;i<35;i++){
      const x=-6.5+(i%8)*1.8,z=-4.8+Math.floor(i/8)*2.2;
      if(Math.abs(x)<2.1&&Math.abs(z)<3)continue;
      if(i%3===0){
        cylinder(g,.018,.025,.12,'#d2bf97',[x,.07,z],5);
        const cap=ball(g,.09,i%2?'#bd9d79':'#b1aa7e',[x,.15,z]);cap.scale.y=.4;
      }else{
        for(let j=0;j<4;j++){
          const fern=mesh(g,new THREE.ConeGeometry(.1,.4,3),'#91a879',[x+Math.cos(j*1.57)*.1,.12,z+Math.sin(j*1.57)*.1]);fern.rotation.z=Math.sin(j*1.57)*.6;fern.rotation.x=Math.cos(j*1.57)*.6;
        }
      }
    }
    const log=cylinder(g,.18,.23,2.3,'#7e7455',[-3.9,.18,2.8],7);log.rotation.z=1.5;log.rotation.y=.35;
    for(let i=0;i<5;i++)shrub(g,-4.8+i*.45,.25,2.8,.13,'#95a37a');
  }else if(kind==='beach'){
    for(let i=0;i<35;i++){
      const x=-8+(i%12)*1.4,z=.9+Math.floor(i/12)*1.8;
      if(Math.abs(x)<2.5&&z<3.7)continue;
      const shell=ball(g,.035+i%3*.012,i%2?'#e9d9b4':'#b7ae92',[x,.025,z]);shell.scale.set(1,.3,.7);
    }
    for(const [x,z,s]of[[-7.3,-.6,.5],[-6.6,-.8,.3],[7.4,-1.4,.4]]){
      const stone=ball(g,s,'#aaa98d',[x,.04,z],0);stone.scale.y=.5;
    }
    for(let i=0;i<28;i++){
      const foam=ball(g,.035+i%3*.01,'#d7e2cc',[-8+i*.6,.045,.42+Math.sin(i*.57)*.1]);foam.scale.y=.15;
    }
  }else if(kind==='crabs'){
    for(let i=0;i<36;i++){
      const x=-7.6+(i%9)*1.1,z=-4.2+Math.floor(i/9)*2.4;
      const shell=ball(g,.04+i%3*.02,i%2?'#c5b897':'#868e75',[x,.025,z]);shell.scale.set(1.3,.25,1);
      if(i%5===0)reed(g,x+.3,z,.02);
    }
    for(let i=0;i<7;i++){
      const pool=ball(g,.15+i*.025,'#829e94',[-1.8+Math.sin(i*.7)*.6,.025,-4.5+i*1.5]);pool.scale.set(1,.035,3);
    }
  }else if(kind==='camp'){
    for(const [x,z,s]of[[-4.5,-2.9,.45],[4.6,-3.3,.5],[-5,3.5,.4],[5,3.7,.35]])shrub(g,x,0,z,s);
    for(let i=0;i<22;i++){
      const x=-6.6+(i%8)*1.85,z=-3.8+Math.floor(i/8)*3.6;
      if(Math.abs(x)<3)continue;
      grassTuft(g,x,z);
    }
  }else if(kind==='stars'){
    for(let i=0;i<6;i++){
      const hill=ball(g,1,'#263f40',[-7+i*2.7,.2,-4.2]);hill.scale.set(2.2,1+(i%3)*.4,1);
    }
    for(let i=0;i<14;i++)grassTuft(g,-7+(i%7)*2.2,3.7+Math.floor(i/7)*.5,0,'#617c68');
  }
  bakeScenery(g);return g;
}

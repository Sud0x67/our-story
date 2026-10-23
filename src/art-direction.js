export function selectLook(search=''){
  const name=new URLSearchParams(search).get('look');
  return name==='paper'?'paper':'clay';
}
export const LOOK=selectLook(typeof location==='undefined'?'':location.search);
export const ART=LOOK==='paper'?{
  name:'清透纸雕',rounded:false,exposure:1.06,shadow:.48,
  sky:'#e7f1ee',ground:'#a0bdc8',sun:'#fff4d8',fill:'#c8e5ee',ambient:'#f4faf3',bounce:'#93b0bc',
  soil:'#d8c6ad',grass:'#91b8a2',water:'#72b8c4',roof:'#596e83',leaf:'#7eac98',leafLight:'#bdd2a4',
  duskSky:'#e9ddd9',duskGround:'#b1b9ca',warmSky:'#e0c8b5',warmGround:'#b6a4a1',nightSky:'#192c43',nightGround:'#111e35',
}:{
  name:'暖色黏土',rounded:true,exposure:1.02,shadow:.52,
  sky:'#f4e7d8',ground:'#dbc3b2',sun:'#fff1d5',fill:'#f5d9cd',ambient:'#fff5e5',bounce:'#b6a58e',
  soil:'#cba48b',grass:'#94b69a',water:'#80b9b3',roof:'#6c7b80',leaf:'#8eae87',leafLight:'#c0cca2',
  duskSky:'#f0d9ce',duskGround:'#c4b6b6',warmSky:'#e6c7ad',warmGround:'#b99785',nightSky:'#293b50',nightGround:'#182638',
};

const replacements={
  '#7e9665':ART.grass,'#4c6250':ART.soil,'#527e7c':ART.water,'#6f8c5a':ART.leaf,'#a1ad73':ART.leafLight,
  '#454c43':ART.roof,'#e2d7b8':LOOK==='paper'?'#fbefd8':'#f0dfc5',
  '#cda497':'#d9afbb','#dfb8a6':'#f2cad0','#b58f83':'#c79ca9',
  '#5d8582':ART.water,'#709b90':ART.water,'#75a7a3':LOOK==='paper'?'#7ec8d1':'#89c5c1',
  '#5d7c61':LOOK==='paper'?'#84af9c':'#87a68f','#6e8264':LOOK==='paper'?'#90b3a0':'#9ab69a','#8b9a73':LOOK==='paper'?'#b4c7aa':'#bcc8a4',
  '#5c7860':ART.ground,'#293f32':'#405448','#292c29':'#3b3331','#2b2b29':'#352f30',
  '#947359':'#a17b61','#a78ab8':'#baa0cc','#323936':'#363b42','#e9e5d7':'#f3eee3',
};
export function paintColor(value){
  if(typeof value!=='string')return value;
  return replacements[value.toLowerCase()]||value;
}
export function themeFor(theme,id){
  const night=['live','concert','cycling','stars','ring'].includes(id);
  const warm=['bar','skewers','barbecue'].includes(id);
  const dusk=['mountain','crabs'].includes(id);
  let background=night?ART.nightSky:warm?ART.warmSky:dusk?ART.duskSky:ART.sky;
  let bottom=night?ART.nightGround:warm?ART.warmGround:dusk?ART.duskGround:ART.ground;
  if(id==='stars'){background='#102234';bottom='#1b3040';}
  if(id==='ring'){background=LOOK==='paper'?'#24394c':'#493846';bottom=LOOK==='paper'?'#152838':'#261d29';}
  return {...theme,background,bottom,sun:night?theme.sun:ART.sun,intensity:night?theme.intensity:2.6,ambient:night?theme.ambient:1.45};
}

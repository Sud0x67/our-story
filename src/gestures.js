// One finger navigates; two fingers are reserved for inspecting the 3D view.
export function pointerIntent(start,end,{multiTouch=false}={}){
 if(!start||multiTouch)return null;
 const dx=end.x-start.x,dy=end.y-start.y,distance=Math.hypot(dx,dy);
 if(distance<=8)return 'tap';
 if(Math.max(Math.abs(dx),Math.abs(dy))<56)return null;
 if(Math.abs(dx)>Math.abs(dy)*1.15)return dx<0?'next':'previous';
 if(Math.abs(dy)>Math.abs(dx)*1.15)return dy<0?'next':'previous';
 return null;
}
export class WheelIntent{
 constructor(){this.total=0;this.last=-Infinity;this.lockedUntil=0;}
 push(delta,now){
  if(!Number.isFinite(delta)||Math.abs(delta)<1||now<this.lockedUntil)return null;
  if(now-this.last>180||Math.sign(delta)!==Math.sign(this.total))this.total=0;
  this.last=now;this.total+=delta;
  if(Math.abs(this.total)<80)return null;
  const direction=this.total>0?'next':'previous';this.total=0;this.lockedUntil=now+1100;return direction;
 }
}

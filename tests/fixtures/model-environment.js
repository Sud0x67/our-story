import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
// Model-only tests: stand-ins for label canvases and image loading; no WebGL renderer.
const context={fillRect(){},strokeRect(){},fillText(){},scale(){},createRadialGradient(){return {addColorStop(){}};}};
class TestImage extends EventTarget{
 set src(value){
  const header=readFileSync(resolve('public',value.replace(/^\//,''))).subarray(0,12);
  assert.equal(header.toString('ascii',8,12),'WEBP');
  this.width=this.height=1;queueMicrotask(()=>this.dispatchEvent(new Event('load')));
 }
}
globalThis.document={createElement:()=>({getContext:()=>context}),createElementNS:()=>new TestImage()};
globalThis.window=new EventTarget();
globalThis.location={search:process.env.OUR_STORY_LOOK==='paper'?'?look=paper':''};

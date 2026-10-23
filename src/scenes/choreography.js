import { smooth, mix } from './kit.js';

export function riverMotion(progress,index=0){
  const travel=smooth(progress/.38),turn=smooth((progress-.32)/.13);
  return {
    position:[mix(-.35+index*.82,2.05+index*.79,travel),.015,mix(1.1+index*.12,3.4,travel)],
    yaw:mix(.84,-.12,turn),
    distance:travel*3.32,
    walking:smooth(progress/.04)*(1-smooth((progress-.32)/.07)),
    sitting:smooth((progress-.46-index*.018)/.18),
    chatting:smooth((progress-.67)/.08),
  };
}

export function mountainMotion(progress,index=0){
  const turn=smooth((progress-.5)/.15),travel=smooth((progress-.65)/.35);
  const yaw=mix(.3,3.554,turn),offset=index?.39:-.39;
  return {
    position:[-.03+offset*Math.cos(yaw)-travel*1.4,2.23+travel*.52,1.3-offset*Math.sin(yaw)-travel*3.2],
    yaw,
    hands:smooth((progress-.35)/.13),
    distance:travel*3.49,
    walking:smooth((progress-.65)/.03)*(1-smooth((progress-.975)/.025)),
    turning:Math.sin(turn*Math.PI),
  };
}

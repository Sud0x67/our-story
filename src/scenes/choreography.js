import { smooth, mix } from './kit.js';

export function riverMotion(progress, index = 0) {
  const travel = smooth(progress / 0.38),
    turn = smooth((progress - 0.32) / 0.13);
  return {
    position: [
      mix(-0.35 + index * 0.82, 2.05 + index * 0.79, travel),
      0.015,
      mix(1.1 + index * 0.12, 3.4, travel),
    ],
    yaw: mix(0.84, -0.12, turn),
    distance: travel * 3.32,
    walking: smooth(progress / 0.04) * (1 - smooth((progress - 0.32) / 0.07)),
    sitting: smooth((progress - 0.46 - index * 0.018) / 0.18),
    chatting: smooth((progress - 0.67) / 0.08),
  };
}

export function mountainMotion(progress, index = 0) {
  const turn = smooth((progress - 0.5) / 0.15),
    travel = smooth((progress - 0.65) / 0.35);
  const yaw = mix(0.3, 3.554, turn),
    offset = index ? 0.39 : -0.39;
  return {
    position: [
      -0.03 + offset * Math.cos(yaw) - travel * 1.4,
      2.23 + travel * 0.52,
      1.3 - offset * Math.sin(yaw) - travel * 3.2,
    ],
    yaw,
    hands: smooth((progress - 0.35) / 0.13),
    distance: travel * 3.49,
    walking: smooth((progress - 0.65) / 0.03) * (1 - smooth((progress - 0.975) / 0.025)),
    turning: Math.sin(turn * Math.PI),
  };
}

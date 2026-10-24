// Intro timestamps use the original scene clock. They stop before the meaningful action.
const cues = {
  river: [10, 9.5, [2.45, 0.15, 3.8], 'petals', '点击坐到草坪上聊天'],
  mountain: [8, 16, [-0.03, 2.95, 1.3], 'heart', '点击牵手，继续上山'],
  bar: [5, 4, [0, 1.32, 0.4], 'toast', '点击点亮杯中的微光'],
  live: [6, 4, [0, 2, -2.5], 'music', '点击让歌声化作声波'],
  museum: [4, 4.5, [0, 2, 1.15], 'photo', '点击拿起面具，留下合照'],
  skewers: [5, 4, [0, 1.65, 0.6], 'steam', '点击让热气升起'],
  crabs: [6, 4.5, [1.2, 1, 1.5], 'ripple', '点击看看桶里的收获'],
  stars: [7, 6.8, [1.65, 1.6, -0.45], 'meteor', '点击让流星接连划过银河'],
  shop: [5, 4.5, [2.3, 1.85, 1.6], 'petals', '点击挑选小玩偶，看看合照'],
  cycling: [5, 5, [2, 3.7, 1.5], 'wind', '点击跟着气球继续骑行'],
  camp: [6, 4, [0, 1.3, 0.45], 'cards', '点击翻一张牌'],
  concert: [6, 4, [0, 2.5, -4.1], 'music', '点击点亮舞台的灯光'],
  driving: [6, 8.5, [0, 1.8, 1.2], 'wind', '点击继续向前开'],
  barbecue: [5, 3, [0, 1.45, -0.1], 'toast', '点击举杯，一起干杯'],
  swans: [6, 4.5, [0, 0.22, -1.6], 'ripple', '点击跟随小天鹅的水纹'],
  forest: [5, 5, [0, 2.7, 0], 'leaves', '点击沿着落叶继续走'],
  coffee: [5, 4, [0.2, 1.4, 0.5], 'steam', '点击让咖啡热气轻轻升起'],
  beach: [6, 6.8, [-4.6, 0.18, 0.1], 'wave', '点击让海浪靠近岸边'],
  ring: [19, 4.5, [0, 0.68, 1.04], 'ring', '点击打开戒指盒'],
};
export const INTERACTIONS = Object.fromEntries(
  Object.entries(cues).map(([id, [introAt, duration, anchor, kind, label]]) => [
    id,
    {
      introAt,
      duration,
      anchor,
      kind,
      label,
      pace: ['mountain', 'barbecue', 'beach', 'stars'].includes(id) ? 'linear' : 'eased',
    },
  ]),
);
export const sceneCue = (id) =>
  INTERACTIONS[id] || {
    introAt: 5,
    duration: 4,
    anchor: [0, 1, 0],
    kind: 'petals',
    label: '点击继续这段回忆',
  };

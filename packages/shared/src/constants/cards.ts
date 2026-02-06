import type { Card } from '../types/game.js';

export const INITIAL_CARDS: Card[] = [
  {
    id: 'card_moldy_bun',
    name: '半个发霉的馒头',
    tags: ['食物', '腐烂', '绝望'],
    description: '已经长出了某种文明的孢子。也许这就是最原始的农业。',
    physical_value: 15,
    narrative_potential: 20,
    rarity: 'common',
  },
  {
    id: 'card_plastic_guan_yu',
    name: '义乌产塑料关公像(掉漆版)',
    tags: ['信仰', '武德', '廉价'],
    description: '青龙偃月刀断了一截，但不妨碍信徒跪拜。信仰的力量与塑料的质量无关。',
    physical_value: 5,
    narrative_potential: 75,
    rarity: 'common',
  },
  {
    id: 'card_red_phone',
    name: '甚至没有插线的红色电话机',
    tags: ['权威', '神秘', '沉默'],
    description: '它从不响起，但每个人都相信它连着某个更高的权力。沉默本身就是最好的证据。',
    physical_value: 3,
    narrative_potential: 90,
    rarity: 'rare',
  },
  {
    id: 'card_half_history',
    name: '只有下半部的《XX通史》',
    tags: ['仇恨', '历史', '残缺'],
    description: '上半部不知去向。但这恰好意味着：起源可以由你来书写。',
    physical_value: 2,
    narrative_potential: 80,
    rarity: 'common',
  },
  {
    id: 'card_radish_stamps',
    name: '许多枚公章(刻萝卜做的)',
    tags: ['官僚', '许可', '混乱'],
    description: '盖上去的印迹会在三天后消失，但官僚程序只需要它存在那一秒钟。',
    physical_value: 8,
    narrative_potential: 50,
    rarity: 'common',
  },
  {
    id: 'card_bloody_glasses',
    name: '带血的眼镜',
    tags: ['知识', '脆弱', '替罪羊'],
    description: '前主人是个会计。他犯了一个致命的错误：识字。',
    physical_value: 1,
    narrative_potential: 55,
    rarity: 'common',
  },
  {
    id: 'card_spam_cans',
    name: '一箱全英文标签的午餐肉',
    tags: ['食物', '外来', '阴谋'],
    description: '没人读得懂上面的字，这让它充满了神秘的营养价值和帝国主义的香气。',
    physical_value: 40,
    narrative_potential: 45,
    rarity: 'common',
  },
  {
    id: 'card_bootleg_dvd',
    name: '盗版《建国大业》DVD光盘',
    tags: ['神话', '娱乐', '反射'],
    description: '画面时不时跳帧，恰好跳过了所有不方便的历史细节。天然的宣传素材。',
    physical_value: 3,
    narrative_potential: 70,
    rarity: 'common',
  },
  {
    id: 'card_broken_speaker',
    name: '坏掉的村口大喇叭',
    tags: ['宣传', '噪音', '真理'],
    description: '只能发出刺耳的啸叫。但群众已经习惯了把噪音当作真理的声音。',
    physical_value: 5,
    narrative_potential: 75,
    rarity: 'common',
  },
];

// Extended cards that can be discovered/rewarded
export const EXTENDED_CARDS: Card[] = [
  {
    id: 'card_barbed_wire',
    name: '一卷生锈的铁丝网',
    tags: ['防御', '暴力', '边界'],
    description: '每一根刺都是一个主权宣言。',
    physical_value: 10,
    narrative_potential: 40,
    rarity: 'common',
  },
  {
    id: 'card_coffee_stain',
    name: '沾了咖啡渍的空白地图',
    tags: ['领土', '发明', '污渍'],
    description: '棕色的咖啡渍恰好覆盖了三个省份。这不是污渍，这是法理宣称。',
    physical_value: 1,
    narrative_potential: 85,
    rarity: 'rare',
  },
  {
    id: 'card_enemy_corpse',
    name: '敌军的尸体(保存完好)',
    tags: ['暴力', '恐惧', '圣物'],
    description: '经过适当的叙事加工，敌人的尸体可以变成殉道者、恶魔或圣人。',
    physical_value: 0,
    narrative_potential: 65,
    rarity: 'rare',
  },
  {
    id: 'card_child_drawing',
    name: '孩子画的国旗',
    tags: ['纯真', '宣传', '未来'],
    description: '蜡笔画的，歪歪扭扭。但这是"民意"最纯粹的表达形式。',
    physical_value: 0,
    narrative_potential: 60,
    rarity: 'common',
  },
  {
    id: 'card_rusty_ak',
    name: '生锈的AK-47(缺少弹匣)',
    tags: ['暴力', '权威', '废铁'],
    description: '不能射击，但可以挥舞。在叙事的世界里，姿态比功能更重要。',
    physical_value: 15,
    narrative_potential: 35,
    rarity: 'common',
  },
];

export const ALL_CARDS: Card[] = [...INITIAL_CARDS, ...EXTENDED_CARDS];

export function getCardById(id: string): Card | undefined {
  return ALL_CARDS.find((c) => c.id === id);
}

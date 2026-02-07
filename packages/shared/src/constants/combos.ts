import type { ComboFormula } from '../types/game.js';

export const COMBO_FORMULAS: ComboFormula[] = [
  {
    id: 'combo_thunder_thorns',
    name: '关帝爷的雷电荆棘',
    description:
      '当塑料关公遇到铁丝网，信仰便有了物理形态。任何试图翻越边境的人都将面对神罚——以及破伤风。',
    required_cards: ['card_plastic_guan_yu', 'card_barbed_wire'],
    result: {
      id: 'myth_thunder_thorns',
      name: '关帝爷的雷电荆棘',
      description: '神权防御工事：边境不可侵犯，因为那是神的领地。',
      effect: {
        violence_authority: 15,
        narrative_integrity: 10,
      },
      source_combo: ['card_plastic_guan_yu', 'card_barbed_wire'],
    },
  },
  {
    id: 'combo_black_stain_claim',
    name: '大黑斑行省法理宣称',
    description:
      '半部史书上恰好缺失的章节，加上地图上恰好存在的咖啡渍——这不是巧合，这是天命。从今天起，这片棕色区域就是我们自古以来的神圣领土。',
    required_cards: ['card_half_history', 'card_coffee_stain'],
    result: {
      id: 'myth_black_stain',
      name: '大黑斑行省法理宣称',
      description: '领土发明：一片由咖啡渍定义的"自古以来"。',
      effect: {
        narrative_integrity: 20,
        population: 200,
      },
      source_combo: ['card_half_history', 'card_coffee_stain'],
    },
  },
  {
    id: 'combo_spam_standard',
    name: '肉罐头金本位',
    description:
      '红色电话连接着看不见的权威，萝卜公章赋予一切合法性，午餐肉提供实物担保——一个完美的货币体系在垃圾堆上诞生了。',
    required_cards: ['card_spam_cans', 'card_radish_stamps', 'card_red_phone'],
    result: {
      id: 'myth_spam_standard',
      name: '肉罐头金本位',
      description: '货币体系：以午餐肉为锚定物的金融帝国。',
      effect: {
        supply_level: 20,
        corruption: 10,
        narrative_integrity: 10,
      },
      source_combo: ['card_spam_cans', 'card_radish_stamps', 'card_red_phone'],
    },
  },
  {
    id: 'combo_spirit_rally',
    name: '英灵显灵大会',
    description:
      '盗版DVD提供了视觉奇迹的蓝本，大喇叭确保每个人都能"听到"亡灵的声音，而那具保存完好的尸体——它在合适的灯光下确实看起来像是在微笑。萨满科技的巅峰之作。',
    required_cards: ['card_bootleg_dvd', 'card_broken_speaker', 'card_enemy_corpse'],
    result: {
      id: 'myth_spirit_rally',
      name: '英灵显灵大会',
      description: '萨满科技：死者为活人的疯狂背书。',
      effect: {
        narrative_integrity: 25,
        violence_authority: 10,
        sanity: -15,
      },
      source_combo: ['card_bootleg_dvd', 'card_broken_speaker', 'card_enemy_corpse'],
    },
  },
  {
    id: 'combo_leviathan',
    name: '利维坦的觉醒',
    description:
      '当所有的垃圾素材汇聚在一起，量变引发质变。叙事的密度突破了临界点，一个自我维持的政治实体从虚无中诞生。这不再是谎言——因为所有人都选择相信它。利维坦睁开了眼睛。',
    required_cards: [
      'card_plastic_guan_yu',
      'card_red_phone',
      'card_half_history',
      'card_radish_stamps',
      'card_broken_speaker',
    ],
    result: {
      id: 'myth_leviathan',
      name: '利维坦的觉醒',
      description:
        '终极合成：一个自我维持的政治神话体。它不需要你了——它会自己生长。',
      effect: {
        narrative_integrity: 50,
        violence_authority: 30,
        supply_level: 20,
        sanity: -30,
      },
      source_combo: [
        'card_plastic_guan_yu',
        'card_red_phone',
        'card_half_history',
        'card_radish_stamps',
        'card_broken_speaker',
      ],
    },
  },
  // ===== 4 New Combos =====
  {
    id: 'combo_holy_suffering',
    name: '苦修圣餐',
    description:
      '发霉的馒头不是贫穷的证据——它是神圣苦行的圣物。关公像前供奉着这颗长满绿毛的奇迹，信徒们含泪咀嚼，感受到了"神的味道"。饥饿从此有了宗教意义。',
    required_cards: ['card_moldy_bun', 'card_plastic_guan_yu'],
    result: {
      id: 'myth_holy_suffering',
      name: '苦修圣餐',
      description: '神圣饥饿：将贫穷重新定义为信仰的考验。',
      effect: {
        narrative_integrity: 15,
        supply_level: 5,
        sanity: -10,
      },
      source_combo: ['card_moldy_bun', 'card_plastic_guan_yu'],
    },
  },
  {
    id: 'combo_spiritual_victory',
    name: '精神胜利法',
    description:
      '半部史书上记载的每一次失败，经过大喇叭的重新诠释，都变成了"战略转进"。我们没有输——我们只是还没有赢。这种逻辑虽然疯狂，但无法反驳。',
    required_cards: ['card_half_history', 'card_broken_speaker'],
    result: {
      id: 'myth_spiritual_victory',
      name: '精神胜利法',
      description: '修辞术：将任何失败重新定义为尚未完成的胜利。',
      effect: {
        narrative_integrity: 20,
        violence_authority: -5,
        sanity: -10,
      },
      source_combo: ['card_half_history', 'card_broken_speaker'],
    },
  },
  {
    id: 'combo_breathing_license',
    name: '呼吸许可证',
    description:
      '萝卜公章盖在戴血眼镜的会计起草的表格上。从今天起，呼吸、行走、存在——每一项基本人权都需要盖章许可。税收从来没有这么简单过。',
    required_cards: ['card_radish_stamps', 'card_bloody_glasses'],
    result: {
      id: 'myth_breathing_license',
      name: '呼吸许可证',
      description: '官僚极权：将存在本身变成需要许可的行为。',
      effect: {
        violence_authority: 10,
        corruption: 15,
        supply_level: 5,
      },
      source_combo: ['card_radish_stamps', 'card_bloody_glasses'],
    },
  },
  {
    id: 'combo_cyber_necromancy',
    name: '赛博招魂术',
    description:
      '没有插线的红色电话机对准敌人保存完好的尸体。你拿起听筒，严肃地宣布："他说了，他死前最后的遗言是支持我们。"没人敢质疑死者的意愿——尤其是当死者"亲口"说出来的时候。',
    required_cards: ['card_red_phone', 'card_enemy_corpse'],
    result: {
      id: 'myth_cyber_necromancy',
      name: '赛博招魂术',
      description: '亡灵代言：让死者为活人的权力背书。',
      effect: {
        violence_authority: 15,
        narrative_integrity: 10,
        sanity: -15,
      },
      source_combo: ['card_red_phone', 'card_enemy_corpse'],
    },
  },
];

export function findMatchingCombo(cardIds: string[]): ComboFormula | undefined {
  const idSet = new Set(cardIds);
  return COMBO_FORMULAS.find((combo) =>
    combo.required_cards.every((req) => idSet.has(req)),
  );
}

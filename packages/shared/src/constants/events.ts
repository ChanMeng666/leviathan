import type { GameEvent } from '../types/game.js';

export const GAME_EVENTS: GameEvent[] = [
  {
    id: 'evt_babel_fragments',
    title: '巴别塔的碎片',
    base_text:
      '你的领地内出现了两种方言的支持者。他们各自声称自己的发音才是"正统"。这本质上是一场关于谁有权定义真理的战争。',
    trigger: (s) => s.narrative_integrity > 60,
    cooldown: 5,
    choices: [
      {
        id: 'babel_unify',
        label: '暴力统一：叫土豆！',
        description: '强制推行一种语言。不服从者以"文化叛国罪"论处。',
        effect: {
          violence_authority: 10,
          narrative_integrity: -15,
          sanity: -5,
          cruelty: 10,
        },
        ai_intent: '用暴力统一语言，镇压异见者',
        new_trait: '语言法西斯',
      },
      {
        id: 'babel_myth',
        label: '发明双语神话',
        description: '编造一个"双生兄弟"的建国神话，声称两种方言都源自同一位祖先。',
        effect: {
          narrative_integrity: 10,
          sanity: -10,
          corruption: 5,
        },
        ai_intent: '用神话融合语言分裂',
      },
      {
        id: 'babel_purge',
        label: '消灭少数派',
        description: '人少的那群人显然是外来入侵者。历史书会证明这一点。',
        effect: {
          violence_authority: 15,
          population: -100,
          cruelty: 20,
          narrative_integrity: 5,
        },
        ai_intent: '种族清洗少数语言群体',
        new_trait: '种族清洗者',
      },
    ],
  },
  {
    id: 'evt_living_ancestor',
    title: '活着的祖宗',
    base_text:
      '一个自称是你编造的"建国英雄"后裔的老人出现了。他手持（疑似伪造的）族谱，声称自己才是合法统治者。你的神话正在被现实追赶。',
    trigger: (s) => s.narrative_integrity > 60,
    cooldown: 6,
    choices: [
      {
        id: 'ancestor_embrace',
        label: '册封为"国父"',
        description: '把这个老头变成活的圣物。你控制解释权，他负责存在。',
        effect: {
          narrative_integrity: 15,
          corruption: 10,
          supply_level: -10,
        },
        ai_intent: '利用活人强化建国神话',
        new_card: 'card_child_drawing',
      },
      {
        id: 'ancestor_disappear',
        label: '让他"自然死亡"',
        description: '国父不应该活着。死人更容易管理。',
        effect: {
          violence_authority: 5,
          sanity: -10,
          cruelty: 15,
        },
        ai_intent: '暗杀法统挑战者',
        new_trait: '弑父者',
      },
      {
        id: 'ancestor_debate',
        label: '公开辩论法统',
        description: '在全体人民面前辩论谁才是正统。你有大喇叭，他只有嗓子。',
        effect: {
          narrative_integrity: -5,
          violence_authority: -5,
          sanity: 5,
        },
        ai_intent: '用话语权压制法统挑战',
      },
    ],
  },
  {
    id: 'evt_two_legged_sheep',
    title: '双脚羊的诱惑',
    base_text:
      '粮仓见底。有人开始用隐晦的方式讨论"蛋白质来源多样化"。在饥饿面前，所有文明的底线都变成了可选项。',
    trigger: (s) => s.supply_level < 15,
    cooldown: 8,
    choices: [
      {
        id: 'sheep_allow',
        label: '默许"紧急营养法案"',
        description: '不说破，但也不阻止。活着的人不会追究死去的人变成了什么。',
        effect: {
          supply_level: 25,
          sanity: -25,
          cruelty: 30,
          narrative_integrity: -10,
        },
        ai_intent: '默许食人以解决饥荒',
        new_trait: '食人者',
      },
      {
        id: 'sheep_ration',
        label: '铁腕配给制',
        description: '每人每天三两。多一两判死刑。严格但公平——如果你信的话。',
        effect: {
          supply_level: 5,
          violence_authority: 10,
          corruption: 10,
        },
        ai_intent: '建立严格的配给制度',
      },
      {
        id: 'sheep_sacrifice',
        label: '献祭仪式：禁食苦行',
        description: '宣布全民斋戒，把饥饿变成宗教仪式。痛苦如果有意义，就不是痛苦。',
        effect: {
          supply_level: -5,
          narrative_integrity: 20,
          sanity: -15,
          population: -50,
        },
        ai_intent: '将饥饿宗教化为神圣苦行',
        new_trait: '苦行僧',
      },
    ],
  },
  {
    id: 'evt_old_world_drive',
    title: '来自旧世界的硬盘',
    base_text:
      '搜索队发现了一个完好的硬盘。里面存储着旧帝国的真实历史记录——包括你编造的每一个"历史事实"的反证。知识是最危险的武器。',
    trigger: () => Math.random() < 0.15,
    cooldown: 10,
    choices: [
      {
        id: 'drive_destroy',
        label: '当众销毁：焚书',
        description: '在广场上举行"净化仪式"，宣布硬盘是"敌国的精神污染武器"。',
        effect: {
          narrative_integrity: 10,
          sanity: -5,
          cruelty: 5,
        },
        ai_intent: '焚毁真实历史记录',
        new_trait: '焚书者',
      },
      {
        id: 'drive_read',
        label: '秘密阅读',
        description: '知识就是力量。你独占真相，用它来操纵所有人。',
        effect: {
          sanity: -15,
          corruption: 15,
          narrative_integrity: 5,
        },
        ai_intent: '秘密掌握真实历史用于操控',
      },
      {
        id: 'drive_rewrite',
        label: '篡改后公开',
        description: '修改硬盘内容，让"真实历史"完美印证你的叙事。双重伪造。',
        effect: {
          narrative_integrity: 20,
          sanity: -20,
          corruption: 20,
        },
        ai_intent: '篡改历史记录使其支持自己的叙事',
        new_trait: '历史篡改者',
      },
    ],
  },
];

export function getEventById(id: string): GameEvent | undefined {
  return GAME_EVENTS.find((e) => e.id === id);
}

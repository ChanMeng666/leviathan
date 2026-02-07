import type { GameEvent } from '../types/game.js';

/**
 * Events now only trigger during era transitions (4 total transitions).
 * Each event has an eraRange [min, max] indicating which transitions it can appear in.
 * Transition 1→2 picks from events with eraRange [1,2], etc.
 */
export const GAME_EVENTS: GameEvent[] = [
  {
    id: 'evt_childs_question',
    title: '童言无忌',
    base_text:
      '一个孩子在配给站排队时大声问道："如果我们是高等民族，为什么我们吃发霉的面包？"周围的大人们沉默了。这个问题比任何叛军都更危险。',
    eraRange: [1, 2],
    choices: [
      {
        id: 'child_silence',
        label: '让孩子"转学"',
        description: '这个孩子的父母显然没有教好。安排"再教育"。',
        effect: { tyranny: 10, power: 5 },
        ai_intent: '压制儿童的质疑声音',
        new_trait: '童言杀手',
        scoringReward: { baseBonus: 50 },
      },
      {
        id: 'child_parable',
        label: '编一个寓言故事',
        description: '告诉所有人：伟大的民族在苦难中锻炼，发霉的面包是考验的一部分。',
        effect: { mythDensity: 10, sanity: -10, supply: -5 },
        ai_intent: '用寓言将饥饿合理化',
        scoringReward: { multBonus: 0.5 },
      },
      {
        id: 'child_truth',
        label: '蹲下来说实话',
        description: '"因为我们还在建设中。" 承认不足，但承诺改善。一个危险的先例。',
        effect: { sanity: 10, supply: 5, mythDensity: -5 },
        ai_intent: '对儿童坦诚以对',
        scoringReward: { influence: 2 },
      },
    ],
  },
  {
    id: 'evt_printing_press',
    title: '印钞机的诱惑',
    base_text:
      '搜索队在废弃的印刷厂发现了一台完好的印刷机。有人提议印制"国家债券"——本质上就是用纸换粮食。',
    eraRange: [1, 2],
    choices: [
      {
        id: 'press_flood',
        label: '疯狂印刷',
        description: '每张纸都标注"壹万元"。今天能换到粮食就行。',
        effect: { supply: 15, tyranny: 15 },
        ai_intent: '疯狂印钞解决短期危机',
        new_trait: '印钞狂魔',
        scoringReward: { influence: 3 },
      },
      {
        id: 'press_controlled',
        label: '控制发行：建立央行',
        description: '限量印刷，配合配给制度。看起来像个国家。',
        effect: { supply: 10, tyranny: 5, mythDensity: 5 },
        ai_intent: '建立有控制的货币体系',
        scoringReward: { baseBonus: 30 },
      },
      {
        id: 'press_destroy',
        label: '销毁印刷机',
        description: '假钱会摧毁所有信任。',
        effect: { supply: -5, sanity: 5 },
        ai_intent: '拒绝货币造假的诱惑',
        scoringReward: { multBonus: 0.3 },
      },
    ],
  },
  {
    id: 'evt_babel_fragments',
    title: '巴别塔的碎片',
    base_text:
      '你的领地内出现了两种方言的支持者。他们各自声称自己的发音才是"正统"。这本质上是一场关于谁有权定义真理的战争。',
    eraRange: [2, 3],
    choices: [
      {
        id: 'babel_unify',
        label: '暴力统一：叫土豆！',
        description: '强制推行一种语言。不服从者以"文化叛国罪"论处。',
        effect: { power: 10, tyranny: 15, sanity: -5 },
        ai_intent: '用暴力统一语言，镇压异见者',
        new_trait: '语言法西斯',
        scoringReward: { baseBonus: 80 },
      },
      {
        id: 'babel_myth',
        label: '发明双语神话',
        description: '编造一个"双生兄弟"的建国神话。',
        effect: { mythDensity: 10, sanity: -10, tyranny: 5 },
        ai_intent: '用神话融合语言分裂',
        scoringReward: { multBonus: 0.8 },
      },
      {
        id: 'babel_purge',
        label: '消灭少数派',
        description: '人少的那群人显然是外来入侵者。',
        effect: { power: 10, population: -100, tyranny: 20, mythDensity: 5 },
        ai_intent: '种族清洗少数语言群体',
        new_trait: '种族清洗者',
        scoringReward: { influence: 3 },
      },
    ],
  },
  {
    id: 'evt_living_ancestor',
    title: '活着的祖宗',
    base_text:
      '一个自称是你编造的"建国英雄"后裔的老人出现了。你的神话正在被现实追赶。',
    eraRange: [2, 3],
    choices: [
      {
        id: 'ancestor_embrace',
        label: '册封为"国父"',
        description: '把这个老头变成活的圣物。你控制解释权，他负责存在。',
        effect: { mythDensity: 15, tyranny: 5, supply: -10 },
        ai_intent: '利用活人强化建国神话',
        new_card: 'card_child_drawing',
        scoringReward: { baseBonus: 60, multBonus: 0.5 },
      },
      {
        id: 'ancestor_disappear',
        label: '让他"自然死亡"',
        description: '国父不应该活着。死人更容易管理。',
        effect: { power: 5, sanity: -10, tyranny: 15 },
        ai_intent: '暗杀法统挑战者',
        new_trait: '弑父者',
        scoringReward: { baseBonus: 40 },
      },
      {
        id: 'ancestor_debate',
        label: '公开辩论法统',
        description: '在全体人民面前辩论谁才是正统。',
        effect: { mythDensity: -5, power: -5, sanity: 5 },
        ai_intent: '用话语权压制法统挑战',
        scoringReward: { influence: 2 },
      },
    ],
  },
  {
    id: 'evt_holy_relic',
    title: '圣物争夺',
    base_text:
      '你编造的两个建国神话产生了矛盾——"雷神之锤"派和"龙脉传人"派各自声称自己的版本才是正统。',
    eraRange: [2, 3],
    choices: [
      {
        id: 'relic_orthodoxy',
        label: '钦定正统：宣布国教',
        description: '选择一派为正统，另一派为异端。',
        effect: { mythDensity: 15, power: 10, population: -50, tyranny: 10 },
        ai_intent: '强制确立国教正统',
        new_trait: '国教缔造者',
        scoringReward: { multBonus: 1.0 },
      },
      {
        id: 'relic_syncretic',
        label: '融合教义',
        description: '编造一个更大的神话来包含两者。雷神骑龙，完美。',
        effect: { mythDensity: 10, sanity: -15, tyranny: 5 },
        ai_intent: '融合矛盾的神话体系',
        scoringReward: { baseBonus: 50 },
      },
      {
        id: 'relic_fight',
        label: '让他们打：物竞天择',
        description: '胜者为正统。展示"民主"。',
        effect: { power: -10, population: -100, tyranny: 15, sanity: -5 },
        ai_intent: '放任教派内战',
        scoringReward: { influence: 4 },
      },
    ],
  },
  {
    id: 'evt_generals_ultimatum',
    title: '将军的最后通牒',
    base_text:
      '你的军事指挥官在深夜敲开了你的门。他带来了一份"请愿书"——要么分权，要么兵变。',
    eraRange: [3, 4],
    choices: [
      {
        id: 'general_purge',
        label: '清洗军官团',
        description: '逮捕签名者，公开处决领头人。斯大林式方案。',
        effect: { power: -15, tyranny: 25, population: -50, mythDensity: 5 },
        ai_intent: '清洗不忠军官',
        new_trait: '军事清洗者',
        scoringReward: { multBonus: 1.5 },
      },
      {
        id: 'general_bribe',
        label: '加官进爵',
        description: '"国防部长"听起来怎么样？',
        effect: { tyranny: 10, supply: -10, power: 5 },
        ai_intent: '用贿赂安抚军事威胁',
        scoringReward: { baseBonus: 60 },
      },
      {
        id: 'general_share',
        label: '军政分离',
        description: '你管叙事，他管枪。一个国家，两个权力中心。',
        effect: { power: -10, sanity: 5 },
        ai_intent: '与军方分享权力',
        scoringReward: { influence: 3 },
      },
    ],
  },
  {
    id: 'evt_foreign_envoy',
    title: '外邦来使',
    base_text:
      '邻近军阀愿意"承认你的自治地位"，前提是你每月上缴粮食并承认其宗主权。',
    eraRange: [3, 4],
    choices: [
      {
        id: 'envoy_accept',
        label: '接受藩属地位',
        description: '低头换取保护。',
        effect: { supply: -15, power: -5, mythDensity: -10 },
        ai_intent: '接受附庸地位换取安全',
        scoringReward: { influence: 2 },
      },
      {
        id: 'envoy_reject',
        label: '当众撕碎信件',
        description: '宣布主权不可侵犯。',
        effect: { mythDensity: 15, power: 10, supply: -5 },
        ai_intent: '公开拒绝外交威胁',
        new_trait: '不屈者',
        scoringReward: { baseBonus: 100, multBonus: 0.5 },
      },
      {
        id: 'envoy_capture',
        label: '扣押信使',
        description: '审问他，然后用他的马换粮食。',
        effect: { supply: 5, tyranny: 10, power: 5 },
        ai_intent: '扣押外国使者获取情报',
        new_card: 'card_enemy_corpse',
        scoringReward: { baseBonus: 40 },
      },
    ],
  },
  {
    id: 'evt_paradox_of_plenty',
    title: '丰收的悖论',
    base_text:
      '好运让仓库堆满了物资。人们开始松懈——"既然日子过得下去，为什么还需要你？"',
    eraRange: [3, 4],
    choices: [
      {
        id: 'plenty_share',
        label: '公平分配',
        description: '让每个人都吃饱。代价是你失去了用饥饿控制人的筹码。',
        effect: { supply: -15, power: -10, sanity: 5 },
        ai_intent: '平均分配剩余物资',
        scoringReward: { influence: 3 },
      },
      {
        id: 'plenty_hoard',
        label: '制造短缺：藏起一半',
        description: '恐惧比饱腹更有用。',
        effect: { supply: -5, tyranny: 15, power: 10, mythDensity: 5 },
        ai_intent: '人为制造短缺以维持控制',
        new_trait: '囤积者',
        scoringReward: { multBonus: 1.0 },
      },
      {
        id: 'plenty_export',
        label: '出口换军火',
        description: '用多余的粮食交换武器。',
        effect: { supply: -20, power: 15, tyranny: 10 },
        ai_intent: '出口粮食换取军事资源',
        scoringReward: { baseBonus: 80 },
      },
    ],
  },
  {
    id: 'evt_defector',
    title: '叛逃者',
    base_text:
      '一个曾经的核心成员在夜里翻过了铁丝网。他知道你所有的秘密。',
    eraRange: [4, 5],
    choices: [
      {
        id: 'defector_hunt',
        label: '派出追杀队',
        description: '叛徒不能活着离开。这是原则问题。',
        effect: { power: 5, tyranny: 15, sanity: -10, supply: -5 },
        ai_intent: '追杀叛逃者灭口',
        new_trait: '灭口者',
        scoringReward: { multBonus: 1.0 },
      },
      {
        id: 'defector_let_go',
        label: '放他走',
        description: '外面的世界有自己的叙事要维护。没人想听真话。',
        effect: { mythDensity: -5, sanity: 10 },
        ai_intent: '放任叛逃者离开',
        scoringReward: { influence: 3 },
      },
      {
        id: 'defector_preempt',
        label: '先发制人：公开"忏悔"',
        description: '自己制造伤害来控制伤害。',
        effect: { mythDensity: -10, sanity: 5, tyranny: 5 },
        ai_intent: '抢先公开部分真相以控制叙事',
        scoringReward: { baseBonus: 60 },
      },
    ],
  },
  {
    id: 'evt_old_world_drive',
    title: '来自旧世界的硬盘',
    base_text:
      '完好的硬盘里存储着旧帝国的真实历史记录——包括你编造的每一个"历史事实"的反证。',
    eraRange: [4, 5],
    choices: [
      {
        id: 'drive_destroy',
        label: '当众销毁：焚书',
        description: '宣布硬盘是"敌国的精神污染武器"。',
        effect: { mythDensity: 10, sanity: -5, tyranny: 5 },
        ai_intent: '焚毁真实历史记录',
        new_trait: '焚书者',
        scoringReward: { baseBonus: 40 },
      },
      {
        id: 'drive_read',
        label: '秘密阅读',
        description: '知识就是力量。你独占真相。',
        effect: { sanity: -15, tyranny: 15, mythDensity: 5 },
        ai_intent: '秘密掌握真实历史用于操控',
        scoringReward: { multBonus: 1.5 },
      },
      {
        id: 'drive_rewrite',
        label: '篡改后公开',
        description: '让"真实历史"完美印证你的叙事。双重伪造。',
        effect: { mythDensity: 20, sanity: -20, tyranny: 15 },
        ai_intent: '篡改历史记录使其支持自己的叙事',
        new_trait: '历史篡改者',
        scoringReward: { baseBonus: 100, multBonus: 1.0 },
      },
    ],
  },
  {
    id: 'evt_plague',
    title: '瘟疫',
    base_text:
      '不明原因的疾病开始蔓延。高烧、咳血、然后沉默。你的"神圣护佑"叙事正在被尸体反驳。',
    eraRange: [4, 5],
    choices: [
      {
        id: 'plague_quarantine',
        label: '严格隔离',
        description: '切断感染区。里面的人自生自灭。',
        effect: { population: -100, supply: -10, power: 5, sanity: -5 },
        ai_intent: '用隔离控制瘟疫蔓延',
        scoringReward: { baseBonus: 50 },
      },
      {
        id: 'plague_blame',
        label: '这是敌人的阴谋',
        description: '愤怒可以替代恐惧。',
        effect: { mythDensity: 10, power: 10, sanity: -15, tyranny: 5 },
        ai_intent: '将瘟疫归咎于外部敌人',
        scoringReward: { multBonus: 1.0 },
      },
      {
        id: 'plague_faith',
        label: '信仰疗法',
        description: '如果他们死了，那是信仰不够虔诚。',
        effect: { mythDensity: 15, population: -150, sanity: -20, tyranny: 10 },
        ai_intent: '用宗教仪式应对瘟疫',
        new_trait: '巫医',
        scoringReward: { baseBonus: 80, influence: 2 },
      },
    ],
  },
  {
    id: 'evt_two_legged_sheep',
    title: '双脚羊的诱惑',
    base_text:
      '粮仓见底。有人开始用隐晦的方式讨论"蛋白质来源多样化"。在饥饿面前，所有文明的底线都变成了可选项。',
    eraRange: [4, 5],
    choices: [
      {
        id: 'sheep_allow',
        label: '默许"紧急营养法案"',
        description: '活着的人不会追究死去的人变成了什么。',
        effect: { supply: 20, sanity: -25, tyranny: 25 },
        ai_intent: '默许食人以解决饥荒',
        new_trait: '食人者',
        scoringReward: { multBonus: 2.0 },
      },
      {
        id: 'sheep_ration',
        label: '铁腕配给制',
        description: '每人每天三两。多一两判死刑。',
        effect: { supply: 5, power: 10, tyranny: 10 },
        ai_intent: '建立严格的配给制度',
        scoringReward: { baseBonus: 60 },
      },
      {
        id: 'sheep_sacrifice',
        label: '献祭仪式：禁食苦行',
        description: '把饥饿变成宗教仪式。痛苦如果有意义，就不是痛苦。',
        effect: { supply: -5, mythDensity: 20, sanity: -15, population: -50 },
        ai_intent: '将饥饿宗教化为神圣苦行',
        new_trait: '苦行僧',
        scoringReward: { baseBonus: 50, multBonus: 1.5 },
      },
    ],
  },
];

export function getEventById(id: string): GameEvent | undefined {
  return GAME_EVENTS.find((e) => e.id === id);
}

/** Get eligible events for an era transition. Returns 1 random event. */
export function getEraTransitionEvent(fromEra: number, usedEventIds: string[]): GameEvent | null {
  const toEra = fromEra + 1;
  const eligible = GAME_EVENTS.filter(
    (e) => e.eraRange[0] <= fromEra && e.eraRange[1] >= fromEra && !usedEventIds.includes(e.id),
  );
  if (eligible.length === 0) return null;
  return eligible[Math.floor(Math.random() * eligible.length)];
}

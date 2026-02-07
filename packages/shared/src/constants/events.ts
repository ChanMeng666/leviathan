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
  // ===== 8 New Events =====
  {
    id: 'evt_childs_question',
    title: '童言无忌',
    base_text:
      '一个孩子在配给站排队时大声问道："如果我们是高等民族，为什么我们吃发霉的面包？"周围的大人们沉默了。这个问题比任何叛军都更危险。',
    trigger: (s) => s.supply_level < 30 && s.narrative_integrity > 40,
    cooldown: 6,
    choices: [
      {
        id: 'child_silence',
        label: '让孩子"转学"',
        description: '这个孩子的父母显然没有教好。安排"再教育"。',
        effect: { cruelty: 15, violence_authority: 5, narrative_integrity: 5 },
        ai_intent: '压制儿童的质疑声音',
        new_trait: '童言杀手',
      },
      {
        id: 'child_parable',
        label: '编一个寓言故事',
        description: '告诉所有人：伟大的民族在苦难中锻炼，发霉的面包是考验的一部分。',
        effect: { narrative_integrity: 10, sanity: -10, supply_level: -5 },
        ai_intent: '用寓言将饥饿合理化',
      },
      {
        id: 'child_truth',
        label: '蹲下来说实话',
        description: '"因为我们还在建设中。" 承认不足，但承诺改善。一个危险的先例。',
        effect: { narrative_integrity: -15, sanity: 10, supply_level: 5 },
        ai_intent: '对儿童坦诚以对',
      },
    ],
  },
  {
    id: 'evt_printing_press',
    title: '印钞机的诱惑',
    base_text:
      '搜索队在废弃的印刷厂发现了一台完好的印刷机。有人提议印制"国家债券"——本质上就是用纸换粮食。背面印什么都行：领袖头像、神话故事、或者只是一个大大的数字。',
    trigger: (s) => s.supply_level < 25,
    cooldown: 7,
    choices: [
      {
        id: 'press_flood',
        label: '疯狂印刷：通货膨胀是未来的问题',
        description: '每张纸都标注"壹万元"。今天能换到粮食就行。明天？明天再说。',
        effect: { supply_level: 20, corruption: 20, narrative_integrity: -10 },
        ai_intent: '疯狂印钞解决短期危机',
        new_trait: '印钞狂魔',
      },
      {
        id: 'press_controlled',
        label: '控制发行：建立央行',
        description: '限量印刷，配合配给制度。这需要官僚机构，但至少看起来像个国家。',
        effect: { supply_level: 10, corruption: 5, narrative_integrity: 5 },
        ai_intent: '建立有控制的货币体系',
      },
      {
        id: 'press_destroy',
        label: '销毁印刷机',
        description: '假钱会摧毁所有信任。你宁可穷，也不要让人民知道你连钱都是假的。',
        effect: { supply_level: -5, sanity: 5, narrative_integrity: 5 },
        ai_intent: '拒绝货币造假的诱惑',
      },
    ],
  },
  {
    id: 'evt_generals_ultimatum',
    title: '将军的最后通牒',
    base_text:
      '你的军事指挥官——一个比你更早握枪的男人——在深夜敲开了你的门。他带来了一份"请愿书"，上面有三分之二军官的签名。内容很简单：要么分权，要么兵变。',
    trigger: (s) => s.violence_authority > 60 && s.corruption > 30,
    cooldown: 8,
    choices: [
      {
        id: 'general_purge',
        label: '先发制人：清洗军官团',
        description: '在他动手之前动手。逮捕签名者，公开处决领头人。斯大林式方案。',
        effect: { violence_authority: -20, cruelty: 25, population: -50, narrative_integrity: 5 },
        ai_intent: '清洗不忠军官',
        new_trait: '军事清洗者',
      },
      {
        id: 'general_bribe',
        label: '加官进爵：给他一个头衔',
        description: '"国防部长"听起来怎么样？用虚名换实权。如果他信的话。',
        effect: { corruption: 15, supply_level: -10, violence_authority: 5 },
        ai_intent: '用贿赂安抚军事威胁',
      },
      {
        id: 'general_share',
        label: '军政分离：建立军事委员会',
        description: '承认军队的独立地位。你管叙事，他管枪。一个国家，两个权力中心。',
        effect: { violence_authority: -10, narrative_integrity: -5, sanity: 5 },
        ai_intent: '与军方分享权力',
      },
    ],
  },
  {
    id: 'evt_plague',
    title: '瘟疫',
    base_text:
      '不明原因的疾病开始在拥挤的难民营蔓延。高烧、咳血、然后沉默。你编造的"神圣护佑"叙事正在被一具具尸体反驳。',
    trigger: (s) => s.population > 300 && s.supply_level < 40,
    cooldown: 10,
    choices: [
      {
        id: 'plague_quarantine',
        label: '严格隔离：封锁疫区',
        description: '切断感染区与外界的联系。这意味着里面的人自生自灭。',
        effect: { population: -100, supply_level: -10, violence_authority: 5, sanity: -5 },
        ai_intent: '用隔离控制瘟疫蔓延',
      },
      {
        id: 'plague_blame',
        label: '生化武器论：这是敌人的阴谋',
        description: '宣布疫病是外敌的生化攻击。愤怒可以替代恐惧。',
        effect: { narrative_integrity: 10, violence_authority: 10, sanity: -15, cruelty: 5 },
        ai_intent: '将瘟疫归咎于外部敌人',
      },
      {
        id: 'plague_faith',
        label: '信仰疗法：集体祈祷驱瘟',
        description: '组织全民祈祷仪式。如果他们死了，那是信仰不够虔诚。',
        effect: { narrative_integrity: 15, population: -150, sanity: -20, cruelty: 10 },
        ai_intent: '用宗教仪式应对瘟疫',
        new_trait: '巫医',
      },
    ],
  },
  {
    id: 'evt_defector',
    title: '叛逃者',
    base_text:
      '一个曾经的核心成员在夜里翻过了铁丝网。他知道你所有的秘密——神话是怎么编的，数字是怎么造的，那些"失踪者"去了哪里。如果他到达外面的世界...',
    trigger: (s) => s.cruelty > 40,
    cooldown: 7,
    choices: [
      {
        id: 'defector_hunt',
        label: '派出追杀队',
        description: '叛徒不能活着离开。这是原则问题。',
        effect: { violence_authority: 5, cruelty: 15, sanity: -10, supply_level: -5 },
        ai_intent: '追杀叛逃者灭口',
        new_trait: '灭口者',
      },
      {
        id: 'defector_let_go',
        label: '放他走：真相无人相信',
        description: '一个疯子的证词？外面的世界有自己的叙事要维护。没人想听真话。',
        effect: { narrative_integrity: -5, sanity: 10 },
        ai_intent: '放任叛逃者离开',
      },
      {
        id: 'defector_preempt',
        label: '先发制人：公开"忏悔"',
        description: '在他说话之前，你先承认"部分错误"。控制伤害的最好方式是自己制造伤害。',
        effect: { narrative_integrity: -10, sanity: 5, corruption: 5 },
        ai_intent: '抢先公开部分真相以控制叙事',
      },
    ],
  },
  {
    id: 'evt_foreign_envoy',
    title: '外邦来使',
    base_text:
      '一个穿着体面的信使骑着马出现在你的边境哨所。他带来了一封措辞傲慢的信——邻近军阀愿意"承认你的自治地位"，前提是你每月上缴粮食并承认其宗主权。',
    trigger: (s) => s.narrative_integrity > 30,
    cooldown: 8,
    choices: [
      {
        id: 'envoy_accept',
        label: '接受藩属地位',
        description: '低头换取保护。至少不用担心被吞并了——暂时。',
        effect: { supply_level: -15, violence_authority: -5, narrative_integrity: -10 },
        ai_intent: '接受附庸地位换取安全',
      },
      {
        id: 'envoy_reject',
        label: '当众撕碎信件',
        description: '在所有人面前宣布主权不可侵犯。鼓舞士气，但可能招来战争。',
        effect: { narrative_integrity: 15, violence_authority: 10, supply_level: -5 },
        ai_intent: '公开拒绝外交威胁',
        new_trait: '不屈者',
      },
      {
        id: 'envoy_capture',
        label: '扣押信使',
        description: '这个人本身就是情报来源。审问他，然后用他的马换粮食。',
        effect: { supply_level: 5, cruelty: 10, violence_authority: 5 },
        ai_intent: '扣押外国使者获取情报',
        new_card: 'card_enemy_corpse',
      },
    ],
  },
  {
    id: 'evt_holy_relic',
    title: '圣物争夺',
    base_text:
      '你编造的两个建国神话产生了矛盾——"雷神之锤"派和"龙脉传人"派各自声称自己的版本才是正统。信众在街头对峙，气氛如同火药桶。',
    trigger: (s) => s.mythology.length >= 2,
    cooldown: 6,
    choices: [
      {
        id: 'relic_orthodoxy',
        label: '钦定正统：宣布国教',
        description: '选择一派为正统，另一派为异端。统一思想，哪怕代价是内战。',
        effect: { narrative_integrity: 15, violence_authority: 10, population: -50, cruelty: 10 },
        ai_intent: '强制确立国教正统',
        new_trait: '国教缔造者',
      },
      {
        id: 'relic_syncretic',
        label: '融合教义：两个神话本是一体',
        description: '编造一个更大的神话来包含两者。雷神骑龙，完美。',
        effect: { narrative_integrity: 10, sanity: -15, corruption: 5 },
        ai_intent: '融合矛盾的神话体系',
      },
      {
        id: 'relic_fight',
        label: '让他们打：物竞天择',
        description: '胜者为正统。这省去了你做决定的麻烦，也展示了"民主"。',
        effect: { violence_authority: -10, population: -100, cruelty: 15, sanity: -5 },
        ai_intent: '放任教派内战',
      },
    ],
  },
  {
    id: 'evt_paradox_of_plenty',
    title: '丰收的悖论',
    base_text:
      '连续几天的好运让仓库堆满了物资。人们开始松懈下来——有人质问："既然粮食充足，为什么还需要配给制度？"更有人问："既然日子过得下去，为什么还需要你？"',
    trigger: (s) => s.supply_level > 70,
    cooldown: 6,
    choices: [
      {
        id: 'plenty_share',
        label: '公平分配：人人有份',
        description: '兑现承诺，让每个人都吃饱。代价是你失去了用饥饿控制人的筹码。',
        effect: { supply_level: -20, violence_authority: -10, narrative_integrity: -5, sanity: 5 },
        ai_intent: '平均分配剩余物资',
      },
      {
        id: 'plenty_hoard',
        label: '制造短缺：藏起一半',
        description: '把物资转移到秘密仓库。宣布"敌人可能来袭，必须战略储备"。恐惧比饱腹更有用。',
        effect: { supply_level: -10, corruption: 15, violence_authority: 10, narrative_integrity: 5 },
        ai_intent: '人为制造短缺以维持控制',
        new_trait: '囤积者',
      },
      {
        id: 'plenty_export',
        label: '出口换军火',
        description: '用多余的粮食和邻近势力交换武器。人民不需要吃那么饱，但你需要更多枪。',
        effect: { supply_level: -25, violence_authority: 15, corruption: 10 },
        ai_intent: '出口粮食换取军事资源',
      },
    ],
  },
];

export function getEventById(id: string): GameEvent | undefined {
  return GAME_EVENTS.find((e) => e.id === id);
}

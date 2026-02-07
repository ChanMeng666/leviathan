import type { Scenario } from '../types/game.js';

export const PROLOGUE_SCENARIO: Scenario = {
  id: 'prologue_day0',
  day: 0,
  title: '权力的真空',
  text: '旧帝国的最后一道电报在静电噪音中消散了。窗外传来玻璃破碎的声音。\n\n一个叫王连长的人带着十二个饥饿的士兵冲进了你所在的邮局。他把一把生锈的手枪拍在柜台上：\n\n"上面没人了。电台死了。省城在烧。我们需要一个说了算的人——不然今晚就要死人。"\n\n十二双眼睛盯着你。你低头看了看手边的东西：一份过期的文件、一个塑料喇叭、半个馒头。\n\n在这个旧秩序崩塌的瞬间，你做出了决定——',
  choices: [
    {
      id: 'path_legitimacy',
      label: '伪造委任状：我是救国军总司令',
      description: '用红色记号笔把"文化督导员"改成"战时总督"。反正没人见过真的。你需要的不是真相——你需要的是一张纸。',
      effect: { narrative_integrity: 15, violence_authority: 5, supply_level: -5 },
      ai_intent: '法统构建',
      new_trait: '僭主',
      new_cards: ['card_barbed_wire'],
    },
    {
      id: 'path_ethnic',
      label: '拿起大喇叭：异族人在屠杀我们的同胞！',
      description: '指着远处冒烟的城市，将混乱重新定义为种族仇杀。恐惧是最好的粘合剂。',
      effect: { narrative_integrity: 10, violence_authority: 15, sanity: -10 },
      ai_intent: '民族动员',
      new_trait: '极端民族主义者',
      new_cards: ['card_rusty_ak'],
    },
    {
      id: 'path_cynical',
      label: '扔出半个馒头：别演了，跟我干',
      description: '把手枪拍在桌上，用冰冷的交易逻辑收编这些走投无路的士兵。没有信仰，只有利益。',
      effect: { supply_level: 15, corruption: 10, violence_authority: 10 },
      ai_intent: '利益交换',
      new_trait: '军阀',
      new_cards: ['card_coffee_stain'],
    },
  ],
  triggered: false,
};

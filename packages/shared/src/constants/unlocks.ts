/** Meta progression unlock conditions */
export interface UnlockCondition {
  id: string;
  name: string;
  description: string;
  condition: string;
  reward: string;
}

export const UNLOCK_CONDITIONS: UnlockCondition[] = [
  {
    id: 'unlock_first_clear',
    name: '初见利维坦',
    description: '首次通关',
    condition: 'first_clear',
    reward: '解锁 3 个新法令',
  },
  {
    id: 'unlock_theocracy',
    name: '神权统治者',
    description: '以神权国家通关',
    condition: 'clear_theocracy',
    reward: '解锁法令「天命所归」',
  },
  {
    id: 'unlock_warlord',
    name: '铁血军阀',
    description: '以军阀政权通关',
    condition: 'clear_warlord',
    reward: '解锁法令「铁幕」',
  },
  {
    id: 'unlock_era3',
    name: '膨胀纪幸存者',
    description: '击败纪元 3',
    condition: 'reach_era4',
    reward: '解锁 2 张新卡',
  },
  {
    id: 'unlock_era5',
    name: '利维坦缔造者',
    description: '击败纪元 5',
    condition: 'clear_all',
    reward: '解锁 2 张传说卡',
  },
];

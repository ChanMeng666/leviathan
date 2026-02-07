import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../stores';
import { getShopDecrees, getShopConsumables, INTENTS } from '@leviathan/shared';
import type { Decree, Consumable } from '@leviathan/shared';
import { BalatroBackground } from '../ui/BalatroBackground';
import { useSfx } from '../../hooks/useAudio';

type Tab = 'decrees' | 'consumables' | 'upgrade' | 'sell';

interface Props { onContinue: () => void; }

export function ShopScreen({ onContinue }: Props) {
  const [tab, setTab] = useState<Tab>('decrees');
  const influence = useGameStore((s) => s.influence);
  const crisisState = useGameStore((s) => s.crisisState);
  const equippedDecrees = useGameStore((s) => s.equippedDecrees);
  const consumables = useGameStore((s) => s.consumables);
  const hand = useGameStore((s) => s.hand);
  const deck = useGameStore((s) => s.deck);
  const spendInfluence = useGameStore((s) => s.spendInfluence);
  const equipDecree = useGameStore((s) => s.equipDecree);
  const unequipDecree = useGameStore((s) => s.unequipDecree);
  const addConsumable = useGameStore((s) => s.addConsumable);
  const upgradeIntent = useGameStore((s) => s.upgradeIntent);
  const getIntentLevel = useGameStore((s) => s.getIntentLevel);
  const addInfluence = useGameStore((s) => s.addInfluence);
  const removeCard = useGameStore((s) => s.removeCard);
  const { play: sfx } = useSfx();

  const ownedIds = equippedDecrees.map((d) => d.id);
  const shopDecrees = useMemo(() => getShopDecrees(crisisState.era, ownedIds), [crisisState.era, ownedIds.join(',')]);
  const shopConsumables = useMemo(() => getShopConsumables(), []);

  const handleBuyDecree = (decree: Decree) => {
    if (!spendInfluence(decree.cost)) return;
    sfx('card-select');
    equipDecree(decree);
  };

  const handleSellDecree = (id: string) => {
    const decree = unequipDecree(id);
    if (decree) { sfx('card-deselect'); addInfluence(1); }
  };

  const handleBuyConsumable = (consumable: Consumable) => {
    if (!spendInfluence(consumable.cost)) return;
    sfx('card-select');
    addConsumable(consumable);
  };

  const handleUpgradeIntent = (intentId: string) => {
    if (upgradeIntent(intentId)) sfx('stat-up');
  };

  const handleSellCard = (cardId: string) => {
    sfx('card-deselect');
    removeCard(cardId);
    addInfluence(1);
  };

  const RARITY_COLORS: Record<string, string> = { common: 'border-dim/30', rare: 'border-blue', legendary: 'border-gold' };

  return (
    <div className="h-screen flex flex-col relative overflow-hidden">
      <BalatroBackground className="z-0" />
      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="text-center py-4">
          <div className="text-gold text-2xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>黑市</div>
          <div className="text-dim text-xs mt-1">影响力: <span className="text-gold font-mono">{influence}</span></div>
        </div>

        {/* Tab bar */}
        <div className="flex justify-center gap-2 mb-4">
          {([['decrees', '法令'], ['consumables', '消耗品'], ['upgrade', '思想改造'], ['sell', '卖牌']] as const).map(([t, label]) => (
            <button
              key={t}
              className={`px-4 py-1.5 text-xs rounded-[var(--radius-sm)] transition-colors ${tab === t ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setTab(t)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-4 max-w-3xl mx-auto w-full">
          {tab === 'decrees' && (
            <div className="grid grid-cols-3 gap-3">
              {shopDecrees.map((d) => (
                <motion.div key={d.id} className={`card-face border-2 ${RARITY_COLORS[d.rarity] ?? 'border-dim/30'} p-3`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="text-sm font-bold text-[#2D3B2D]">{d.name}</div>
                  <div className="text-xs text-[#5A6A52] mt-1">{d.description}</div>
                  <div className="flex justify-between mt-2 items-center">
                    <span className="text-gold text-xs font-mono">{d.cost} 影响力</span>
                    <button
                      className={`text-xs px-2 py-1 rounded-[var(--radius-sm)] ${influence >= d.cost && equippedDecrees.length < 5 ? 'btn-primary' : 'bg-surface text-dim cursor-not-allowed border border-border'}`}
                      disabled={influence < d.cost || equippedDecrees.length >= 5}
                      onClick={() => handleBuyDecree(d)}
                    >
                      购买
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {tab === 'consumables' && (
            <div className="grid grid-cols-2 gap-3">
              {shopConsumables.map((c) => (
                <motion.div key={c.id} className="card-face border-2 border-dim/30 p-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="text-sm font-bold text-[#2D3B2D]">{c.name}</div>
                  <div className="text-xs text-[#5A6A52] mt-1">{c.description}</div>
                  <div className="flex justify-between mt-2 items-center">
                    <span className="text-gold text-xs font-mono">{c.cost} 影响力</span>
                    <button
                      className={`text-xs px-2 py-1 rounded-[var(--radius-sm)] ${influence >= c.cost && consumables.length < 2 ? 'btn-primary' : 'bg-surface text-dim cursor-not-allowed border border-border'}`}
                      disabled={influence < c.cost || consumables.length >= 2}
                      onClick={() => handleBuyConsumable(c)}
                    >
                      购买
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {tab === 'upgrade' && (
            <div className="space-y-2">
              {INTENTS.map((intent) => {
                const lvl = getIntentLevel(intent.id);
                return (
                  <div key={intent.id} className="card-face border border-border p-3 flex justify-between items-center">
                    <div>
                      <div className="text-sm font-bold text-[#2D3B2D]">{intent.name} <span className="text-dim text-xs">Lv.{lvl}</span></div>
                      <div className="text-xs text-[#5A6A52]">NF:{intent.base_nf + (lvl - 1) * 10} PL:{(intent.base_pl + (lvl - 1) * 0.5).toFixed(1)}</div>
                    </div>
                    <button
                      className={`text-xs px-3 py-1 rounded-[var(--radius-sm)] ${influence >= 3 ? 'btn-primary' : 'bg-surface text-dim cursor-not-allowed border border-border'}`}
                      disabled={influence < 3}
                      onClick={() => handleUpgradeIntent(intent.id)}
                    >
                      升级 (3)
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'sell' && (
            <div className="space-y-2">
              {[...hand, ...deck].map((card) => (
                <div key={card.id} className="card-face border border-border p-3 flex justify-between items-center">
                  <div>
                    <div className="text-sm font-bold text-[#2D3B2D]">{card.name}</div>
                    <div className="text-xs text-[#5A6A52]">{card.tags.join(', ')}</div>
                  </div>
                  <button className="btn-danger text-xs px-3 py-1" onClick={() => handleSellCard(card.id)}>
                    卖出 (+1)
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Equipped decrees */}
        {equippedDecrees.length > 0 && (
          <div className="border-t border-border bg-surface/80 px-6 py-2">
            <div className="text-xs text-dim mb-1">已装备法令 ({equippedDecrees.length}/5):</div>
            <div className="flex gap-2 flex-wrap">
              {equippedDecrees.map((d) => (
                <span key={d.id} className="pill-tag bg-gold/15 text-gold cursor-pointer hover:bg-red/15 hover:text-red transition-colors" onClick={() => handleSellDecree(d.id)}>
                  {d.name} ✕
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Leave button */}
        <div className="text-center py-4">
          <button className="btn-primary px-8 py-3" onClick={onContinue}>离开黑市</button>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useGameStore } from '../../stores';
import { useSfx } from '../../hooks/useAudio';

export function DecreeBar() {
  const equippedDecrees = useGameStore((s) => s.equippedDecrees);
  const consumables = useGameStore((s) => s.consumables);
  const useConsumable = useGameStore((s) => s.useConsumable);
  const setCrisisState = useGameStore((s) => s.setCrisisState);
  const crisisState = useGameStore((s) => s.crisisState);
  const setDoublePlNext = useGameStore((s) => s.setDoublePlNext);
  const hand = useGameStore((s) => s.hand);
  const deck = useGameStore((s) => s.deck);
  const removeCard = useGameStore((s) => s.removeCard);
  const { play: sfx } = useSfx();
  const [removingCard, setRemovingCard] = useState(false);
  const [pendingRemoveConsumableId, setPendingRemoveConsumableId] = useState<string | null>(null);

  const handleUseConsumable = (id: string) => {
    const consumable = consumables.find((c) => c.id === id);
    if (!consumable) return;

    if (consumable.effectType === 'remove_card') {
      // Show card picker
      setPendingRemoveConsumableId(id);
      setRemovingCard(true);
      return;
    }

    const item = useConsumable(id);
    if (!item) return;
    sfx('card-select');

    switch (item.effectType) {
      case 'extra_weave':
        setCrisisState({ weavesRemaining: crisisState.weavesRemaining + 1 });
        break;
      case 'restore_life':
        setCrisisState({ lives: Math.min(3, crisisState.lives + 1) });
        break;
      case 'double_pl':
        setDoublePlNext(true);
        break;
    }
  };

  const handleRemoveCard = (cardId: string) => {
    if (pendingRemoveConsumableId) {
      useConsumable(pendingRemoveConsumableId);
    }
    sfx('card-deselect');
    removeCard(cardId);
    setRemovingCard(false);
    setPendingRemoveConsumableId(null);
  };

  if (equippedDecrees.length === 0 && consumables.length === 0 && !removingCard) return null;

  return (
    <>
      <div className="flex items-center gap-3 px-4 py-1.5 border-b border-border bg-surface/30 text-xs">
        {equippedDecrees.length > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="text-dim">法令:</span>
            {equippedDecrees.map((d) => (
              <span key={d.id} className="pill-tag bg-gold/15 text-gold" title={d.description}>
                {d.name}
              </span>
            ))}
          </div>
        )}
        {consumables.length > 0 && (
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-dim">消耗品:</span>
            {consumables.map((c) => (
              <button
                key={c.id}
                className="pill-tag bg-teal/15 text-teal hover:bg-teal/25 transition-colors cursor-pointer"
                title={c.description}
                onClick={() => handleUseConsumable(c.id)}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {removingCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="panel p-6 max-w-lg w-full max-h-[60vh] overflow-y-auto">
            <div className="text-red text-lg font-bold mb-2">秘密审判</div>
            <div className="text-dim text-xs mb-4">选择 1 张牌永久移除</div>
            <div className="space-y-2">
              {[...hand, ...deck].map((card) => (
                <button
                  key={card.id}
                  className="w-full card-face border-2 border-red/30 hover:border-red p-3 text-left transition-colors rounded-[var(--radius-card)]"
                  onClick={() => handleRemoveCard(card.id)}
                >
                  <div className="text-sm font-bold text-[#2D3B2D]">{card.name}</div>
                  <div className="text-xs text-[#5A6A52]">{card.tags.join(', ')} · NF:{card.narrative_potential}</div>
                </button>
              ))}
            </div>
            <button className="btn-secondary text-xs mt-4 w-full py-2" onClick={() => { setRemovingCard(false); setPendingRemoveConsumableId(null); }}>
              取消
            </button>
          </div>
        </div>
      )}
    </>
  );
}

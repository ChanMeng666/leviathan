import { useGameStore } from '../../stores';
import { useSfx } from '../../hooks/useAudio';

export function DecreeBar() {
  const equippedDecrees = useGameStore((s) => s.equippedDecrees);
  const consumables = useGameStore((s) => s.consumables);
  const useConsumable = useGameStore((s) => s.useConsumable);
  const addRoundScore = useGameStore((s) => s.addRoundScore);
  const setCrisisState = useGameStore((s) => s.setCrisisState);
  const crisisState = useGameStore((s) => s.crisisState);
  const setDoublePlNext = useGameStore((s) => s.setDoublePlNext);
  const { play: sfx } = useSfx();

  const handleUseConsumable = (id: string) => {
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
      // remove_card handled separately in shop
    }
  };

  if (equippedDecrees.length === 0 && consumables.length === 0) return null;

  return (
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
  );
}

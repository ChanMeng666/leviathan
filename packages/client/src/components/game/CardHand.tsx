import { motion } from 'framer-motion';
import type { Card } from '@leviathan/shared';
import { useGameStore } from '../../stores';

const rarityBorder: Record<string, string> = {
  common: 'border-card-common',
  rare: 'border-card-rare',
  legendary: 'border-card-legendary',
};

function CardItem({ card, onSelect }: { card: Card; onSelect: (c: Card) => void }) {
  return (
    <motion.button
      className={`card-hover border ${rarityBorder[card.rarity]} bg-terminal-bg p-2 text-left w-full`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(card)}
    >
      <div className="text-sm text-terminal-fg font-bold truncate">{card.name}</div>
      <div className="text-xs text-terminal-dim mt-0.5 line-clamp-2">{card.description}</div>
      <div className="flex gap-1 mt-1 flex-wrap">
        {card.tags.map((t) => (
          <span key={t} className="text-[10px] border border-terminal-dim text-terminal-dim px-0.5">
            {t}
          </span>
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-terminal-dim mt-1">
        <span>物理:{card.physical_value}</span>
        <span>叙事:{card.narrative_potential}</span>
      </div>
    </motion.button>
  );
}

export function CardHand() {
  const hand = useGameStore((s) => s.hand);
  const deck = useGameStore((s) => s.deck);
  const discard = useGameStore((s) => s.discard);
  const selectCard = useGameStore((s) => s.selectCard);
  const phase = useGameStore((s) => s.phase);

  const canSelect = phase === 'action';

  return (
    <div className="border border-terminal-dim p-3 h-full flex flex-col">
      <div className="text-terminal-green text-center text-sm mb-2 border-b border-terminal-dim pb-1">
        {'>'} 垃圾堆 / 背包
      </div>

      <div className="flex justify-between text-xs text-terminal-dim mb-2">
        <span>牌库: {deck.length}</span>
        <span>手牌: {hand.length}</span>
        <span>弃牌: {discard.length}</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {hand.length === 0 ? (
          <div className="text-terminal-dim text-xs text-center py-8">
            [空空如也]<br />
            点击"下一天"抽取卡牌
          </div>
        ) : (
          hand.map((card) => (
            <CardItem
              key={card.id}
              card={card}
              onSelect={canSelect ? selectCard : () => {}}
            />
          ))
        )}
      </div>
    </div>
  );
}

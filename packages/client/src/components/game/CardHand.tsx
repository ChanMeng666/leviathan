import { motion } from 'framer-motion';
import type { Card } from '@leviathan/shared';
import { useGameStore } from '../../stores';
import { useSfx } from '../../hooks/useAudio';

const rarityColors: Record<string, { border: string; tag: string }> = {
  common: { border: 'border-card-common', tag: 'bg-card-common/20 text-dim' },
  rare: { border: 'border-card-rare', tag: 'bg-card-rare/20 text-card-rare' },
  legendary: { border: 'border-card-legendary', tag: 'bg-card-legendary/20 text-card-legendary' },
};

function CardItem({ card, onSelect }: { card: Card; onSelect: (c: Card) => void }) {
  const rarity = rarityColors[card.rarity] ?? rarityColors.common;
  const { play: sfx } = useSfx();
  const enhanceClass = card.enhancement === 'foil' ? 'ring-1 ring-blue/40' : card.enhancement === 'holographic' ? 'ring-1 ring-gold/60' : '';
  return (
    <motion.button
      className={`card-hover card-face border-2 ${rarity.border} ${enhanceClass} p-3 text-left w-full`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => { sfx('card-select'); onSelect(card); }}
    >
      <div className="text-sm font-bold truncate text-[#2D3B2D]">{card.name}</div>
      <div className="text-xs text-[#5A6A52] mt-0.5 line-clamp-2">{card.description}</div>
      <div className="flex gap-1 mt-1.5 flex-wrap">
        {card.tags.map((t) => (
          <span key={t} className="pill-tag bg-[#E0D8CC] text-[#5A6A52]">{t}</span>
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-[#7A8B6F] mt-1.5 font-mono">
        <span>物理:{card.physical_value}</span>
        <span>叙事:{card.narrative_potential}</span>
        {card.enhancement && card.enhancement !== 'normal' && (
          <span className={card.enhancement === 'foil' ? 'text-blue' : 'text-gold'}>
            {card.enhancement === 'foil' ? '闪' : '全息'}
          </span>
        )}
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

  const canSelect = phase === 'weave';

  return (
    <div className="panel p-3 h-full flex flex-col">
      <div className="text-accent text-center text-sm mb-2 border-b border-border pb-1 font-bold">
        垃圾堆 / 背包
      </div>

      <div className="flex justify-between text-xs text-dim mb-2 font-mono">
        <span>牌库: {deck.length}</span>
        <span>手牌: {hand.length}</span>
        <span>弃牌: {discard.length}</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {hand.length === 0 ? (
          <div className="text-dim text-xs text-center py-8">空空如也</div>
        ) : (
          hand.map((card) => (
            <CardItem key={card.id} card={card} onSelect={canSelect ? selectCard : () => {}} />
          ))
        )}
      </div>
    </div>
  );
}

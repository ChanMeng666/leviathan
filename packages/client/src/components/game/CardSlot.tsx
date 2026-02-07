import { motion } from 'framer-motion';
import type { Card } from '@leviathan/shared';
import { useSfx } from '../../hooks/useAudio';

interface CardSlotProps {
  card: Card | null;
  index: number;
  onRemove?: (cardId: string) => void;
}

export function CardSlot({ card, index, onRemove }: CardSlotProps) {
  const { play: sfx } = useSfx();
  if (!card) {
    return (
      <div className="border-2 border-dashed border-border rounded-[var(--radius-card)] h-24 flex items-center justify-center text-dim text-xs">
        插槽 {index + 1}
      </div>
    );
  }

  return (
    <motion.div
      className="card-face border-2 border-accent p-2 h-24 relative cursor-pointer rounded-[var(--radius-card)]"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      onClick={() => { sfx('card-deselect'); onRemove?.(card.id); }}
    >
      <div className="text-xs text-[#2D3B2D] font-bold truncate">{card.name}</div>
      <div className="text-[10px] text-[#5A6A52] mt-0.5 line-clamp-2">{card.description}</div>
      <button className="absolute bottom-1.5 right-1.5 w-5 h-5 flex items-center justify-center rounded-full bg-red/10 text-red text-[10px] hover:bg-red/20 transition-colors">
        ✕
      </button>
    </motion.div>
  );
}

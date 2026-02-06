import { motion } from 'framer-motion';
import type { Card } from '@leviathan/shared';

interface CardSlotProps {
  card: Card | null;
  index: number;
  onRemove?: (cardId: string) => void;
}

export function CardSlot({ card, index, onRemove }: CardSlotProps) {
  if (!card) {
    return (
      <div className="border border-dashed border-terminal-dim h-24 flex items-center justify-center text-terminal-dim text-xs">
        [插槽 {index + 1}: 空]
      </div>
    );
  }

  return (
    <motion.div
      className="border border-terminal-green bg-terminal-bg p-2 h-24 relative cursor-pointer"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      onClick={() => onRemove?.(card.id)}
    >
      <div className="text-xs text-terminal-green font-bold truncate">{card.name}</div>
      <div className="text-[10px] text-terminal-dim mt-0.5 line-clamp-2">{card.description}</div>
      <div className="absolute bottom-1 right-1 text-[10px] text-terminal-dim">
        [点击移除]
      </div>
    </motion.div>
  );
}

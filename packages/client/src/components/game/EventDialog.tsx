import { motion } from 'framer-motion';
import { Modal } from '../ui/Modal';
import { useGameStore } from '../../stores';
import { getCardById } from '@leviathan/shared';
import type { EventChoice } from '@leviathan/shared';

export function EventDialog() {
  const activeEvent = useGameStore((s) => s.activeEvent);
  const activeEventFlavor = useGameStore((s) => s.activeEventFlavor);
  const resolveEvent = useGameStore((s) => s.resolveEvent);
  const applyStatChanges = useGameStore((s) => s.applyStatChanges);
  const addTrait = useGameStore((s) => s.addTrait);
  const addHistoryEntry = useGameStore((s) => s.addHistoryEntry);
  const addCardToHand = useGameStore((s) => s.addCardToHand);
  const day = useGameStore((s) => s.day);
  const setPhase = useGameStore((s) => s.setPhase);

  if (!activeEvent) return null;

  const handleChoice = (choice: EventChoice) => {
    applyStatChanges(choice.effect);
    if (choice.new_trait) addTrait(choice.new_trait);
    if (choice.new_card) {
      const card = getCardById(choice.new_card);
      if (card) addCardToHand(card);
    }
    addHistoryEntry(`[Day ${day}] 事件「${activeEvent.title}」: 选择了「${choice.label}」`);
    resolveEvent(activeEvent.id, choice.id, day);
    setPhase('settle');
  };

  return (
    <Modal open={true} title={`! ${activeEvent.title} !`} variant="danger">
      <div className="mb-4">
        <p className="text-sm text-terminal-fg leading-relaxed">
          {activeEventFlavor || activeEvent.base_text}
        </p>
      </div>

      <div className="space-y-2">
        {activeEvent.choices.map((choice, idx) => (
          <motion.button
            key={choice.id}
            className="w-full border border-terminal-red/50 hover:border-terminal-red p-3 text-left transition-colors hover:bg-terminal-red/5"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: idx * 0.1 }}
            onClick={() => handleChoice(choice)}
          >
            <div className="text-sm text-terminal-red font-bold">{choice.label}</div>
            <div className="text-xs text-terminal-dim mt-0.5">{choice.description}</div>
            <div className="flex gap-2 mt-1 text-[10px] text-terminal-dim">
              {Object.entries(choice.effect).map(([k, v]) => (
                <span
                  key={k}
                  className={Number(v) > 0 ? 'text-terminal-green' : 'text-terminal-red'}
                >
                  {k}: {Number(v) > 0 ? '+' : ''}{v}
                </span>
              ))}
            </div>
          </motion.button>
        ))}
      </div>
    </Modal>
  );
}

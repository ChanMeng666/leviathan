import { motion } from 'framer-motion';
import { Modal } from '../ui/Modal';
import { useGameStore } from '../../stores';
import { getCardById } from '@leviathan/shared';
import type { EventChoice } from '@leviathan/shared';

const STAT_NAMES: Record<string, string> = {
  narrative_integrity: '叙事完整度',
  violence_authority: '暴力权威',
  supply_level: '给养储备',
  sanity: '理智度',
  cruelty: '残暴值',
  corruption: '腐败值',
  population: '人口',
};

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
    <Modal open={true} title={activeEvent.title} variant="danger">
      <div className="mb-4">
        <p className="text-sm text-fg leading-relaxed">
          {activeEventFlavor || activeEvent.base_text}
        </p>
      </div>

      <div className="space-y-2">
        {activeEvent.choices.map((choice, idx) => (
          <motion.button
            key={choice.id}
            className="w-full card-face border-2 border-red/30 hover:border-red p-3 text-left transition-colors rounded-[var(--radius-card)]"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: idx * 0.1 }}
            onClick={() => handleChoice(choice)}
          >
            <div className="text-sm text-red font-bold">{choice.label}</div>
            <div className="text-xs text-[#5A6A52] mt-0.5">{choice.description}</div>
            <div className="flex gap-2 mt-1.5 flex-wrap">
              {Object.entries(choice.effect).map(([k, v]) => (
                <span
                  key={k}
                  className={`pill-tag ${Number(v) > 0 ? 'bg-teal/15 text-teal' : 'bg-red/15 text-red'}`}
                >
                  {STAT_NAMES[k] ?? k}: {Number(v) > 0 ? '+' : ''}{v}
                </span>
              ))}
            </div>
          </motion.button>
        ))}
      </div>
    </Modal>
  );
}

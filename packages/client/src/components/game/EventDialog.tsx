import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Modal } from '../ui/Modal';
import { useGameStore } from '../../stores';
import { getCardById, EXTENDED_CARDS, STAT_LABELS } from '@leviathan/shared';
import type { EventChoice } from '@leviathan/shared';
import { useSfx } from '../../hooks/useAudio';

interface EventDialogProps {
  onResolve?: () => void;
}

export function EventDialog({ onResolve }: EventDialogProps) {
  const activeEvent = useGameStore((s) => s.activeEvent);
  const activeEventFlavor = useGameStore((s) => s.activeEventFlavor);
  const resolveEvent = useGameStore((s) => s.resolveEvent);
  const applyStatChanges = useGameStore((s) => s.applyStatChanges);
  const addTrait = useGameStore((s) => s.addTrait);
  const addHistoryEntry = useGameStore((s) => s.addHistoryEntry);
  const addCardToHand = useGameStore((s) => s.addCardToHand);
  const discoverCard = useGameStore((s) => s.discoverCard);
  const incrementAffinity = useGameStore((s) => s.incrementAffinity);
  const addInfluence = useGameStore((s) => s.addInfluence);
  const crisisState = useGameStore((s) => s.crisisState);
  const { play: sfx } = useSfx();
  const triggeredRef = useRef(false);

  useEffect(() => {
    if (activeEvent && !triggeredRef.current) { sfx('event-trigger'); triggeredRef.current = true; }
    if (!activeEvent) triggeredRef.current = false;
  }, [activeEvent, sfx]);

  if (!activeEvent) return null;

  const handleChoice = (choice: EventChoice) => {
    sfx('event-choice');
    applyStatChanges(choice.effect);
    if (choice.new_trait) addTrait(choice.new_trait);
    if (choice.new_card) {
      const card = getCardById(choice.new_card);
      if (card) {
        const isExtended = EXTENDED_CARDS.some((c) => c.id === choice.new_card);
        if (isExtended) discoverCard(choice.new_card);
        else addCardToHand(card);
      }
    }

    // Scoring reward from event choice
    if (choice.scoringReward?.influence) addInfluence(choice.scoringReward.influence);

    // Government affinities
    if (choice.effect.power && choice.effect.power > 5) incrementAffinity('warlord', 5);
    if (choice.effect.mythDensity && choice.effect.mythDensity > 5) incrementAffinity('theocracy', 5);
    if (choice.effect.tyranny && choice.effect.tyranny > 5) incrementAffinity('bureaucracy', 5);

    addHistoryEntry(`[纪元${crisisState.era}] 事件「${activeEvent.title}」: 选择了「${choice.label}」`);
    resolveEvent(activeEvent.id, choice.id, crisisState.era);
    sfx('event-resolve');
    onResolve?.();
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
                <span key={k} className={`pill-tag ${Number(v) > 0 ? 'bg-teal/15 text-teal' : 'bg-red/15 text-red'}`}>
                  {STAT_LABELS[k] ?? '其他'}: {Number(v) > 0 ? '+' : ''}{v}
                </span>
              ))}
              {choice.scoringReward?.influence && (
                <span className="pill-tag bg-gold/15 text-gold">+{choice.scoringReward.influence} 影响力</span>
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </Modal>
  );
}

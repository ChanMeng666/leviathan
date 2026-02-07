import { useState } from 'react';
import { motion } from 'framer-motion';
import { TypewriterText } from '../ui/TypewriterText';
import { BalatroBackground } from '../ui/BalatroBackground';
import { useGameStore } from '../../stores';
import { PROLOGUE_SCENARIO, getCardById, STAT_LABELS } from '@leviathan/shared';
import type { ScenarioChoice, GovernmentType, NationStatChanges } from '@leviathan/shared';
import { useSfx } from '../../hooks/useAudio';

const PATH_TO_GOVERNMENT: Record<string, GovernmentType> = {
  path_legitimacy: 'bureaucracy',
  path_ethnic: 'theocracy',
  path_cynical: 'warlord',
};

const PATH_TO_AFFINITY: Record<string, GovernmentType> = {
  path_legitimacy: 'bureaucracy',
  path_ethnic: 'theocracy',
  path_cynical: 'warlord',
};

export function PrologueScreen() {
  const [textDone, setTextDone] = useState(false);
  const [chosen, setChosen] = useState(false);

  const applyStatChanges = useGameStore((s) => s.applyStatChanges);
  const addTrait = useGameStore((s) => s.addTrait);
  const addHistoryEntry = useGameStore((s) => s.addHistoryEntry);
  const setGovernmentType = useGameStore((s) => s.setGovernmentType);
  const incrementAffinity = useGameStore((s) => s.incrementAffinity);
  const setPhase = useGameStore((s) => s.setPhase);
  const discoverCard = useGameStore((s) => s.discoverCard);
  const addNarrative = useGameStore((s) => s.addNarrative);

  const { play: sfx } = useSfx();
  const scenario = PROLOGUE_SCENARIO;

  const handleChoice = (choice: ScenarioChoice) => {
    if (chosen) return;
    sfx('event-choice');
    setChosen(true);

    // Apply stat effects
    applyStatChanges(choice.effect);

    // Set government type based on path
    const govType = PATH_TO_GOVERNMENT[choice.id];
    if (govType) {
      setGovernmentType(govType);
      incrementAffinity(PATH_TO_AFFINITY[choice.id], 30);
    }

    // Add trait
    if (choice.new_trait) {
      addTrait(choice.new_trait);
    }

    // Discover bonus cards
    if (choice.new_cards) {
      for (const cardId of choice.new_cards) {
        discoverCard(cardId);
      }
    }

    // Log the choice
    addHistoryEntry(`[第0天] 开国路径: ${choice.label}`);
    addNarrative({
      day: 0,
      title: scenario.title,
      text: `你选择了：${choice.label}。${choice.description}`,
      comment: `[开局] 初始路径确定，获得特质「${choice.new_trait}」`,
    });

    // Transition to day 1 after a brief delay
    setTimeout(() => {
      setPhase('draw');
    }, 1500);
  };

  return (
    <div className="h-screen flex items-center justify-center relative overflow-hidden">
      <BalatroBackground className="z-0" />

      <div className="relative z-10 max-w-2xl w-full px-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <div className="text-center mb-6">
            <div className="text-gold text-2xl font-bold mb-1" style={{ fontFamily: 'var(--font-display)' }}>
              {scenario.title}
            </div>
            <div className="text-dim text-xs">第 0 天 — 旧帝国崩溃日</div>
          </div>
        </motion.div>

        <motion.div
          className="panel p-6 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="text-fg text-sm leading-relaxed whitespace-pre-line">
            <TypewriterText
              text={scenario.text}
              speed={30}
              onComplete={() => setTextDone(true)}
            />
          </div>
        </motion.div>

        {textDone && !chosen && (
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {scenario.choices.map((choice, idx) => (
              <motion.button
                key={choice.id}
                className="w-full card-face border-2 border-accent/30 hover:border-accent p-4 text-left transition-colors rounded-[var(--radius-card)]"
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: idx * 0.15 }}
                onClick={() => handleChoice(choice)}
              >
                <div className="text-sm text-accent font-bold">{choice.label}</div>
                <div className="text-xs text-[#5A6A52] mt-1">{choice.description}</div>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {Object.entries(choice.effect).map(([k, v]) => (
                    <span
                      key={k}
                      className={`pill-tag ${Number(v) > 0 ? 'bg-teal/15 text-teal' : 'bg-red/15 text-red'}`}
                    >
                      {STAT_LABELS[k] ?? '其他'}: {Number(v) > 0 ? '+' : ''}{v}
                    </span>
                  ))}
                  {choice.new_trait && (
                    <span className="pill-tag bg-purple/15 text-purple">
                      +特质: {choice.new_trait}
                    </span>
                  )}
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}

        {chosen && (
          <motion.div
            className="text-center text-gold text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            命运的齿轮开始转动...
          </motion.div>
        )}
      </div>
    </div>
  );
}

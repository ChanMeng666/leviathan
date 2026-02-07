import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../stores';
import { CardSlot } from './CardSlot';
import { useAINarrative } from '../../hooks/useAINarrative';
import { findMatchingCombo } from '@leviathan/shared';

const INTENTS = [
  '编造建国神话',
  '发明民族英雄',
  '伪造历史文献',
  '建立法统宣称',
  '制造外部威胁',
  '神化领袖',
  '发动宣传攻势',
];

export function NarrativeLoom() {
  const selectedCards = useGameStore((s) => s.selectedCards);
  const deselectCard = useGameStore((s) => s.deselectCard);
  const phase = useGameStore((s) => s.phase);
  const isWeaving = useGameStore((s) => s.isWeaving);
  const [intent, setIntent] = useState(INTENTS[0]);

  const { weave } = useAINarrative();

  const cardIds = selectedCards.map((c) => c.id);
  const combo = selectedCards.length >= 2 ? findMatchingCombo(cardIds) : undefined;

  const canWeave = selectedCards.length >= 1 && phase === 'action' && !isWeaving;

  return (
    <div className="panel p-3">
      <div className="text-accent text-center text-sm mb-3 border-b border-border pb-1 font-bold">
        叙事纺织机
      </div>

      {/* Card slots */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {[0, 1, 2].map((i) => (
          <CardSlot
            key={i}
            index={i}
            card={selectedCards[i] ?? null}
            onRemove={deselectCard}
          />
        ))}
      </div>

      {/* Combo indicator */}
      {combo && (
        <motion.div
          className="text-gold text-center text-xs mb-2 bg-gold/10 border border-gold/30 rounded-[var(--radius-sm)] p-1.5 font-bold"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          合成配方匹配: {combo.name}
        </motion.div>
      )}

      {/* Intent selector */}
      <div className="mb-3">
        <div className="text-xs text-dim mb-1">叙事意图:</div>
        <select
          className="w-full bg-surface border border-border text-fg text-xs p-2 rounded-[var(--radius-sm)] focus:border-accent outline-none transition-colors"
          value={intent}
          onChange={(e) => setIntent(e.target.value)}
        >
          {INTENTS.map((i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </select>
      </div>

      {/* Weave button */}
      <button
        className={`w-full text-sm rounded-[var(--radius-sm)] p-2 transition-all ${
          canWeave
            ? 'btn-primary'
            : 'bg-surface text-dim cursor-not-allowed border border-border'
        }`}
        disabled={!canWeave}
        onClick={() => weave(intent)}
      >
        {isWeaving ? '纺织中...' : '启动纺织机'}
      </button>

      {selectedCards.length === 0 && phase === 'action' && (
        <div className="text-dim text-xs text-center mt-2">
          从左侧背包选择1-3张卡牌投入纺织机
        </div>
      )}
    </div>
  );
}

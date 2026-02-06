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
    <div className="border border-terminal-green p-3">
      <div className="text-terminal-green glow-green text-center text-sm mb-3 border-b border-terminal-green pb-1">
        {'>>>'} 叙事纺织机 {'<<<'}
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
          className="text-terminal-yellow glow-yellow text-center text-xs mb-2 border border-terminal-yellow p-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {'!!!'} 合成配方匹配: {combo.name} {'!!!'}
        </motion.div>
      )}

      {/* Intent selector */}
      <div className="mb-3">
        <div className="text-xs text-terminal-dim mb-1">叙事意图:</div>
        <select
          className="w-full bg-terminal-bg border border-terminal-dim text-terminal-fg text-xs p-1 focus:border-terminal-green outline-none"
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
        className={`w-full border p-2 text-sm transition-colors ${
          canWeave
            ? 'border-terminal-green text-terminal-green hover:bg-terminal-green/10 glow-green'
            : 'border-terminal-dim text-terminal-dim cursor-not-allowed'
        }`}
        disabled={!canWeave}
        onClick={() => weave(intent)}
      >
        {isWeaving ? '>>> 纺织中... <<<' : '[ 启动纺织机 ]'}
      </button>

      {selectedCards.length === 0 && phase === 'action' && (
        <div className="text-terminal-dim text-xs text-center mt-2">
          从左侧背包选择1-3张卡牌投入纺织机
        </div>
      )}
    </div>
  );
}

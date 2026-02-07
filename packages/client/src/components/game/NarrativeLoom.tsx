import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../stores';
import { CardSlot } from './CardSlot';
import { useAINarrative } from '../../hooks/useAINarrative';
import { findMatchingCombo, INTENTS } from '@leviathan/shared';
import { useSfx } from '../../hooks/useAudio';

export function NarrativeLoom() {
  const selectedCards = useGameStore((s) => s.selectedCards);
  const deselectCard = useGameStore((s) => s.deselectCard);
  const phase = useGameStore((s) => s.phase);
  const isWeaving = useGameStore((s) => s.isWeaving);
  const crisisState = useGameStore((s) => s.crisisState);
  const getIntentLevel = useGameStore((s) => s.getIntentLevel);
  const useDiscard = useGameStore((s) => s.useDiscard);
  const discardCards = useGameStore((s) => s.discardCards);
  const drawCards = useGameStore((s) => s.drawCards);

  const [intentId, setIntentId] = useState(INTENTS[0].id);
  const { weave } = useAINarrative();
  const { play: sfx } = useSfx();
  const prevComboRef = useRef<string | undefined>(undefined);

  const cardIds = selectedCards.map((c) => c.id);
  const combo = selectedCards.length >= 2 ? findMatchingCombo(cardIds) : undefined;
  const selectedIntent = INTENTS.find((i) => i.id === intentId) ?? INTENTS[0];
  const level = getIntentLevel(intentId);

  useEffect(() => {
    if (combo && combo.name !== prevComboRef.current) sfx('combo-detect');
    prevComboRef.current = combo?.name;
  }, [combo, sfx]);

  const canWeave = selectedCards.length >= selectedIntent.minCards && phase === 'weave' && !isWeaving && crisisState.weavesRemaining > 0;
  const canDiscard = selectedCards.length > 0 && phase === 'weave' && crisisState.discardsRemaining > 0;

  const handleDiscard = () => {
    if (!canDiscard) return;
    sfx('card-deselect');
    const ids = selectedCards.map((c) => c.id);
    useDiscard();
    discardCards(ids);
    drawCards(ids.length);
  };

  return (
    <div className="panel p-3">
      <div className="text-accent text-center text-sm mb-3 border-b border-border pb-1 font-bold">
        叙事纺织机
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        {[0, 1, 2].map((i) => (
          <CardSlot key={i} index={i} card={selectedCards[i] ?? null} onRemove={deselectCard} />
        ))}
      </div>

      {combo && (
        <motion.div
          className="text-gold text-center text-xs mb-2 bg-gold/10 border border-gold/30 rounded-[var(--radius-sm)] p-1.5 font-bold"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          合成配方匹配: {combo.name}
        </motion.div>
      )}

      <div className="mb-3">
        <div className="text-xs text-dim mb-1">叙事意图:</div>
        <select
          className="w-full bg-surface border border-border text-fg text-xs p-2 rounded-[var(--radius-sm)] focus:border-accent outline-none transition-colors"
          value={intentId}
          onChange={(e) => setIntentId(e.target.value)}
        >
          {INTENTS.map((i) => {
            const lvl = getIntentLevel(i.id);
            return (
              <option key={i.id} value={i.id}>
                {i.name} Lv.{lvl} (NF:{i.base_nf + (lvl - 1) * 10} PL:{i.base_pl + (lvl - 1) * 0.5}) {i.minCards > 1 ? `[${i.minCards}牌]` : ''}
              </option>
            );
          })}
        </select>
      </div>

      {selectedCards.length < selectedIntent.minCards && selectedCards.length > 0 && (
        <div className="text-red text-xs text-center mb-2">
          此意图至少需要 {selectedIntent.minCards} 张牌
        </div>
      )}

      <div className="flex gap-2">
        <button
          className={`flex-1 text-sm rounded-[var(--radius-sm)] p-2 transition-all ${canWeave ? 'btn-primary' : 'bg-surface text-dim cursor-not-allowed border border-border'}`}
          disabled={!canWeave}
          onClick={() => { sfx('weave-start'); weave(intentId); }}
        >
          {isWeaving ? '纺织中...' : `纺织 (${crisisState.weavesRemaining})`}
        </button>
        <button
          className={`text-sm rounded-[var(--radius-sm)] p-2 px-3 transition-all ${canDiscard ? 'btn-secondary' : 'bg-surface text-dim cursor-not-allowed border border-border'}`}
          disabled={!canDiscard}
          onClick={handleDiscard}
        >
          弃牌 ({crisisState.discardsRemaining})
        </button>
      </div>

      {selectedCards.length === 0 && phase === 'weave' && (
        <div className="text-dim text-xs text-center mt-2">
          从左侧背包选择1-3张卡牌投入纺织机
        </div>
      )}
    </div>
  );
}

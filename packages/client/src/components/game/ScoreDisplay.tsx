import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ScoringBreakdown } from '@leviathan/shared';
import { useGameStore } from '../../stores';
import { audioManager } from '../../lib/audioManager';

const STEP_DELAY = 400; // ms between each step reveal
const HOLD_TIME = 1800; // ms to hold final score before dismissing

export function ScoreDisplay() {
  const breakdown = useGameStore((s) => s.pendingScoreAnimation);
  const clear = useGameStore((s) => s.setPendingScoreAnimation);

  const [visibleSteps, setVisibleSteps] = useState(0);
  const [showFinal, setShowFinal] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (!breakdown) {
      setVisibleSteps(0);
      setShowFinal(false);
      setDismissed(false);
      return;
    }

    // Reveal steps one by one
    let step = 0;
    const totalSteps = breakdown.steps.length;

    const revealNext = () => {
      step++;
      setVisibleSteps(step);
      audioManager.playSfx('stat-up');

      if (step < totalSteps) {
        timerRef.current = setTimeout(revealNext, STEP_DELAY);
      } else {
        // All steps revealed — show final score
        timerRef.current = setTimeout(() => {
          setShowFinal(true);
          audioManager.playSfx('combo-acquire');

          // Auto-dismiss after hold
          timerRef.current = setTimeout(() => {
            setDismissed(true);
            setTimeout(() => clear(null), 300);
          }, HOLD_TIME);
        }, STEP_DELAY);
      }
    };

    timerRef.current = setTimeout(revealNext, 200);

    return () => clearTimeout(timerRef.current);
  }, [breakdown]);

  const handleDismiss = () => {
    clearTimeout(timerRef.current);
    setDismissed(true);
    setTimeout(() => clear(null), 200);
  };

  if (!breakdown) return null;

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={handleDismiss}
        >
          <motion.div
            className="relative w-[380px] max-h-[70vh] overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* NF × PL header */}
            <div className="flex justify-center gap-8 mb-3">
              <div className="text-center">
                <div className="text-[10px] text-dim uppercase tracking-wider mb-0.5">叙事力 NF</div>
                <motion.div
                  className="text-2xl font-mono font-bold text-blue"
                  key={`nf-${visibleSteps}`}
                  initial={{ scale: 1.3 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  {visibleSteps > 0
                    ? Math.round(breakdown.steps[Math.min(visibleSteps - 1, breakdown.steps.length - 1)].nfAfter)
                    : 0}
                </motion.div>
              </div>
              <div className="text-dim text-2xl font-mono self-end mb-0.5">×</div>
              <div className="text-center">
                <div className="text-[10px] text-dim uppercase tracking-wider mb-0.5">政治杠杆 PL</div>
                <motion.div
                  className="text-2xl font-mono font-bold text-red"
                  key={`pl-${visibleSteps}`}
                  initial={{ scale: 1.3 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  {visibleSteps > 0
                    ? (breakdown.steps[Math.min(visibleSteps - 1, breakdown.steps.length - 1)].plAfter).toFixed(1)
                    : '0.0'}
                </motion.div>
              </div>
            </div>

            {/* Steps cascade */}
            <div className="space-y-0.5 max-h-[40vh] overflow-y-auto px-1 mb-3">
              {breakdown.steps.slice(0, visibleSteps).map((step, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-2 text-xs py-1 px-2 rounded bg-surface/60"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                  <span className="text-fg/80 flex-1 truncate">{step.label}</span>
                  {step.nfDelta !== 0 && (
                    <span className={`font-mono font-bold ${step.nfDelta > 0 ? 'text-blue' : 'text-red'}`}>
                      {step.nfDelta > 0 ? '+' : ''}{Math.round(step.nfDelta)}
                    </span>
                  )}
                  {step.plDelta !== 0 && (
                    <span className={`font-mono font-bold ${step.plDelta > 0 ? 'text-red' : 'text-blue'}`}>
                      {step.plDelta > 0 ? '+' : ''}{step.plDelta.toFixed(1)}
                    </span>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Final score */}
            <AnimatePresence>
              {showFinal && (
                <motion.div
                  className="text-center"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                >
                  <div className="text-[10px] text-dim mb-1">宣传力</div>
                  <div className="text-4xl font-mono font-bold text-gold drop-shadow-[0_0_8px_rgba(212,168,67,0.4)]">
                    {breakdown.finalScore.toLocaleString()}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

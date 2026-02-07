import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ReactNode } from 'react';
import { useSfx } from '../../hooks/useAudio';

interface ModalProps {
  open: boolean;
  onClose?: () => void;
  title?: string;
  variant?: 'default' | 'danger' | 'success';
  children: ReactNode;
}

export function Modal({ open, onClose, title, variant = 'default', children }: ModalProps) {
  const { play: sfx } = useSfx();
  const wasOpen = useRef(open);

  useEffect(() => {
    if (open && !wasOpen.current) sfx('modal-open');
    if (!open && wasOpen.current) sfx('modal-close');
    wasOpen.current = open;
  }, [open, sfx]);
  const titleColor = variant === 'danger' ? 'text-red' : 'text-accent';
  const panelBg = variant === 'danger' ? 'bg-danger-bg' : 'bg-surface-raised';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-bg/85 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={`relative max-w-xl w-full mx-4 ${panelBg} border border-border-strong rounded-[var(--radius-lg)] p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4),0_2px_8px_rgba(0,0,0,0.3)]`}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {title && (
              <div className="mb-4 border-b border-border pb-2">
                <h2 className={`text-lg font-bold ${titleColor}`}>
                  {title}
                </h2>
              </div>
            )}
            {children}
            {onClose && (
              <button
                className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-surface hover:bg-border text-dim hover:text-fg transition-colors"
                onClick={onClose}
              >
                ✕
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

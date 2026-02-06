import { motion, AnimatePresence } from 'framer-motion';
import type { ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onClose?: () => void;
  title?: string;
  variant?: 'default' | 'danger' | 'success';
  children: ReactNode;
}

const borderColors = {
  default: 'border-terminal-dim',
  danger: 'border-terminal-red pulse-danger',
  success: 'border-terminal-green',
};

export function Modal({ open, onClose, title, variant = 'default', children }: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={`relative max-w-xl w-full mx-4 bg-terminal-bg border-2 ${borderColors[variant]} p-6`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {title && (
              <div className="mb-4 border-b border-terminal-dim pb-2">
                <h2 className={`text-lg font-bold ${variant === 'danger' ? 'text-terminal-red glow-red' : 'text-terminal-green glow-green'}`}>
                  {'> '}{title}
                </h2>
              </div>
            )}
            {children}
            {onClose && (
              <button
                className="absolute top-2 right-3 text-terminal-dim hover:text-terminal-fg"
                onClick={onClose}
              >
                [X]
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

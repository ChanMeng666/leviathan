import { useEffect } from 'react';
import { useGameStore } from '../stores';

/** Auto-save is handled by Zustand persist middleware. This hook is a no-op placeholder. */
export function useAutoSave() {
  useEffect(() => {
    // Zustand persist handles saving to localStorage automatically.
    // This hook exists for future save-indicator UI.
  }, []);
}

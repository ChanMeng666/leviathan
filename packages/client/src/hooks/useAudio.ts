import { useEffect, useCallback, useRef } from 'react';
import { useGameStore } from '../stores';
import { audioManager, type SfxName, type BgmTrack } from '../lib/audioManager';

/**
 * Monitors game phase/screen and auto-switches BGM.
 * Mount once in App or GameScreen.
 */
export function useBackgroundMusic() {
  const screen = useGameStore((s) => s.screen);
  const phase = useGameStore((s) => s.phase);
  const bgmVolume = useGameStore((s) => s.bgmVolume);
  const sfxVolume = useGameStore((s) => s.sfxVolume);
  const isMuted = useGameStore((s) => s.isMuted);
  const hasInteracted = useRef(false);

  // Sync volume/mute to audio manager
  useEffect(() => { audioManager.setBgmVolume(bgmVolume); }, [bgmVolume]);
  useEffect(() => { audioManager.setSfxVolume(sfxVolume); }, [sfxVolume]);
  useEffect(() => { audioManager.setMuted(isMuted); }, [isMuted]);

  // Unlock audio on first interaction
  useEffect(() => {
    const unlock = () => {
      if (!hasInteracted.current) {
        hasInteracted.current = true;
        audioManager.preloadBgm();
        // Determine correct track to play now
        const state = useGameStore.getState();
        const track = resolveTrack(state.screen, state.phase);
        if (track) audioManager.playBgm(track);
      }
    };
    document.addEventListener('click', unlock, { once: true });
    document.addEventListener('touchend', unlock, { once: true });
    return () => {
      document.removeEventListener('click', unlock);
      document.removeEventListener('touchend', unlock);
    };
  }, []);

  // Switch BGM based on screen/phase
  useEffect(() => {
    if (!hasInteracted.current) return;
    const track = resolveTrack(screen, phase);
    if (track) {
      audioManager.playBgm(track);
    }
  }, [screen, phase]);
}

function resolveTrack(screen: string, phase: string): BgmTrack | null {
  if (screen === 'welcome') return 'menu';
  if (phase === 'prologue') return 'prologue';
  if (phase === 'event') return 'event';
  if (phase === 'gameover') return 'gameover';
  if (['draw', 'action', 'settle'].includes(phase)) return 'gameplay';
  return null;
}

/**
 * Returns a play function for sound effects.
 */
export function useSfx() {
  const play = useCallback((name: SfxName) => {
    audioManager.playSfx(name);
  }, []);

  return { play };
}

/**
 * Audio settings state and controls for UI.
 */
export function useAudioSettings() {
  const bgmVolume = useGameStore((s) => s.bgmVolume);
  const sfxVolume = useGameStore((s) => s.sfxVolume);
  const isMuted = useGameStore((s) => s.isMuted);
  const setBgmVolume = useGameStore((s) => s.setBgmVolume);
  const setSfxVolume = useGameStore((s) => s.setSfxVolume);
  const toggleMute = useGameStore((s) => s.toggleMute);

  return { bgmVolume, sfxVolume, isMuted, setBgmVolume, setSfxVolume, toggleMute };
}

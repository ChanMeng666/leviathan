import { useEffect, useCallback } from 'react';
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

  // Sync volume/mute to audio manager
  useEffect(() => { audioManager.setBgmVolume(bgmVolume); }, [bgmVolume]);
  useEffect(() => { audioManager.setSfxVolume(sfxVolume); }, [sfxVolume]);
  useEffect(() => { audioManager.setMuted(isMuted); }, [isMuted]);

  // Always request the correct BGM track on screen/phase change.
  // If AudioContext is suspended, audioManager stores the desired track
  // and ensurePlaying() will start it on the next user gesture.
  useEffect(() => {
    const track = resolveTrack(screen, phase);
    if (track) {
      audioManager.playBgm(track);
    }
  }, [screen, phase]);

  // Persistent click/touch listener to resume AudioContext and ensure BGM is playing.
  // Unlike { once: true }, this fires on every user gesture until audio is confirmed running.
  useEffect(() => {
    const handler = () => {
      audioManager.ensurePlaying();
    };
    document.addEventListener('click', handler, true);
    document.addEventListener('touchend', handler, true);
    return () => {
      document.removeEventListener('click', handler, true);
      document.removeEventListener('touchend', handler, true);
    };
  }, []);
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

import type { StateCreator } from 'zustand';

const AUDIO_PREFS_KEY = 'leviathan-audio-prefs';

interface AudioPrefs {
  bgmVolume: number;
  sfxVolume: number;
  isMuted: boolean;
}

function loadPrefs(): AudioPrefs {
  try {
    const raw = localStorage.getItem(AUDIO_PREFS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { bgmVolume: 0.5, sfxVolume: 0.7, isMuted: false };
}

function savePrefs(prefs: AudioPrefs) {
  try {
    localStorage.setItem(AUDIO_PREFS_KEY, JSON.stringify(prefs));
  } catch { /* ignore */ }
}

export interface AudioSlice {
  bgmVolume: number;
  sfxVolume: number;
  isMuted: boolean;

  setBgmVolume: (v: number) => void;
  setSfxVolume: (v: number) => void;
  toggleMute: () => void;
}

export const createAudioSlice: StateCreator<AudioSlice, [], [], AudioSlice> = (set, get) => {
  const prefs = loadPrefs();

  return {
    bgmVolume: prefs.bgmVolume,
    sfxVolume: prefs.sfxVolume,
    isMuted: prefs.isMuted,

    setBgmVolume: (v) => {
      set({ bgmVolume: v });
      savePrefs({ bgmVolume: v, sfxVolume: get().sfxVolume, isMuted: get().isMuted });
    },

    setSfxVolume: (v) => {
      set({ sfxVolume: v });
      savePrefs({ bgmVolume: get().bgmVolume, sfxVolume: v, isMuted: get().isMuted });
    },

    toggleMute: () => {
      const next = !get().isMuted;
      set({ isMuted: next });
      savePrefs({ bgmVolume: get().bgmVolume, sfxVolume: get().sfxVolume, isMuted: next });
    },
  };
};

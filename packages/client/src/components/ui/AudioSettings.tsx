import { useState, useRef, useEffect } from 'react';
import { useAudioSettings } from '../../hooks/useAudio';

export function AudioSettingsButton() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const { isMuted, toggleMute } = useAudioSettings();

  return (
    <div className="relative" ref={ref}>
      <button
        className="btn-secondary text-xs px-2 py-1"
        onClick={() => setOpen((v) => !v)}
        title="音量设置"
      >
        {isMuted ? '🔇' : '🔊'}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-56 panel-raised p-3 z-50 shadow-lg border border-border-strong rounded-[var(--radius-lg)]">
          <AudioSettingsPanel />
        </div>
      )}
    </div>
  );
}

function AudioSettingsPanel() {
  const { bgmVolume, sfxVolume, isMuted, setBgmVolume, setSfxVolume, toggleMute } = useAudioSettings();

  return (
    <div className="space-y-3">
      <div>
        <div className="flex justify-between text-xs text-dim mb-1">
          <span>背景音乐</span>
          <span className="font-mono">{Math.round(bgmVolume * 100)}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={bgmVolume}
          onChange={(e) => setBgmVolume(Number(e.target.value))}
          className="audio-slider w-full"
        />
      </div>

      <div>
        <div className="flex justify-between text-xs text-dim mb-1">
          <span>音效</span>
          <span className="font-mono">{Math.round(sfxVolume * 100)}%</span>
        </div>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={sfxVolume}
          onChange={(e) => setSfxVolume(Number(e.target.value))}
          className="audio-slider w-full"
        />
      </div>

      <button
        className={`w-full text-xs py-1.5 rounded-[var(--radius-sm)] transition-colors ${
          isMuted
            ? 'bg-red/15 text-red border border-red/30'
            : 'bg-surface text-dim border border-border hover:text-fg'
        }`}
        onClick={toggleMute}
      >
        {isMuted ? '🔇 已静音 — 点击恢复' : '🔊 静音'}
      </button>
    </div>
  );
}

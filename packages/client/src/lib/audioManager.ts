import { Howl, Howler } from 'howler';

export type BgmTrack = 'menu' | 'prologue' | 'gameplay' | 'event' | 'gameover';

export type SfxName =
  | 'btn-hover' | 'btn-click'
  | 'modal-open' | 'modal-close' | 'dropdown'
  | 'card-draw' | 'card-select' | 'card-deselect' | 'card-slot'
  | 'weave-start' | 'weave-loop' | 'weave-success' | 'weave-fail'
  | 'combo-detect' | 'combo-acquire'
  | 'stat-up' | 'stat-down' | 'danger-pulse'
  | 'event-trigger' | 'event-choice' | 'event-resolve'
  | 'day-advance' | 'phase-change'
  | 'wheel-spin' | 'sacrifice'
  | 'discovery' | 'gov-transition'
  | 'death-riot' | 'death-starve' | 'death-madness' | 'death-insanity'
  | 'typewriter';

const BGM_FADE_MS = 800;

class AudioManager {
  private bgmTracks = new Map<string, Howl>();
  private sfxSounds = new Map<string, Howl>();
  private currentBgm: string | null = null;
  private currentBgmId: number | null = null;
  private _bgmVolume = 0.5;
  private _sfxVolume = 0.7;
  private _muted = false;
  private _desiredTrack: BgmTrack | null = null;

  private getOrCreateBgm(track: BgmTrack): Howl {
    let howl = this.bgmTracks.get(track);
    if (!howl) {
      howl = new Howl({
        src: [`/audio/bgm/${track}.mp3`],
        loop: true,
        volume: 0,
        preload: true,
      });
      this.bgmTracks.set(track, howl);
    }
    return howl;
  }

  private getOrCreateSfx(name: SfxName): Howl {
    let howl = this.sfxSounds.get(name);
    if (!howl) {
      howl = new Howl({
        src: [`/audio/sfx/${name}.mp3`],
        volume: this._muted ? 0 : this._sfxVolume,
        preload: false,
      });
      this.sfxSounds.set(name, howl);
    }
    return howl;
  }

  /**
   * Resume AudioContext if suspended. Should be called from user gesture handlers.
   */
  resumeContext(): boolean {
    const ctx = Howler.ctx;
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
      return false; // was suspended
    }
    return !ctx || ctx.state === 'running'; // true if running
  }

  playBgm(track: BgmTrack) {
    this._desiredTrack = track;
    if (this.currentBgm === track) return;

    const targetVolume = this._muted ? 0 : this._bgmVolume;

    // Fade out current
    if (this.currentBgm) {
      const oldHowl = this.bgmTracks.get(this.currentBgm);
      if (oldHowl) {
        if (this.currentBgmId != null) {
          const id = this.currentBgmId;
          const currentVol = (oldHowl.volume() as unknown as number) || 0;
          oldHowl.fade(currentVol, 0, BGM_FADE_MS, id);
          setTimeout(() => oldHowl.stop(), BGM_FADE_MS); // stop ALL instances (kills orphans)
        } else {
          oldHowl.stop(); // no tracked instance — kill any queued/orphaned plays immediately
        }
      }
    }

    // Set track as current immediately to prevent race conditions
    this.currentBgm = track;
    this.currentBgmId = null;

    const newHowl = this.getOrCreateBgm(track);

    const startPlay = () => {
      // Guard: track may have changed while loading
      if (this.currentBgm !== track) return;
      const newId = newHowl.play();
      newHowl.volume(0, newId);
      newHowl.fade(0, targetVolume, BGM_FADE_MS, newId);
      this.currentBgmId = newId;
    };

    if (newHowl.state() === 'loaded') {
      startPlay();
    } else {
      newHowl.once('load', startPlay);
    }
  }

  /**
   * Called from user gesture (click/touch) to recover BGM playback.
   * If AudioContext was suspended or BGM isn't actually playing, restart it.
   */
  ensurePlaying() {
    this.resumeContext();

    if (!this._desiredTrack) return;

    // If we have a desired track but no active sound ID, playBgm was called
    // but play() couldn't start (context was suspended). Retry now.
    if (this.currentBgmId == null) {
      const track = this._desiredTrack;
      // Stop any orphaned instances before retrying
      if (this.currentBgm) {
        this.bgmTracks.get(this.currentBgm)?.stop();
      }
      this.currentBgm = null; // reset so playBgm doesn't early-return
      this.playBgm(track);
      return;
    }

    // If we have an active ID but it's not playing, restart
    if (this.currentBgm) {
      const howl = this.bgmTracks.get(this.currentBgm);
      if (howl && !howl.playing(this.currentBgmId)) {
        howl.stop(); // stop ALL instances including orphans
        const track = this.currentBgm as BgmTrack;
        this.currentBgm = null;
        this.playBgm(track);
      }
    }
  }

  stopBgm() {
    if (this.currentBgm) {
      const howl = this.bgmTracks.get(this.currentBgm);
      if (howl && this.currentBgmId != null) {
        const id = this.currentBgmId;
        const currentVol = (howl.volume() as unknown as number) || 0;
        howl.fade(currentVol, 0, BGM_FADE_MS, id);
        setTimeout(() => howl.stop(), BGM_FADE_MS);
      }
      this.currentBgm = null;
      this.currentBgmId = null;
      this._desiredTrack = null;
    }
  }

  playSfx(name: SfxName) {
    if (this._muted) return;
    // Don't queue SFX when AudioContext is suspended — they would burst-play on unlock
    const ctx = Howler.ctx;
    if (ctx && ctx.state === 'suspended') return;
    const howl = this.getOrCreateSfx(name);
    howl.volume(this._sfxVolume);
    howl.play();
  }

  preloadEssentialSfx() {
    const essentials: SfxName[] = ['btn-click', 'typewriter', 'card-select', 'card-deselect'];
    for (const name of essentials) {
      const howl = this.getOrCreateSfx(name);
      if (howl.state() === 'unloaded') howl.load();
    }
  }

  setBgmVolume(v: number) {
    this._bgmVolume = v;
    if (this.currentBgm && this.currentBgmId != null) {
      const howl = this.bgmTracks.get(this.currentBgm);
      howl?.volume(this._muted ? 0 : v, this.currentBgmId);
    }
  }

  setSfxVolume(v: number) {
    this._sfxVolume = v;
  }

  setMuted(muted: boolean) {
    this._muted = muted;
    Howler.mute(muted);
    if (this.currentBgm && this.currentBgmId != null) {
      const howl = this.bgmTracks.get(this.currentBgm);
      howl?.volume(muted ? 0 : this._bgmVolume, this.currentBgmId);
    }
  }

  dispose() {
    for (const howl of this.bgmTracks.values()) howl.unload();
    for (const howl of this.sfxSounds.values()) howl.unload();
    this.bgmTracks.clear();
    this.sfxSounds.clear();
    this.currentBgm = null;
    this.currentBgmId = null;
    this._desiredTrack = null;
  }
}

export const audioManager = new AudioManager();

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

  private getOrCreateBgm(track: BgmTrack): Howl {
    let howl = this.bgmTracks.get(track);
    if (!howl) {
      howl = new Howl({
        src: [`/audio/bgm/${track}.mp3`],
        loop: true,
        volume: 0,
        preload: true,
        html5: true,
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

  playBgm(track: BgmTrack) {
    if (this.currentBgm === track) return;

    const targetVolume = this._muted ? 0 : this._bgmVolume;

    // Fade out current
    if (this.currentBgm) {
      const oldHowl = this.bgmTracks.get(this.currentBgm);
      if (oldHowl && this.currentBgmId != null) {
        const id = this.currentBgmId;
        const currentVol = (oldHowl.volume() as unknown as number) || 0;
        oldHowl.fade(currentVol, 0, BGM_FADE_MS, id);
        setTimeout(() => oldHowl.stop(id), BGM_FADE_MS);
      }
    }

    // Fade in new
    const newHowl = this.getOrCreateBgm(track);
    const newId = newHowl.play();
    newHowl.volume(0, newId);
    newHowl.fade(0, targetVolume, BGM_FADE_MS, newId);

    this.currentBgm = track;
    this.currentBgmId = newId;
  }

  stopBgm() {
    if (this.currentBgm) {
      const howl = this.bgmTracks.get(this.currentBgm);
      if (howl && this.currentBgmId != null) {
        const id = this.currentBgmId;
        const currentVol = (howl.volume() as unknown as number) || 0;
        howl.fade(currentVol, 0, BGM_FADE_MS, id);
        setTimeout(() => howl.stop(id), BGM_FADE_MS);
      }
      this.currentBgm = null;
      this.currentBgmId = null;
    }
  }

  playSfx(name: SfxName) {
    if (this._muted) return;
    const howl = this.getOrCreateSfx(name);
    howl.volume(this._sfxVolume);
    howl.play();
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
    // Also update current BGM volume directly for immediate effect
    if (this.currentBgm && this.currentBgmId != null) {
      const howl = this.bgmTracks.get(this.currentBgm);
      howl?.volume(muted ? 0 : this._bgmVolume, this.currentBgmId);
    }
  }

  preloadBgm() {
    const tracks: BgmTrack[] = ['menu', 'prologue', 'gameplay', 'event', 'gameover'];
    for (const t of tracks) {
      this.getOrCreateBgm(t);
    }
  }

  dispose() {
    for (const howl of this.bgmTracks.values()) howl.unload();
    for (const howl of this.sfxSounds.values()) howl.unload();
    this.bgmTracks.clear();
    this.sfxSounds.clear();
    this.currentBgm = null;
    this.currentBgmId = null;
  }
}

export const audioManager = new AudioManager();

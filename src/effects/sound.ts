import type { Scene } from './animation';

/** Original synthesized ambience; no network audio, microphone or sound assets.
 * The context is created only by the explicit sound-button gesture. */
export class WinterSound {
  private context?: AudioContext;
  private master?: GainNode;
  private wind?: GainNode;
  private fire?: GainNode;
  private grainNoise?: AudioBuffer;
  private timer?: ReturnType<typeof setInterval>;
  private enabled = false;
  private scene: Scene = 'outside';
  constructor(private button: HTMLButtonElement) {
    button.onclick = () => {
      void this.toggle();
    };
    this.paint();
    document.addEventListener('visibilitychange', () => {
      if (!this.context) return;
      if (document.hidden) {
        this.stopCrackle();
        void this.context.suspend();
      } else if (this.enabled)
        void this.context
          .resume()
          .then(() => this.crackleLoop())
          .catch(() => this.disable());
    });
  }
  private paint() {
    this.button.setAttribute('aria-pressed', String(this.enabled));
    this.button.setAttribute(
      'aria-label',
      this.enabled ? 'Mute winter sounds' : 'Enable winter sounds',
    );
    this.button.dataset.sound = this.enabled ? 'on' : 'off';
  }
  private setup() {
    const context = new AudioContext();
    this.context = context;
    this.master = context.createGain();
    this.master.gain.value = 0;
    this.master.connect(context.destination);
    const buffer = context.createBuffer(1, context.sampleRate * 4, context.sampleRate),
      data = buffer.getChannelData(0);
    let brown = 0;
    for (let i = 0; i < data.length; i++) {
      brown = (brown + (Math.random() * 2 - 1) * 0.035) / 1.025;
      data[i] = brown * 3.2;
    }
    // Match loop endpoints to avoid a click each time the wind buffer repeats.
    const seam = data[data.length - 1] - data[0];
    for (let i = 0; i < data.length; i++) data[i] -= (seam * i) / (data.length - 1);
    this.grainNoise = context.createBuffer(1, context.sampleRate, context.sampleRate);
    const grains = this.grainNoise.getChannelData(0);
    for (let i = 0; i < grains.length; i++) grains[i] = Math.random() * 2 - 1;
    const loop = (frequency: number, type: BiquadFilterType) => {
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      const filter = context.createBiquadFilter();
      filter.type = type;
      filter.frequency.value = frequency;
      filter.Q.value = 0.55;
      const gain = context.createGain();
      gain.gain.value = 0;
      source.connect(filter).connect(gain).connect(this.master!);
      source.start();
      return gain;
    };
    this.wind = loop(600, 'lowpass');
    this.fire = loop(1100, 'lowpass');
    context.onstatechange = () => {
      this.button.dataset.audioState = context.state;
    };
  }
  private async toggle() {
    if (this.enabled) {
      this.disable();
      return;
    }
    try {
      if (!this.context) this.setup();
      this.enabled = true;
      this.paint();
      await this.context!.resume();
      if (!this.enabled) return;
      this.master!.gain.setTargetAtTime(0.42, this.context!.currentTime, 0.15);
      this.setScene(this.scene);
      this.crackleLoop();
    } catch {
      this.disable();
    }
  }
  private disable() {
    this.enabled = false;
    this.paint();
    this.stopCrackle();
    if (this.context) {
      this.master!.gain.cancelScheduledValues(this.context.currentTime);
      this.master!.gain.setValueAtTime(0, this.context.currentTime);
      void this.context.suspend();
    }
  }
  /** Crossfade local buses; changing rooms never creates another audio context. */
  setScene(scene: Scene) {
    this.scene = scene;
    this.button.dataset.audioScene = scene;
    if (!this.context) return;
    const t = this.context.currentTime;
    this.wind!.gain.setTargetAtTime(scene === 'outside' ? 0.2 : 0.008, t, 0.65);
    this.fire!.gain.setTargetAtTime(scene === 'inside' ? 0.16 : 0, t, 0.65);
  }
  private stopCrackle() {
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
  }
  private crackleLoop() {
    this.stopCrackle();
    this.timer = setInterval(() => {
      if (
        this.enabled &&
        this.scene === 'inside' &&
        this.context?.state === 'running' &&
        Math.random() < 0.6
      )
        this.grain(0.015 + Math.random() * 0.02, 0.015 + Math.random() * 0.025, 1800);
    }, 550);
  }
  private grain(duration: number, volume: number, frequency: number) {
    if (!this.enabled || this.context?.state !== 'running' || !this.grainNoise) return;
    const context = this.context,
      t = context.currentTime,
      source = context.createBufferSource();
    source.buffer = this.grainNoise;
    const filter = context.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = frequency;
    const gain = context.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(volume, t + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.00001, t + duration);
    source.connect(filter).connect(gain).connect(this.master!);
    source.start(t, Math.random() * 0.4, duration);
    source.onended = () => {
      source.disconnect();
      filter.disconnect();
      gain.disconnect();
    };
  }
  snowTouch() {
    if (this.scene === 'outside') this.grain(0.24, 0.16, 420);
  }
}

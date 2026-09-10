class AudioEngine {
  ctx: AudioContext | null = null;
  engine: OscillatorNode | null = null;
  gain: GainNode | null = null;
  musicGain: GainNode | null = null;
  init() {
    if (this.ctx) {
      void this.ctx.resume().catch(() => {});
      return;
    }
    try {
      this.ctx = new AudioContext();
      this.engine = this.ctx.createOscillator();
      this.gain = this.ctx.createGain();
      this.engine.type = "sawtooth";
      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 450;
      this.gain.gain.value = 0;
      this.engine
        .connect(filter)
        .connect(this.gain)
        .connect(this.ctx.destination);
      this.engine.start();
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0;
      this.musicGain.connect(this.ctx.destination);
      [110, 164.81, 220, 277.18].forEach((f) => {
        const o = this.ctx!.createOscillator();
        o.type = "sine";
        o.frequency.value = f;
        o.connect(this.musicGain!);
        o.start();
      });
    } catch {
      /* Audio is optional when browser policy blocks it. */
    }
  }
  update(
    speed: number,
    boost: boolean,
    drift: boolean,
    sound: boolean,
    music: boolean,
    playing: boolean,
  ) {
    if (!this.ctx || !this.gain || !this.engine) return;
    const t = this.ctx.currentTime;
    this.engine.frequency.setTargetAtTime(
      35 + Math.abs(speed) * 3 + (drift ? 30 : 0),
      t,
      0.08,
    );
    this.gain.gain.setTargetAtTime(
      sound && playing ? (boost ? 0.035 : drift ? 0.027 : 0.018) : 0,
      t,
      0.1,
    );
    this.musicGain?.gain.setTargetAtTime(music ? 0.012 : 0, t, 0.3);
  }
  beep(f = 440, d = 0.1) {
    if (!this.ctx) return;
    const o = this.ctx.createOscillator(),
      g = this.ctx.createGain();
    o.frequency.value = f;
    g.gain.setValueAtTime(0.05, this.ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + d);
    o.connect(g).connect(this.ctx.destination);
    o.start();
    o.stop(this.ctx.currentTime + d);
  }
}
export const audio = new AudioEngine();

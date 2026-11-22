// Background music for the drawing board, played by the browser itself (Web
// Audio). Nothing is downloaded and there is no copyright: the tune is made
// on the spot from a simple chord loop (C - Am - F - G) with a gentle melody
// that moves step by step, so it never sounds the same twice.

export type Tune = "happy" | "calm" | "jazz";

const TUNES: Record<Tune, { bpm: number; wave: OscillatorType; rest: number }> = {
  happy: { bpm: 112, wave: "triangle", rest: 0.25 },
  calm: { bpm: 72, wave: "sine", rest: 0.45 },
  jazz: { bpm: 126, wave: "triangle", rest: 0.5 },
};

// Jazz: a ii-V-I-VI loop (Dm7 G7 Cmaj7 A7) with a walking bass, a soft ride
// cymbal and swung eighths.
const JAZZ = [
  { root: 50, third: 3, chord: [65, 69, 72, 76] },
  { root: 43, third: 4, chord: [65, 67, 71, 74] },
  { root: 48, third: 4, chord: [64, 67, 71, 74] },
  { root: 45, third: 4, chord: [61, 64, 67, 71] },
];
// How late the second eighth of each beat comes (swing feel).
const SWING = 0.33;

// MIDI notes of each chord: C, Am, F, G.
const CHORDS = [
  [60, 64, 67],
  [57, 60, 64],
  [53, 57, 60],
  [55, 59, 62],
];

const freq = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

export class DrawingMusic {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private step = 0;
  private nextTime = 0;
  private melody = 2;
  private tune: Tune = "happy";

  start(tune: Tune) {
    this.stop();
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const master = ctx.createGain();
    master.gain.value = 0.18;
    master.connect(ctx.destination);
    this.ctx = ctx;
    this.master = master;
    this.tune = tune;
    this.step = 0;
    this.melody = 2;
    this.nextTime = ctx.currentTime + 0.1;
    void ctx.resume();
    this.timer = setInterval(() => this.schedule(), 50);
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    const ctx = this.ctx;
    if (ctx && this.master) {
      this.master.gain.setTargetAtTime(0, ctx.currentTime, 0.1);
      setTimeout(() => void ctx.close(), 500);
    }
    this.ctx = null;
    this.master = null;
  }

  // Schedules the notes of the next 0.25 s, so the music stays smooth.
  private schedule() {
    const ctx = this.ctx;
    if (!ctx) return;
    const eighth = 60 / TUNES[this.tune].bpm / 2;
    while (this.nextTime < ctx.currentTime + 0.25) {
      this.playStep(this.step, this.nextTime, eighth);
      this.nextTime += eighth;
      this.step++;
    }
  }

  private playStep(step: number, t: number, eighth: number) {
    if (this.tune === "jazz") return this.playJazz(step, t, eighth);
    const { wave, rest } = TUNES[this.tune];
    const chord = CHORDS[Math.floor(step / 8) % CHORDS.length];
    const pos = step % 8;
    // Bass on beats 1 and 3.
    if (pos === 0 || pos === 4) this.note(chord[0] - 12, t, eighth * 3.5, "sine", 0.45);
    // Soft chord at the start of each bar.
    if (pos === 0) for (const n of chord) this.note(n, t, eighth * 7, "sine", 0.07);
    // Melody: chord notes an octave up, moving one step at a time.
    if (pos !== 0 && Math.random() < rest) return;
    const pool = [...chord.map((n) => n + 12), chord[0] + 24, chord[1] + 24];
    this.melody = Math.max(0, Math.min(pool.length - 1, this.melody + Math.floor(Math.random() * 3) - 1));
    this.note(pool[this.melody], t, eighth * 1.8, wave, 0.22);
  }

  private playJazz(step: number, t: number, eighth: number) {
    const bar = Math.floor(step / 8) % JAZZ.length;
    const { root, third, chord } = JAZZ[bar];
    const next = JAZZ[(bar + 1) % JAZZ.length].root;
    const pos = step % 8;
    const late = pos % 2 ? eighth * SWING : 0;
    const at = t + late;
    // Walking bass, one note a beat: root, third, fifth, then a step into the next chord.
    if (pos % 2 === 0) {
      const walk = [root, root + third, root + 7, next + (next > root ? -1 : 1)][pos / 2];
      this.note(walk, at, eighth * 1.8, "triangle", 0.5);
    }
    // Ride cymbal: every beat, plus the swung note before beats 2 and 4.
    if (pos % 2 === 0 || pos === 3 || pos === 7) this.ride(at, pos % 4 === 0 ? 0.05 : 0.035);
    // Piano chords on beat 1 and just before beat 3 (Charleston rhythm).
    if (pos === 0 || pos === 3) for (const n of chord) this.note(n, at, eighth * 1.5, "sine", 0.06);
    // A relaxed melody on the chord notes, an octave up.
    if (Math.random() < TUNES.jazz.rest) return;
    const pool = chord.map((n) => n + 12);
    this.melody = Math.max(0, Math.min(pool.length - 1, this.melody + Math.floor(Math.random() * 3) - 1));
    this.note(pool[this.melody], at, eighth * (pos % 2 ? 0.9 : 1.6), "triangle", 0.16);
  }

  private noise: AudioBuffer | null = null;

  private ride(t: number, vol: number) {
    const ctx = this.ctx;
    if (!ctx || !this.master) return;
    if (!this.noise || this.noise.sampleRate !== ctx.sampleRate) {
      this.noise = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.4), ctx.sampleRate);
      const d = this.noise.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 7000;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
    src.connect(hp);
    hp.connect(gain);
    gain.connect(this.master);
    src.start(t);
    src.stop(t + 0.35);
  }

  private note(midi: number, t: number, dur: number, type: OscillatorType, vol: number) {
    const ctx = this.ctx;
    if (!ctx || !this.master) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq(midi);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(vol, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }
}

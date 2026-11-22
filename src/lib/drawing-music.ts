// Background music for the drawing board, played by the browser itself (Web
// Audio). Nothing is downloaded and there is no copyright: the tune is made
// on the spot from a simple chord loop (C - Am - F - G) with a gentle melody
// that moves step by step, so it never sounds the same twice.

export type Tune = "happy" | "calm" | "jazz";

const TUNES: Record<Tune, { bpm: number; wave: OscillatorType; rest: number }> = {
  happy: { bpm: 112, wave: "triangle", rest: 0.25 },
  calm: { bpm: 72, wave: "sine", rest: 0.45 },
  jazz: { bpm: 116, wave: "triangle", rest: 0.5 },
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

// Saxophone melody: our own phrases over the 4 chords, as
// [eighth in the 4 bars, length in eighths, MIDI note]. The sax plays
// A, B, A, then rests for 4 bars while the band keeps going.
type Phrase = [number, number, number][];
const SAX_A: Phrase = [
  [1, 1, 65], [2, 1, 69], [3, 1, 72], [4, 2, 76], [6, 2, 74],
  [8, 3, 77], [11, 1, 76], [12, 1, 74], [13, 1, 71], [14, 2, 67],
  [16, 6, 76],
  [25, 1, 73], [26, 1, 76], [27, 1, 79], [28, 2, 76], [30, 2, 73],
];
const SAX_B: Phrase = [
  [0, 2, 69], [2, 1, 72], [3, 3, 74], [6, 2, 77],
  [8, 1, 76], [9, 1, 74], [10, 2, 71], [12, 1, 67], [13, 1, 69], [14, 2, 71],
  [16, 2, 72], [18, 2, 67], [20, 4, 71],
  [26, 1, 69], [27, 1, 73], [28, 1, 76], [29, 1, 79], [30, 2, 76],
];
const SAX_ORDER: (Phrase | null)[] = [SAX_A, SAX_B, SAX_A, null];

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
  // A soft echo, so the sax sounds like it plays in a room.
  private echo: DelayNode | null = null;

  start(tune: Tune) {
    this.stop();
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const master = ctx.createGain();
    master.gain.value = 0.18;
    master.connect(ctx.destination);
    const echo = ctx.createDelay();
    echo.delayTime.value = 0.27;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.28;
    const wet = ctx.createGain();
    wet.gain.value = 0.35;
    echo.connect(feedback);
    feedback.connect(echo);
    echo.connect(wet);
    wet.connect(master);
    this.echo = echo;
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
    this.echo = null;
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
    if (pos === 0 || pos === 3) for (const n of chord) this.note(n - 12, at, eighth * 1.5, "sine", 0.05);
    // The saxophone.
    const phrase = SAX_ORDER[Math.floor(step / 32) % SAX_ORDER.length];
    const here = step % 32;
    for (const [start, len, midi] of phrase ?? []) {
      if (start === here) this.sax(midi, at, eighth * len * 0.95);
    }
  }

  // A saxophone-like sound: a bright buzzy tone through a soft filter, with a
  // small slide up into each note, a breath at the start and a slow vibrato.
  private sax(midi: number, t: number, dur: number) {
    const ctx = this.ctx;
    if (!ctx || !this.master) return;
    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.value = freq(midi);
    osc.detune.setValueAtTime(-50, t);
    osc.detune.linearRampToValueAtTime(0, t + 0.06);
    const vib = ctx.createOscillator();
    vib.frequency.value = 5.2;
    const vibDepth = ctx.createGain();
    vibDepth.gain.setValueAtTime(0, t);
    vibDepth.gain.linearRampToValueAtTime(dur > 0.4 ? 14 : 4, t + Math.min(dur, 0.5));
    vib.connect(vibDepth);
    vibDepth.connect(osc.detune);
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.Q.value = 3;
    filter.frequency.setValueAtTime(700, t);
    filter.frequency.linearRampToValueAtTime(2600, t + 0.05);
    filter.frequency.linearRampToValueAtTime(1700, t + Math.max(0.1, dur));
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(0.32, t + 0.04);
    gain.gain.linearRampToValueAtTime(0.24, t + Math.max(0.06, dur * 0.7));
    gain.gain.linearRampToValueAtTime(0.0001, t + dur + 0.06);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    if (this.echo) gain.connect(this.echo);
    osc.start(t);
    vib.start(t);
    osc.stop(t + dur + 0.1);
    vib.stop(t + dur + 0.1);
    this.breath(t, 0.03);
  }

  private breath(t: number, vol: number) {
    const ctx = this.ctx;
    if (!ctx || !this.master) return;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer(ctx);
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 2500;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
    src.connect(bp);
    bp.connect(gain);
    gain.connect(this.master);
    src.start(t);
    src.stop(t + 0.1);
  }

  private noiseBuffer(ctx: AudioContext) {
    if (!this.noise || this.noise.sampleRate !== ctx.sampleRate) {
      this.noise = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.4), ctx.sampleRate);
      const d = this.noise.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    return this.noise;
  }

  private noise: AudioBuffer | null = null;

  private ride(t: number, vol: number) {
    const ctx = this.ctx;
    if (!ctx || !this.master) return;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer(ctx);
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

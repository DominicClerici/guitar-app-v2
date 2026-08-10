import { freqToNote, IN_TUNE_CENTS, type NoteInfo } from './freqToNote';
import { Ema, Median3 } from './smoothing';

export type GateFrame = {
  frequency: number;
  clarity: number;
  rms: number;
  timestamp: number;
};

export type GateOutput = {
  note: NoteInfo | null;
  // Smoothed cents, emitted every frame for the needle/chart: the held value during a
  // brief dropout and 0 once the readout clears. Equals note.cents when note is non-null.
  cents: number;
  // Raw detected pitch in Hz for the readout, held alongside `note` through a dropout
  // and 0 once the readout clears.
  frequency: number;
  clarity: number;
  rms: number;
};

export type GateOptions = {
  rmsFloor?: number;
  holdMs?: number;
  emaAlpha?: number;
};

const DEFAULTS = { rmsFloor: 0.01, holdMs: 300, emaAlpha: 0.4 };

export class TunerGate {
  private readonly rmsFloor: number;
  private readonly holdMs: number;
  private readonly median = new Median3();
  private readonly ema: Ema;
  private lastMidi: number | null = null;
  private lastRms = 0;
  // Pinned to the most recent valid frame; the hold window is measured from it and is
  // NOT extended by dropout frames.
  private lastGoodAt = -Infinity;
  private heldNote: NoteInfo | null = null;
  private heldCents = 0;
  private heldFrequency = 0;

  constructor(opts: GateOptions = {}) {
    this.rmsFloor = opts.rmsFloor ?? DEFAULTS.rmsFloor;
    this.holdMs = opts.holdMs ?? DEFAULTS.holdMs;
    this.ema = new Ema(opts.emaAlpha ?? DEFAULTS.emaAlpha);
  }

  push(frame: GateFrame): GateOutput {
    const valid = frame.frequency > 0 && frame.rms >= this.rmsFloor;

    if (!valid) {
      // Hold the last note briefly so one transient dropout doesn't blank the display.
      if (frame.timestamp - this.lastGoodAt < this.holdMs) {
        return {
          note: this.heldNote,
          cents: this.heldCents,
          frequency: this.heldFrequency,
          clarity: frame.clarity,
          rms: frame.rms,
        };
      }
      this.reset();
      return { note: null, cents: 0, frequency: 0, clarity: frame.clarity, rms: frame.rms };
    }

    let info = freqToNote(frame.frequency);
    let frequency = frame.frequency;

    // Octave-jump guard: a sudden ±12-semitone jump with a steady level is almost
    // always an octave error in the autocorrelation, so fold it back.
    if (this.lastMidi !== null && Math.abs(info.midi - this.lastMidi) === 12) {
      const rmsChange = Math.abs(frame.rms - this.lastRms) / Math.max(this.lastRms, 1e-6);
      if (rmsChange < 0.3) {
        frequency = frame.frequency * (info.midi > this.lastMidi ? 0.5 : 2);
        info = freqToNote(frequency);
      }
    }
    this.lastMidi = info.midi;
    this.lastRms = frame.rms;

    const cents = this.ema.push(this.median.push(info.cents));
    const note: NoteInfo = { ...info, cents, inTune: Math.abs(cents) < IN_TUNE_CENTS };

    this.lastGoodAt = frame.timestamp;
    this.heldNote = note;
    this.heldCents = cents;
    this.heldFrequency = frequency;

    return { note, cents, frequency, clarity: frame.clarity, rms: frame.rms };
  }

  reset(): void {
    this.median.reset();
    this.ema.reset();
    this.lastMidi = null;
    this.lastRms = 0;
    this.lastGoodAt = -Infinity;
    this.heldNote = null;
    this.heldCents = 0;
    this.heldFrequency = 0;
  }
}

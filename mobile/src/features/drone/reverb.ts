import type { AudioBuffer, BaseAudioContext } from 'react-native-audio-api';

/** Long enough to read as a room, short enough not to smear a chord change. */
const SECONDS = 2.4;
/** How fast the tail thins. Above 1 it decays quickly at first, then trails. */
const DECAY = 2.6;
/** One-pole lowpass coefficient. Lower is darker — this is what keeps it from hissing. */
const DAMPING = 0.24;
/** Silence before the tail starts, so the note is heard before the room is. */
const PREDELAY = 0.012;

/**
 * An impulse response, synthesised. Noise under a decaying envelope is the
 * cheapest thing that convolves into a plausible room, and a room is what a
 * drone needs — a sustained tone with no space around it sits inside your head
 * rather than in front of you.
 *
 * The two channels get independent noise, which is where the width comes from.
 */
export function buildImpulse(ctx: BaseAudioContext): AudioBuffer {
  const rate = ctx.sampleRate;
  const length = Math.floor(rate * SECONDS);
  const start = Math.floor(rate * PREDELAY);
  const buffer = ctx.createBuffer(2, length, rate);

  for (let channel = 0; channel < 2; channel += 1) {
    const samples = new Float32Array(length);
    let filtered = 0;

    for (let i = start; i < length; i += 1) {
      const progress = (i - start) / (length - start);
      filtered += DAMPING * (Math.random() * 2 - 1 - filtered);
      samples[i] = filtered * (1 - progress) ** DECAY;
    }

    buffer.copyToChannel(samples, channel);
  }

  return buffer;
}

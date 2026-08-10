import { useEffect, useRef, useState } from 'react';

import { subscribeFrames, type TunerFrame } from '@/features/tuner/tunerEngine';

import { medianOf } from './intonationMath';

/** Length of a take. Long enough to average out vibrato and the string settling. */
export const RECORD_MS = 3000;

/** A pluck has to be this loud to open a take, so room noise cannot start one. */
const ONSET_RMS = 0.02;
/** The signal has to fall back under this before the next take can be armed. */
const RELEASE_RMS = 0.012;
/**
 * The pick attack is inharmonic and the string is still stretching, both of which
 * read sharp. Everything before this is thrown away.
 */
const ATTACK_SKIP_MS = 300;
/** A gap this long means the note died rather than dipped. */
const DROPOUT_MS = 500;
/** Enough frames past the attack to trust a median. */
const MIN_FRAMES = 12;
/** Frames before the note being played is called, so a wrong note is caught early. */
const VERIFY_FRAMES = 6;

export type CaptureState = 'waiting' | 'recording';

export type CaptureProblem = { kind: 'wrong-note'; midi: number } | { kind: 'faded' };

interface Options {
  /** Pitch both readings should land on. */
  expectedMidi: number;
  /** False parks the machine and drops its subscription. */
  active: boolean;
  onCapture: (hz: number) => void;
}

interface Reading {
  midi: number;
  hz: number;
}

export interface SampleCapture {
  state: CaptureState;
  problem: CaptureProblem | null;
  /** Increments per take, so a view can restart an animation on a fresh one. */
  takeId: number;
}

/**
 * Waits for a pluck, records for three seconds, and hands back the median pitch.
 *
 * Frames arrive about every 30ms, which is far too often to drive React with, so
 * the take accumulates in refs and only its outcome becomes state. A take that
 * lands on the wrong note or dies early resolves to a `problem` instead of a
 * reading, and the machine re-arms itself for another attempt.
 */
export function useSampleCapture({ expectedMidi, active, onCapture }: Options): SampleCapture {
  const [state, setState] = useState<CaptureState>('waiting');
  const [problem, setProblem] = useState<CaptureProblem | null>(null);
  const [takeId, setTakeId] = useState(0);

  const onCaptureRef = useRef(onCapture);
  useEffect(() => {
    onCaptureRef.current = onCapture;
  }, [onCapture]);

  useEffect(() => {
    if (!active) return;

    const readings: Reading[] = [];
    let recording = false;
    // A take must not be opened by the ring-out of the one before it: the signal
    // has to fall away first, which is also what the on-screen prompt asks for.
    let armed = true;
    let verified = false;
    let startedAt = 0;
    let lastSoundAt = 0;

    const rearm = () => {
      recording = false;
      armed = false;
      verified = false;
      readings.length = 0;
      setState('waiting');
    };

    const abort = (next: CaptureProblem) => {
      rearm();
      setProblem(next);
    };

    const finish = () => {
      const onPitch = readings.filter((r) => r.midi === expectedMidi);
      const hz = medianOf(onPitch.map((r) => r.hz));
      rearm();
      setProblem(null);
      onCaptureRef.current(hz);
    };

    const unsubscribe = subscribeFrames((frame: TunerFrame) => {
      const silent = frame.note === null || frame.rms < RELEASE_RMS;
      if (silent) armed = true;

      if (!recording) {
        if (!armed || frame.note === null || frame.rms < ONSET_RMS) return;
        recording = true;
        armed = false;
        verified = false;
        readings.length = 0;
        startedAt = frame.timestamp;
        lastSoundAt = frame.timestamp;
        setState('recording');
        setProblem(null);
        setTakeId((id) => id + 1);
        return;
      }

      if (frame.note === null) {
        if (frame.timestamp - lastSoundAt > DROPOUT_MS) abort({ kind: 'faded' });
        return;
      }

      lastSoundAt = frame.timestamp;
      const elapsed = frame.timestamp - startedAt;
      if (elapsed < ATTACK_SKIP_MS) return;

      readings.push({ midi: frame.note.midi, hz: frame.frequency });

      // Call the note as soon as there is enough of it to be sure, rather than
      // making someone hold a wrong note for the full three seconds.
      if (!verified && readings.length >= VERIFY_FRAMES) {
        const midi = Math.round(medianOf(readings.map((r) => r.midi)));
        if (midi !== expectedMidi) {
          abort({ kind: 'wrong-note', midi });
          return;
        }
        verified = true;
      }

      if (elapsed >= RECORD_MS) {
        if (readings.filter((r) => r.midi === expectedMidi).length < MIN_FRAMES) {
          abort({ kind: 'faded' });
          return;
        }
        finish();
      }
    });

    return () => {
      unsubscribe();
      setState('waiting');
      setProblem(null);
    };
  }, [active, expectedMidi]);

  return { state, problem, takeId };
}

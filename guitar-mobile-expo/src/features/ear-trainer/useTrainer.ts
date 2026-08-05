import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';

import { claimPlayback, releasePlayback } from '@/features/articles/playbackBus';
import {
  createSession,
  DEFAULT_DEGREES,
  droneMidiFor,
  grade,
  nextQuestion,
  toneMidiFor,
  updateConfig,
  type KeyPolicy,
  type SessionState,
  type TrainerConfig,
  type Verdict,
} from '@/lib/ear-training';

import {
  getSnapshot,
  playTone,
  release,
  setDroneMidi,
  start,
  stop,
  subscribe,
} from './trainerEngine';

const KEEP_AWAKE_TAG = 'ear-trainer';

/** Silence between the screen settling and a question sounding. */
const ASK_DELAY_MS = 350;
/** Longer after a key change, so the new ground is heard before it is asked about. */
const ASK_AFTER_KEY_CHANGE_MS = 1400;
/** How long a correct answer holds its confirmation before the next question. */
const CORRECT_HOLD_MS = 1000;
/** How long an audition tap stays lit on the circle. */
const SOUNDING_MS = 700;

/**
 * Where the trainer is in its loop. `explore` is the open state — drone on or
 * off, circle as instrument. `question` has a tone out and unanswered.
 * `reveal` is showing a verdict: a correct one advances itself, a wrong one
 * holds for comparison until `continueNext`.
 */
export type TrainerPhase = 'explore' | 'question' | 'reveal';

export interface TrainerStats {
  asked: number;
  correct: number;
  streak: number;
  accuracy: number;
}

export interface UseTrainerResult {
  /** Whether the drone is sounding. */
  running: boolean;
  /** Whether a training session is open. */
  training: boolean;
  phase: TrainerPhase;
  verdict: Verdict | null;
  /** Degree lit by an audition tap, as feedback that the tap sounded. */
  sounding: number | null;
  tonicPc: number;
  config: TrainerConfig;
  stats: TrainerStats | null;
  toggleDrone: () => void;
  startTraining: () => void;
  endTraining: () => void;
  /** Answer during a question; audition anywhere else. */
  tapDegree: (degree: number) => void;
  replay: () => void;
  /** Leave a wrong answer's comparison and move on. */
  continueNext: () => void;
  setDegrees: (degrees: number[]) => void;
  setKeyPolicy: (policy: KeyPolicy) => void;
}

/**
 * The screen's handle on the trainer. The quiz is pure state in
 * `@/lib/ear-training`, the sound is a graph in `trainerEngine`, and this hook
 * is the join: it advances the session, tells the engine what to sound and
 * when, and exposes the phase the interface draws from.
 */
export function useTrainer(): UseTrainerResult {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const [config, setConfig] = useState<TrainerConfig>({
    degrees: DEFAULT_DEGREES,
    keyPolicy: { mode: 'fixed', tonicPc: 0 },
  });
  const [tonicPc, setTonicPc] = useState(0);
  const [session, setSession] = useState<SessionState | null>(null);
  const [phase, setPhase] = useState<TrainerPhase>('explore');
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [sounding, setSounding] = useState<number | null>(null);

  const askTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const soundingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (askTimer.current) clearTimeout(askTimer.current);
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    askTimer.current = null;
    advanceTimer.current = null;
  }, []);

  const endTraining = useCallback(() => {
    clearTimers();
    setSession(null);
    setPhase('explore');
    setVerdict(null);
  }, [clearTimers]);

  /** What another sound source calls to take over, and what full stop runs through. */
  const halt = useCallback(() => {
    endTraining();
    stop();
  }, [endTraining]);

  // The drone tracks the tonic wherever it comes from — a fixed key chosen in
  // config, or the session roaming. The engine holds the pitch when stopped.
  useEffect(() => {
    setDroneMidi(droneMidiFor(tonicPc));
  }, [tonicPc]);

  useEffect(() => {
    if (!snapshot.running) return;
    void activateKeepAwakeAsync(KEEP_AWAKE_TAG);
    return () => {
      void deactivateKeepAwake(KEEP_AWAKE_TAG);
    };
  }, [snapshot.running]);

  useEffect(
    () => () => {
      clearTimers();
      if (soundingTimer.current) clearTimeout(soundingTimer.current);
      releasePlayback(halt);
      release();
    },
    [clearTimers, halt],
  );

  /** Moves the session to its next question and schedules the tone. */
  const advance = useCallback(
    (from: SessionState) => {
      clearTimers();
      const next = nextQuestion(from);
      const question = next.question;
      if (!question) return;

      const keyChanged = next.tonicPc !== from.tonicPc;
      if (keyChanged) setTonicPc(next.tonicPc);

      setSession(next);
      setPhase('question');
      setVerdict(null);

      const midi = toneMidiFor(next.tonicPc, question.degree, question.octave);
      askTimer.current = setTimeout(
        () => playTone(midi),
        keyChanged ? ASK_AFTER_KEY_CHANGE_MS : ASK_DELAY_MS,
      );
    },
    [clearTimers],
  );

  const toggleDrone = useCallback(() => {
    if (snapshot.running) {
      halt();
      releasePlayback(halt);
      return;
    }
    claimPlayback(halt);
    start(droneMidiFor(tonicPc));
  }, [snapshot.running, halt, tonicPc]);

  const startTraining = useCallback(() => {
    if (!snapshot.running || session) return;
    advance(createSession(config, tonicPc));
  }, [snapshot.running, session, advance, config, tonicPc]);

  /** Sounds a degree as itself — a look around the key, not an answer. */
  const audition = useCallback(
    (degree: number, octave: number) => {
      playTone(toneMidiFor(tonicPc, degree, octave));
      setSounding(degree);
      if (soundingTimer.current) clearTimeout(soundingTimer.current);
      soundingTimer.current = setTimeout(() => setSounding(null), SOUNDING_MS);
    },
    [tonicPc],
  );

  const tapDegree = useCallback(
    (degree: number) => {
      if (phase === 'question' && session?.question) {
        if (!session.config.degrees.includes(degree)) return;

        const graded = grade(session, degree);
        setSession(graded.state);
        setVerdict(graded.verdict);
        setPhase('reveal');

        if (graded.verdict.correct) {
          advanceTimer.current = setTimeout(() => advance(graded.state), CORRECT_HOLD_MS);
        } else {
          // Hear the answer just given, in the question's own octave — the
          // mistake and the truth side by side is where the learning is.
          playTone(toneMidiFor(session.tonicPc, degree, session.question.octave));
        }
        return;
      }

      // In a wrong answer's hold, compare in the register the question used;
      // in the open state, the base register.
      const octave = phase === 'reveal' && session?.question ? session.question.octave : 0;
      audition(degree, octave);
    },
    [phase, session, advance, audition],
  );

  const replay = useCallback(() => {
    const question = session?.question;
    if (!question || phase === 'explore') return;
    playTone(toneMidiFor(session.tonicPc, question.degree, question.octave));
  }, [session, phase]);

  const continueNext = useCallback(() => {
    if (phase !== 'reveal' || !session || verdict?.correct !== false) return;
    advance(session);
  }, [phase, session, verdict, advance]);

  const setDegrees = useCallback(
    (degrees: number[]) => {
      const next = { ...config, degrees };
      setConfig(next);
      setSession((current) => (current ? updateConfig(current, next) : current));
    },
    [config],
  );

  const setKeyPolicy = useCallback(
    (policy: KeyPolicy) => {
      const next = { ...config, keyPolicy: policy };
      setConfig(next);
      setSession((current) => (current ? updateConfig(current, next) : current));
      if (policy.mode === 'fixed') setTonicPc(policy.tonicPc);
    },
    [config],
  );

  const stats: TrainerStats | null = session
    ? {
        asked: session.asked,
        correct: session.correct,
        streak: session.streak,
        accuracy: session.asked === 0 ? 0 : session.correct / session.asked,
      }
    : null;

  return {
    running: snapshot.running,
    training: session !== null,
    phase,
    verdict,
    sounding,
    tonicPc,
    config,
    stats,
    toggleDrone,
    startTraining,
    endTraining,
    tapDegree,
    replay,
    continueNext,
    setDegrees,
    setKeyPolicy,
  };
}

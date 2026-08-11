import { SymbolView } from 'expo-symbols';
import { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';
import { RichText } from '@/features/articles/RichText';
import { subscribeFrames } from '@/features/tuner/tunerEngine';
import { toAccidentalGlyphs } from '@/lib/accidentals';
import {
  runnableRounds,
  type ActivityDocument,
  type ActivityMode,
  type NotePlayActivity,
  type NotePlayRound,
} from '@/lib/content';
import { acquire, release } from '@/lib/mic';
import {
  boardWindow,
  emptyProgress,
  liveTargets,
  nextRoundIndex,
  noteLabel,
  observeFrame,
  roundComplete,
} from '@/lib/note-play';
import { useToken } from '@/lib/tokens';

import { ActivityIntro } from '../ActivityIntro';
import { ActivitySummary } from '../ActivitySummary';
import { MicGate } from '../MicGate';
import { recordActivityCompletion } from '../record';
import { RoundCountdown } from '../RoundCountdown';

import { ActivityFretboard } from './ActivityFretboard';

// Find the written notes on the neck and play them. The rules are next door in `@/lib/note-play`;
// what is left here is the shape of a run and the one subscription that feeds it.
//
// A run goes intro → countdown → round → a beat to see the round land → countdown → … → summary.
// Rounds exist because the detector reports a pitch and never the string that made it, so a round
// is the unit the publisher guarantees is unambiguous — see the shared activity schema. Nothing in
// the middle of a run requires the screen to be touched, because both of the learner's hands are
// on a guitar: rounds advance themselves, the countdown finishes on its own, and the only control
// is the one that lets someone out of a note they cannot find.

/** How long the finished round stays up before the next countdown. Long enough to read, not to wait. */
const ROUND_HOLD_MS = 1200;

/** Silence this long clears the heard-note readout, so it never stands as a stale claim. */
const HEARD_CLEAR_MS = 1000;

type Phase =
  | { kind: 'intro' }
  | { kind: 'countdown'; round: number }
  | { kind: 'playing'; round: number }
  | { kind: 'summary' };

export interface NotePlayRunnerProps {
  document: ActivityDocument;
  activity: NotePlayActivity;
  /** Null when opened outside a pathway — the run still works, nothing is recorded. */
  sectionId: string | null;
  userId: string | null;
  onDone: () => void;
}

/**
 * `activity.rounds` is guaranteed to hold at least one runnable round: the registry checks
 * `runnableRounds` before this is ever rendered, so nothing here has to handle an empty activity.
 */
export function NotePlayRunner({
  document,
  activity,
  sectionId,
  userId,
  onDone,
}: NotePlayRunnerProps) {
  const insets = useSafeAreaInsets();
  const accent = useToken('--accent', '#5ec8c2');

  const rounds = runnableRounds(activity.rounds);
  const targetCount = rounds.reduce((total, round) => total + round.targets.length, 0);

  const [phase, setPhase] = useState<Phase>({ kind: 'intro' });
  const [mode, setMode] = useState<ActivityMode>(activity.modes[0]);
  const [progress, setProgress] = useState(emptyProgress);
  const [found, setFound] = useState(0);
  const [heard, setHeard] = useState<number | null>(null);

  // The lease, held in a ref rather than in state because nothing renders from it and because the
  // cleanup below has to see the truth at unmount, not at the render that scheduled it. Same
  // guarantee `useTunerSession` gives: a runner can never walk away leaving the native session up.
  const leasedRef = useRef(false);

  const startListening = async () => {
    if (leasedRef.current) return;
    leasedRef.current = true;
    const status = await acquire();
    // A refused mic never granted a lease; MicGate is what tells the learner about it.
    if (status === 'denied' || status === 'unavailable') leasedRef.current = false;
  };

  const stopListening = () => {
    if (!leasedRef.current) return;
    leasedRef.current = false;
    release();
  };

  useEffect(
    () => () => {
      if (leasedRef.current) {
        leasedRef.current = false;
        release();
      }
    },
    [],
  );

  const round: NotePlayRound | null = phase.kind === 'playing' ? rounds[phase.round] : null;
  const complete = round !== null && roundComplete(round, progress);
  // Listening stops the moment the round is satisfied, so the beat that follows is quiet and a
  // stray ring-out cannot land on the round that has not started yet.
  const live = complete ? null : round;

  useEffect(() => {
    if (!live) return;

    let clear: ReturnType<typeof setTimeout> | undefined;

    const unsubscribe = subscribeFrames((frame) => {
      const midi = frame.note?.midi ?? null;

      if (midi !== null) {
        setHeard(midi);
        clearTimeout(clear);
        clear = setTimeout(() => setHeard(null), HEARD_CLEAR_MS);
      }

      // Frames arrive about every 30ms and nearly all of them change nothing. `observeFrame`
      // returns the progress it was handed when that is the case, which is what stops this from
      // re-rendering the board thirty times a second.
      setProgress((current) => observeFrame(live, current, midi));
    });

    return () => {
      unsubscribe();
      clearTimeout(clear);
      setHeard(null);
    };
  }, [live]);

  const begin = () => {
    setFound(0);
    setProgress(emptyProgress);
    void startListening();
    setPhase({ kind: 'countdown', round: 0 });
  };

  const advance = (from: number) => {
    setFound((total) => total + progress.hits.size);
    setProgress(emptyProgress);

    const next = nextRoundIndex(from, rounds.length);
    if (next !== null) {
      setPhase({ kind: 'countdown', round: next });
      return;
    }

    // The mic goes down with the last round rather than with the screen: the summary listens to
    // nothing, and on iOS a live session there leaves the recording indicator lit.
    stopListening();
    recordActivityCompletion(userId, sectionId);
    setPhase({ kind: 'summary' });
  };

  if (phase.kind === 'intro') {
    return (
      <ActivityIntro
        title={document.meta.title}
        summary={document.meta.summary}
        modes={{ options: activity.modes, selected: mode, onSelect: setMode }}
        startLabel="Start listening"
        onStart={begin}
      >
        <View className="gap-[9px] rounded-[12px] border border-x-line-soft border-t-edge-top border-b-edge-bottom bg-surface px-[14px] py-[13px]">
          <Text className="text-[13px] leading-[19px] text-ink-muted">
            {rounds.length === 1 ? 'One round' : `${rounds.length} rounds`} of notes to find on the
            neck. Play one and it lights up.
          </Text>
          <Text className="text-[13px] leading-[19px] text-ink-muted">
            Any pitch inside the note counts, so a guitar that is a little out still works. Notes
            that miss are named back to you and nothing else.
          </Text>
        </View>
      </ActivityIntro>
    );
  }

  if (phase.kind === 'summary') {
    return (
      <ActivitySummary
        title="Practice done"
        subtitle={`${rounds.length === 1 ? 'One round' : `All ${rounds.length} rounds`} played.`}
        onPlayAgain={begin}
        onDone={onDone}
      >
        <View className="flex-row gap-[10px]">
          <Stat label="Notes found" value={`${found} of ${targetCount}`} />
          <Stat label="Difficulty" value={mode === 'easy' ? 'Guided' : 'From memory'} />
        </View>
      </ActivitySummary>
    );
  }

  return (
    <MicGate reason="This activity listens for the notes you play, so it needs the microphone.">
      {phase.kind === 'countdown' ? (
        <RoundCountdown
          label={`Round ${phase.round + 1} of ${rounds.length}`}
          onDone={() => setPhase({ kind: 'playing', round: phase.round })}
        />
      ) : round === null ? null : (
        <View className="flex-1">
          <View className="px-[18px] pt-[4px]">
            <View className="flex-row items-center justify-between">
              <Text className="font-mono text-[10px] uppercase tracking-[2px] text-ink-faint">
                Round {phase.round + 1} of {rounds.length}
              </Text>
              <Text
                className="font-mono text-[10px] uppercase tracking-[2px] text-accent"
                accessibilityLabel={`${progress.hits.size} of ${round.targets.length} notes found`}
              >
                {progress.hits.size} of {round.targets.length} found
              </Text>
            </View>

            <RichText
              spans={round.prompt}
              className="mt-[10px] text-[17px] font-medium leading-[24px] tracking-[-0.3px] text-ink"
            />
          </View>

          <View className="mt-[18px]">
            <ActivityFretboard
              board={boardWindow(round, activity.board)}
              targets={round.targets}
              hits={progress.hits}
              mode={mode}
              nextIndex={
                round.ordered === true ? (liveTargets(round, progress.hits)[0] ?? null) : null
              }
            />
          </View>

          {/* A fixed slot: the readout appearing and vanishing must not shift the board under a
              learner who is reading it. */}
          <View className="mt-[18px] h-[18px] items-center justify-center">
            {heard === null ? null : (
              <Text className="font-mono text-[11px] tracking-[1.5px] text-ink-muted">
                heard {toAccidentalGlyphs(noteLabel(heard))}
              </Text>
            )}
          </View>

          <View className="flex-1 items-center justify-center">
            {complete ? (
              <RoundDone
                label={`Round ${phase.round + 1} done`}
                tint={accent}
                onDone={() => advance(phase.round)}
              />
            ) : null}
          </View>

          <View
            className="border-t border-t-line-soft px-[18px] pt-[12px]"
            style={{ paddingBottom: insets.bottom + 12 }}
          >
            {/* Always here, whatever state the round is in. A learner who cannot find a note has
                to be able to leave it rather than sit stuck on a board that will not complete. */}
            <Button
              variant="secondary"
              size="md"
              text="mono"
              radius={13}
              accessibilityLabel={complete ? 'Go to the next round' : 'Skip this round'}
              onPress={() => advance(phase.round)}
            >
              {complete ? 'Next' : 'Skip round'}
            </Button>
          </View>
        </View>
      )}
    </MicGate>
  );
}

/**
 * The beat between a round landing and the next countdown.
 *
 * It owns its own timer, the way `RoundCountdown` does, so the wait begins when the tick appears
 * rather than at whichever render the runner happened to notice the round was finished.
 */
function RoundDone({ label, tint, onDone }: { label: string; tint: string; onDone: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDone, ROUND_HOLD_MS);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel={label}
      className="items-center gap-[11px]"
    >
      <View className="h-[54px] w-[54px] items-center justify-center rounded-full border-2 border-accent bg-accent-wash">
        <SymbolView name="checkmark" size={20} weight="bold" tintColor={tint} />
      </View>
      <Text className="font-mono text-[10px] uppercase tracking-[2.5px] text-accent">{label}</Text>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 items-center rounded-[12px] border border-x-line-soft border-t-edge-top border-b-edge-bottom bg-surface px-[12px] py-[13px]">
      <Text className="font-mono text-[9.5px] uppercase tracking-[1.5px] text-ink-faint">
        {label}
      </Text>
      <Text className="mt-[6px] text-[16px] font-semibold tracking-[-0.3px] text-ink">{value}</Text>
    </View>
  );
}

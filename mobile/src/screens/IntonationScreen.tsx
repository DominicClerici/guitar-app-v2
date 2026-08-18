import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useCallback, useEffect, useState } from 'react';
import { InteractionManager, Linking, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackLink } from '@/components/BackLink';
import { Button } from '@/components/Button';
import {
  CaptureDial,
  DEFAULT_SCALE_INCHES,
  instruction,
  misfireMessage,
  ResultsSummary,
  ScaleLengthField,
  stageTitle,
  stringForOpenMidi,
  STRING_COUNT,
  StringRail,
  StringResultCard,
  TAKES,
  TOLERANCE_CENTS,
  useIntonation,
  useSampleCapture,
  type PipState,
} from '@/features/intonation';
import {
  IN_TUNE_CENTS,
  TUNER_FALLBACK,
  TunerScale,
  useNoteName,
  useTunerSession,
} from '@/features/tuner';
import { haptics } from '@/lib/haptics';
import { useAccidentalSide } from '@/lib/preferences';
import { centsTextClass } from '@/features/tuner/tunerColors';

const EM_DASH = '—';
const MINUS = '−';

/**
 * The intonation checker. Tune up, then walk the six strings: two takes of the
 * 12th-fret harmonic and two of the 12th fret stopped, per string, with a verdict
 * after each. The mic runs for the whole screen — one lease, taken once.
 */
export function IntonationScreen() {
  const insets = useSafeAreaInsets();

  const { status, note, centsSV, presenceSV, start, stop } = useTunerSession();
  const session = useIntonation();
  const { capture: commitSample } = session;
  const [scaleInches, setScaleInches] = useState(DEFAULT_SCALE_INCHES);

  // Which strings have been heard in tune at least once. Advisory only — nothing
  // on this screen waits on it.
  const [tuned, setTuned] = useState<string[]>([]);

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      void start();
    });
    return () => {
      task.cancel();
      stop();
    };
  }, [start, stop]);

  // The tuner's own note stream is what verifies tuning: an open string reading
  // inside the in-tune band ticks that string off. Folded in during render rather
  // than from an effect — it is a pure function of the note currently being read,
  // and an effect would render the stale rail for a frame first.
  if (session.phase === 'tune' && note !== null && Math.abs(note.cents) < IN_TUNE_CENTS) {
    const open = stringForOpenMidi(session.strings, note.midi);
    if (open && !tuned.includes(open.id)) setTuned([...tuned, open.id]);
  }

  const onCapture = useCallback(
    (hz: number) => {
      haptics.medium();
      commitSample(hz);
    },
    [commitSample],
  );

  const capture = useSampleCapture({
    expectedMidi: session.string.targetMidi,
    active: session.phase === 'measure' && status === 'listening',
    onCapture,
  });

  const denied = status === 'denied';
  const unavailable = status === 'unavailable';

  const railStates: PipState[] = session.strings.map((string, i) => {
    if (session.phase === 'tune') return tuned.includes(string.id) ? 'done' : 'idle';
    if (i === session.index) return 'active';
    return session.results.some((r) => r.stringId === string.id) ? 'done' : 'idle';
  });

  const title =
    session.phase === 'summary'
      ? 'Results'
      : session.phase === 'tune'
        ? 'Intonation'
        : `String ${session.index + 1} of ${STRING_COUNT}`;

  return (
    <View className="flex-1 bg-bg" style={{ paddingTop: Math.max(insets.top - 6, 0) }}>
      <View className="h-[42px] flex-row items-center justify-between px-[18px]">
        <BackLink title={title} />

        {session.phase === 'tune' ? null : (
          <Button
            variant="link"
            size="inline"
            text="mono"
            accessibilityLabel="Cancel the check"
            onPress={session.cancel}
          >
            Cancel
          </Button>
        )}
      </View>

      {denied || unavailable ? (
        <MicNotice denied={denied} />
      ) : session.phase === 'tune' ? (
        <TunePhase
          insets={insets.bottom}
          railStates={railStates}
          tunedCount={tuned.length}
          scaleInches={scaleInches}
          onScaleChange={setScaleInches}
          onStart={session.begin}
          note={note}
          centsSV={centsSV}
          presenceSV={presenceSV}
        />
      ) : session.phase === 'measure' ? (
        <MeasurePhase
          insets={insets.bottom}
          railStates={railStates}
          session={session}
          capture={capture}
          note={note}
        />
      ) : session.phase === 'result' ? (
        <ResultPhase
          insets={insets.bottom}
          railStates={railStates}
          session={session}
          scaleInches={scaleInches}
        />
      ) : (
        <SummaryPhase insets={insets.bottom} session={session} scaleInches={scaleInches} />
      )}
    </View>
  );
}

type Session = ReturnType<typeof useIntonation>;
type Capture = ReturnType<typeof useSampleCapture>;
type Note = ReturnType<typeof useTunerSession>['note'];

function MicNotice({ denied }: { denied: boolean }) {
  return (
    <View className="flex-1 items-center justify-center px-[32px]">
      <Text className="text-center text-[17px] font-semibold tracking-[-0.3px] text-ink">
        {denied ? 'Microphone access needed' : 'Unavailable on this platform'}
      </Text>
      <Text className="mt-[8px] text-center text-[13.5px] leading-[19px] text-ink-muted">
        {denied
          ? 'The checker listens to the string to measure it, so it needs the mic.'
          : 'The pitch detector is not available in this build.'}
      </Text>
      {denied ? (
        <Button
          variant="secondary"
          size="sm"
          text="mono"
          className="mt-[18px]"
          onPress={() => void Linking.openSettings()}
        >
          Open settings
        </Button>
      ) : null}
    </View>
  );
}

/** Filled accent CTA, matching the one on the key detector. */
function PrimaryAction({
  label,
  symbol,
  onPress,
}: {
  label: string;
  symbol: Parameters<typeof SymbolView>[0]['name'];
  onPress: () => void;
}) {
  return (
    <Button
      variant="primary"
      size="lg"
      radius={10}
      icon={symbol}
      className="flex-1"
      onPress={onPress}
    >
      {label}
    </Button>
  );
}

function SecondaryAction({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Button variant="secondary" size="lg" radius={10} className="flex-1" onPress={onPress}>
      {label}
    </Button>
  );
}

interface TuneProps {
  insets: number;
  railStates: PipState[];
  tunedCount: number;
  scaleInches: number;
  onScaleChange: (inches: number) => void;
  onStart: () => void;
  note: Note;
  centsSV: ReturnType<typeof useTunerSession>['centsSV'];
  presenceSV: ReturnType<typeof useTunerSession>['presenceSV'];
}

/**
 * Step zero. Intonation is measured against the string's own harmonic, so being
 * a few cents off does not corrupt the reading — but a string tuned to the wrong
 * pitch entirely will fail the note check, and a badly slack string reads
 * erratically. Hence the nudge, and hence it being only a nudge.
 */
function TunePhase({
  insets,
  railStates,
  tunedCount,
  scaleInches,
  onScaleChange,
  onStart,
  note,
  centsSV,
  presenceSV,
}: TuneProps) {
  const nameOf = useNoteName();

  return (
    <View className="flex-1">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-[18px] pt-[6px]"
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <Text className="text-[22px] font-semibold leading-[28px] tracking-[-0.5px] text-ink">
          Tune up first
        </Text>
        <Text className="mt-[6px] text-[13px] leading-[19px] text-ink-muted">
          Bring all six strings to pitch, then start the check. You can start whenever you like —
          the pips are just a reminder of where you got to.
        </Text>

        <View className="mt-[20px] items-center rounded-[13px] border border-x-line-soft border-t-edge-top border-b-edge-bottom bg-surface px-[18px] pb-[18px] pt-[20px]">
          <View className="flex-row items-end">
            <Text className="text-[68px] font-semibold leading-[74px] tracking-[-2.5px] text-ink">
              {note ? nameOf(note.midi) : EM_DASH}
            </Text>
            {note ? (
              <Text className="mb-[16px] ml-[3px] text-[19px] font-medium text-ink-muted">
                {note.octave}
              </Text>
            ) : null}
          </View>

          <Text
            className={`mt-[2px] font-mono text-[11.5px] uppercase tracking-[2px] ${centsTextClass(
              note ? note.cents : null,
            )}`}
          >
            {note
              ? `${note.cents >= 0 ? '+' : MINUS}${Math.abs(note.cents).toFixed(1)} cents`
              : `${EM_DASH} cents`}
          </Text>

          <View className="mt-[18px] w-full">
            <TunerScale centsSV={centsSV} presenceSV={presenceSV} />
          </View>
        </View>

        <View className="mt-[18px]">
          <StringRail
            states={railStates}
            caption={
              tunedCount === STRING_COUNT
                ? 'All six heard in tune'
                : `${tunedCount} of ${STRING_COUNT} heard in tune`
            }
          />
        </View>

        <View className="mt-[18px]">
          <ScaleLengthField inches={scaleInches} onChange={onScaleChange} />
        </View>
      </ScrollView>

      <View
        className="border-t border-t-line-soft bg-bg px-[18px] pt-[12px]"
        style={{ paddingBottom: insets + 12 }}
      >
        <View className="flex-row">
          <PrimaryAction label="Start intonation check" symbol="ruler" onPress={onStart} />
        </View>
      </View>
    </View>
  );
}

interface MeasureProps {
  insets: number;
  railStates: PipState[];
  session: Session;
  capture: Capture;
  note: Note;
}

function MeasurePhase({ insets, railStates, session, capture, note }: MeasureProps) {
  // Only the "heard X" line takes this: the note it names is whatever was plucked, with no key or
  // chord around it to letter it — see `useNoteName`.
  const side = useAccidentalSide(TUNER_FALLBACK);
  const { string, stage, taken } = session;
  const recording = capture.state === 'recording';
  const onPitch = note !== null && note.midi === string.targetMidi;

  const problem = capture.problem;
  const message = problem
    ? problem.kind === 'wrong-note'
      ? misfireMessage(problem.midi, string, stage, side)
      : 'That faded before the three seconds were up. Give it a firmer pluck and let it ring.'
    : null;

  const prompt = recording
    ? 'Recording — let it ring'
    : taken > 0
      ? 'Pluck it once more'
      : 'Waiting for your pluck';

  return (
    <View className="flex-1">
      <View className="px-[18px] pt-[6px]">
        <StringRail states={railStates} />
      </View>

      <View className="flex-1 items-center justify-center px-[24px]">
        <Text className="font-mono text-[10px] uppercase tracking-[2.5px] text-accent">
          {stageTitle(string, stage)}
        </Text>

        <Text className="mt-[10px] text-center text-[14px] leading-[20px] text-ink-muted">
          {instruction(string, stage)}
        </Text>

        <View className="mt-[26px]">
          <CaptureDial
            recording={recording}
            takeId={capture.takeId}
            note={note}
            onPitch={onPitch}
          />
        </View>

        <Text className="mt-[20px] font-mono text-[10.5px] uppercase tracking-[2px] text-ink-muted">
          {prompt}
        </Text>

        {/* Fixed slot: a message appearing must not shove the dial up the screen
            mid-take. */}
        <View className="mt-[10px] h-[54px] w-full">
          {message ? (
            <Text className="text-center text-[12.5px] leading-[17px] text-amber">{message}</Text>
          ) : null}
        </View>
      </View>

      <View
        className="items-center border-t border-t-line-soft px-[18px] pt-[14px]"
        style={{ paddingBottom: insets + 14 }}
      >
        <TakePips stage={stage} taken={taken} />
      </View>
    </View>
  );
}

/** Four slots per string: two harmonic takes, then two fretted. */
function TakePips({ stage, taken }: { stage: Session['stage']; taken: number }) {
  const done = stage === 'harmonic' ? taken : TAKES + taken;

  const pip = (i: number) => {
    const filled = i < done;
    const current = i === done;
    return (
      <View
        key={i}
        className={`h-[7px] w-[22px] rounded-full ${
          filled ? 'bg-accent' : current ? 'bg-ink-faint' : 'bg-line'
        }`}
      />
    );
  };

  return (
    <View className="items-center">
      {/* Two pairs rather than a run of four: the gap is where the hand changes
          from touching the string to fretting it. */}
      <View className="flex-row gap-[18px]">
        <View className="flex-row gap-[7px]">{[0, 1].map(pip)}</View>
        <View className="flex-row gap-[7px]">{[2, 3].map(pip)}</View>
      </View>
      <Text className="mt-[9px] font-mono text-[9.5px] uppercase tracking-[1.5px] text-ink-faint">
        {`Take ${Math.min(taken + 1, TAKES)} of ${TAKES} · ${
          stage === 'harmonic' ? 'harmonic' : '12th fret'
        }`}
      </Text>
    </View>
  );
}

interface ResultProps {
  insets: number;
  railStates: PipState[];
  session: Session;
  scaleInches: number;
}

function ResultPhase({ insets, railStates, session, scaleInches }: ResultProps) {
  const { string, result, isLast, redo, next } = session;
  if (!result) return null;

  return (
    <View className="flex-1">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-[18px] pt-[6px]"
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <StringRail states={railStates} />

        <View className="mt-[18px]">
          <StringResultCard string={string} measurement={result} scaleInches={scaleInches} />
        </View>
      </ScrollView>

      <View
        className="border-t border-t-line-soft bg-bg px-[18px] pt-[12px]"
        style={{ paddingBottom: insets + 12 }}
      >
        <View className="flex-row gap-[10px]">
          <SecondaryAction label="Redo string" onPress={redo} />
          <PrimaryAction
            label={isLast ? 'See results' : 'Next string'}
            symbol={isLast ? 'checkmark' : 'arrow.right'}
            onPress={next}
          />
        </View>
      </View>
    </View>
  );
}

function SummaryPhase({
  insets,
  session,
  scaleInches,
}: {
  insets: number;
  session: Session;
  scaleInches: number;
}) {
  const router = useRouter();

  return (
    <View className="flex-1">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-[18px] pt-[6px]"
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <ResultsSummary results={session.results} scaleInches={scaleInches} />

        <Text className="mt-[16px] text-[12px] leading-[17px] text-ink-faint">
          Distances are estimates, derived from the scale length and carrying roughly ±
          {TOLERANCE_CENTS} cents of measurement noise. They assume a saddle you can move for that
          string alone — on a fixed or shared compensated saddle, go by the direction only.
        </Text>
      </ScrollView>

      <View
        className="border-t border-t-line-soft bg-bg px-[18px] pt-[12px]"
        style={{ paddingBottom: insets + 12 }}
      >
        <View className="flex-row gap-[10px]">
          <SecondaryAction label="Run again" onPress={session.restart} />
          <PrimaryAction label="Done" symbol="checkmark" onPress={() => router.back()} />
        </View>
      </View>
    </View>
  );
}

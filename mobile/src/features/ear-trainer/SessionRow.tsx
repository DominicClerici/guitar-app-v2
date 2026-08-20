import { SymbolView } from 'expo-symbols';
import { Pressable, Text, View } from 'react-native';

import { StepMarker, stepStateFor } from '@/components/StepMarker';
import { toAccidentalGlyphs } from '@/lib/accidentals';
import { degreeLabel, type EarSession, type EarSessionStatus } from '@/lib/ear-training';
import { useToken } from '@/lib/tokens';

// One graded session as a row in its track.
//
// Unlike a curriculum chapter, sessions inside a track are ordered and gated:
// each one is defined by what it adds to the last, so there is no "open in any
// order" here. The row therefore has to carry its own place in the sequence —
// the marker for where it sits, the chips for what it holds, the score for how
// it went.

/**
 * The session's degree set, with the ones it introduces lit.
 *
 * The full set every time, never just the new ones: what a session *is* is the
 * whole pool it draws from, and a row showing one degree would read as a
 * session about that degree alone.
 */
function DegreeChips({
  degrees,
  introduces,
  dim,
}: {
  degrees: readonly number[];
  introduces: readonly number[];
  dim: boolean;
}) {
  return (
    <View className="mt-[7px] flex-row flex-wrap gap-[4px]">
      {degrees.map((degree) => {
        const fresh = introduces.includes(degree);

        return (
          <View
            key={degree}
            className={`h-[19px] min-w-[24px] items-center justify-center rounded-[6px] border px-[5px] ${
              fresh && !dim ? 'border-accent-line bg-accent-wash' : 'border-line-soft bg-tray'
            }`}
          >
            <Text
              className={`font-mono text-[9.5px] font-semibold tracking-[0.3px] ${
                dim ? 'text-ink-faint' : fresh ? 'text-accent' : 'text-ink-muted'
              }`}
            >
              {toAccidentalGlyphs(degreeLabel(degree))}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

export function SessionRow({
  session,
  ordinal,
  status,
  next,
  bestPct,
  onPress,
}: {
  session: EarSession;
  /** Its place within the track, from 1 — what the row is announced as. */
  ordinal: number;
  status: EarSessionStatus;
  /** The one row a Continue control opens. */
  next: boolean;
  /** The best this session has ever scored, or null if it has never been sat. */
  bestPct: number | null;
  onPress: () => void;
}) {
  const faint = useToken('--ink-faint', '#62666e');

  const locked = status === 'locked';
  const passed = status === 'passed';

  const spelled = session.degrees.map((degree) => degreeLabel(degree)).join(', ');
  const standing = passed
    ? `passed with ${bestPct}%`
    : locked
      ? 'locked'
      : bestPct === null
        ? 'not yet sat'
        : `best ${bestPct}%`;

  return (
    <Pressable
      onPress={locked ? undefined : onPress}
      disabled={locked}
      accessibilityRole="button"
      accessibilityState={{ disabled: locked }}
      accessibilityLabel={`Session ${ordinal}: ${session.title}. Degrees ${spelled}. ${standing}.`}
      className={`flex-row items-start gap-[12px] border-t border-t-line-soft py-[12px] ${
        locked ? 'opacity-50' : 'active:opacity-55'
      }`}
    >
      <View className="mt-[2px]">
        <StepMarker state={stepStateFor({ complete: passed, next, muted: locked })} />
      </View>

      <View className="flex-1">
        <View className="flex-row items-center gap-[10px]">
          <Text
            className={`flex-1 text-[14px] font-medium tracking-[-0.2px] ${
              locked ? 'text-ink-muted' : 'text-ink'
            }`}
          >
            {session.title}
          </Text>

          {locked ? (
            <SymbolView name="lock.fill" size={11} tintColor={faint} />
          ) : bestPct === null ? null : (
            <Text
              className={`font-mono text-[9.5px] font-semibold uppercase tracking-[1.5px] ${
                passed ? 'text-accent' : 'text-ink-faint'
              }`}
            >
              {bestPct}%
            </Text>
          )}
        </View>

        <DegreeChips degrees={session.degrees} introduces={session.introduces} dim={locked} />
      </View>
    </Pressable>
  );
}

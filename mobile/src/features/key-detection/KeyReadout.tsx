import { Pressable, Text, View } from 'react-native';

import type { KeyEstimate } from '@/lib/key-analysis';

import { keyStrength } from './keyStrength';

const EM_DASH = '—';

// A ten-segment meter rather than a continuous bar: the lit count is a static
// class per segment, and reading it as "seven of ten" suits a margin better than
// a bar edge does.
const SEGMENTS = 10;
const SEGMENT_INDEXES = Array.from({ length: SEGMENTS }, (_, i) => i);

/**
 * `fraction` is the winner's share of the top two candidates, so it can never
 * fall below 0.5 — a raw 0.5–1 range would only ever light the top half of the
 * meter. Rescale that range across the whole meter: nothing lit is a toss-up,
 * full is a clear win.
 */
function litSegments(fraction: number): number {
  return Math.max(1, Math.round((fraction - 0.5) * 2 * SEGMENTS));
}

function StrengthMeter({ fraction }: { fraction: number }) {
  const lit = litSegments(fraction);

  return (
    <View className="mt-[16px] flex-row gap-[3px]">
      {SEGMENT_INDEXES.map((i) => (
        <View
          key={i}
          className={`h-[6px] flex-1 rounded-[1px] ${i < lit ? 'bg-accent' : 'bg-line'}`}
        />
      ))}
    </View>
  );
}

interface Props {
  estimate: KeyEstimate;
  keyChoice: number;
  onSelectKey: (index: number) => void;
}

/**
 * The verdict: the key on show, how far ahead of the runner-up it is, and — when
 * the two are too close to call — both as a choice. Picking the runner-up
 * relabels every roman numeral in the progression against it.
 */
export function KeyReadout({ estimate, keyChoice, onSelectKey }: Props) {
  if (estimate.status === 'insufficient' || !estimate.best) {
    return (
      <View className="rounded-[13px] border border-t-edge-top border-x-line-soft border-b-edge-bottom bg-surface p-[16px]">
        <Text className="font-mono text-[10px] font-semibold uppercase tracking-[2.5px] text-ink-faint">
          Detected key
        </Text>
        <Text className="mt-[10px] text-[28px] leading-[32px] font-semibold tracking-[-0.7px] text-ink-faint">
          {EM_DASH}
        </Text>
        <Text className="mt-[8px] text-[12.5px] leading-[18px] text-ink-muted">
          Add at least two chords and a key will be worked out from them.
        </Text>
      </View>
    );
  }

  const { fraction, word } = keyStrength(estimate);
  const displayed = estimate.candidates[keyChoice] ?? estimate.best;
  const pair = estimate.candidates.slice(0, 2);
  const ambiguous = estimate.status === 'ambiguous' && pair.length === 2;
  // `fraction` is the leader's share; the headline must follow whichever
  // candidate is on show, mirroring the per-card split below.
  const displayedFraction = keyChoice === 0 ? fraction : 1 - fraction;

  return (
    <View className="rounded-[13px] border border-t-edge-top border-x-line-soft border-b-edge-bottom bg-surface p-[16px]">
      <View className="flex-row items-center justify-between">
        <Text className="font-mono text-[10px] font-semibold uppercase tracking-[2.5px] text-ink-faint">
          Detected key
        </Text>
        <Text
          className={`font-mono text-[10px] font-semibold uppercase tracking-[2px] ${
            ambiguous ? 'text-amber' : 'text-accent'
          }`}
        >
          {word}
        </Text>
      </View>

      <Text className="mt-[10px] text-[28px] leading-[32px] font-semibold tracking-[-0.7px] text-ink">
        {displayed.name}
      </Text>

      <StrengthMeter fraction={displayedFraction} />

      {ambiguous ? (
        <View className="mt-[18px]">
          <Text className="text-[12.5px] leading-[18px] text-ink-muted">
            Two keys fit this progression about equally. Pick one to read the numerals against it.
          </Text>
          <View className="mt-[12px] flex-row gap-[8px]">
            {pair.map((candidate, i) => {
              const selected = i === keyChoice;
              const share = i === 0 ? fraction : 1 - fraction;

              return (
                <Pressable
                  key={`${candidate.tonicPc}-${candidate.mode}`}
                  onPress={() => onSelectKey(i)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={candidate.name}
                  className={`flex-1 rounded-[10px] border px-[12px] py-[11px] active:opacity-70 ${
                    selected
                      ? 'border-accent-line bg-accent-wash'
                      : 'border-line-soft bg-surface-raised'
                  }`}
                >
                  <Text
                    className={`text-[14px] font-semibold tracking-[-0.2px] ${
                      selected ? 'text-ink' : 'text-ink-muted'
                    }`}
                  >
                    {candidate.name}
                  </Text>
                  <Text
                    className={`mt-[4px] font-mono text-[10px] tracking-[1px] ${
                      selected ? 'text-accent' : 'text-ink-faint'
                    }`}
                  >
                    {Math.round(share * 100)}%
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}
    </View>
  );
}

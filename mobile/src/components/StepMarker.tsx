import { SymbolView } from 'expo-symbols';
import { View } from 'react-native';

import { useToken } from '@/lib/tokens';

/**
 * Where a row sits in a sequence. `next` is the one a Continue control opens —
 * never an optional or locked row, which is the whole point of both.
 */
export type StepState = 'complete' | 'next' | 'todo' | 'muted';

/** The three booleans a row actually knows about, resolved in the order they win. */
export function stepStateFor({
  complete,
  next,
  muted = false,
}: {
  complete: boolean;
  next: boolean;
  muted?: boolean;
}): StepState {
  if (complete) return 'complete';
  if (muted) return 'muted';
  return next ? 'next' : 'todo';
}

/**
 * The dot down the left of every stepped row — a pathway section, a chapter
 * quiz, an ear session — carrying the three answers a learner scans for: done,
 * here, still to do. Done is the accent settled back a step, since it has been
 * earned and no longer needs the eye, while the one place to go next wears the
 * accent at full strength.
 *
 * Shared rather than reimplemented per feature: two copies of a three-state dot
 * drift the first time either is touched, and a learner reading the ear pathway
 * is reading the same alphabet they learned on the Learn tab.
 */
export function StepMarker({ state }: { state: StepState }) {
  const onAccent = useToken('--on-accent', '#04211f');

  if (state === 'complete') {
    return (
      <View className="h-[18px] w-[18px] items-center justify-center rounded-full bg-accent-muted">
        <SymbolView name="checkmark" size={9} weight="bold" tintColor={onAccent} />
      </View>
    );
  }

  const ring =
    state === 'next' ? 'border-accent' : state === 'muted' ? 'border-line' : 'border-accent-line';
  const pip =
    state === 'next'
      ? 'bg-accent h-2 w-2'
      : state === 'muted'
        ? 'bg-line h-1.5 w-1.5'
        : 'bg-accent-line h-1.5 w-1.5';

  return (
    <View className={`h-[18px] w-[18px] items-center justify-center rounded-full border ${ring}`}>
      <View className={`rounded-full ${pip}`} />
    </View>
  );
}

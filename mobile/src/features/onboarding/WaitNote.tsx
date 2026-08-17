import type { ComponentProps } from 'react';
import { ActivityIndicator, Text } from 'react-native';

import { AnimatedView } from '@/components/AnimatedView';
import { useToken } from '@/lib/tokens';

/**
 * What the empty point in the middle of a move says when it has lasted too long.
 *
 * An apology rather than a status: nothing here is the person's doing, and "Loading…" would put the
 * wait on them. It sits where the question was, so the eye that was reading the step has not been
 * asked to look anywhere new.
 */
export function WaitNote({ style }: { style: ComponentProps<typeof AnimatedView>['style'] }) {
  const muted = useToken('--ink-muted', '#9aa0aa');

  return (
    <AnimatedView
      pointerEvents="none"
      style={style}
      className="absolute inset-0 items-center justify-center gap-[14px]"
      accessibilityRole="progressbar"
      accessibilityLabel="Sorry, just a moment…"
    >
      <ActivityIndicator size="small" color={muted} />
      <Text className="text-[14px] leading-[20px] text-ink-muted">Sorry, just a moment…</Text>
    </AnimatedView>
  );
}

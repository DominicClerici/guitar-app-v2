import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

/**
 * The question at the top of a step, and the line under it that qualifies the question.
 *
 * Every step opens the same way, so the typography lives here rather than being restated six times
 * — a flow whose heading size drifted by a point between screens would be visibly one screen
 * replacing another rather than one question changing.
 */
export function StepHeading({
  title,
  children,
  className = '',
}: {
  title: string;
  /** A string takes the muted body type; anything else renders inside it, already styled. */
  children?: ReactNode;
  className?: string;
}) {
  return (
    <View className={className}>
      <Text className="text-[28px] leading-[32px] font-semibold tracking-[-0.7px] text-ink">
        {title}
      </Text>

      {children !== undefined && children !== null ? (
        <Text className="mt-[8px] text-[14px] leading-[20px] text-ink-muted">{children}</Text>
      ) : null}
    </View>
  );
}

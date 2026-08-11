import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

// The beat between rounds: three seconds to read the next prompt and get a hand back on the neck.
//
// It finishes on its own. A learner mid-activity is holding a guitar with both hands, so nothing
// in the run may *require* the screen to be touched — the tap here only spends the wait early,
// which is what makes it an accelerator rather than a control.

const TICK_MS = 1000;

export function RoundCountdown({
  from = 3,
  label,
  onDone,
}: {
  /** Seconds to count. */
  from?: number;
  /** What is about to start — the next round's number, usually. */
  label?: string;
  onDone: () => void;
}) {
  const [count, setCount] = useState(from);

  useEffect(() => {
    if (count > 0) {
      const timer = setTimeout(() => setCount((n) => n - 1), TICK_MS);
      return () => clearTimeout(timer);
    }

    // Firing from the effect rather than from the tick keeps `onDone` out of the render pass, and
    // means the tap and the last tick end the countdown by exactly the same path.
    onDone();
  }, [count, onDone]);

  // Zero is a render, so the last second would otherwise flash a 0 on its way out.
  const shown = Math.max(count, 1);

  return (
    <Pressable
      onPress={() => setCount(0)}
      accessibilityRole="button"
      accessibilityLabel={`Starting in ${shown}. Tap to skip the countdown.`}
      className="flex-1 items-center justify-center active:opacity-70"
    >
      {label ? (
        <Text className="font-mono text-[10px] uppercase tracking-[2.5px] text-ink-faint">
          {label}
        </Text>
      ) : null}

      <View className="mt-[14px] h-[132px] w-[132px] items-center justify-center rounded-full border-2 border-accent-line bg-accent-wash">
        <Text className="text-[58px] font-semibold leading-[64px] tracking-[-2px] text-ink">
          {shown}
        </Text>
      </View>

      <Text className="mt-[22px] font-mono text-[10px] uppercase tracking-[2px] text-ink-faint">
        Tap to skip
      </Text>
    </Pressable>
  );
}

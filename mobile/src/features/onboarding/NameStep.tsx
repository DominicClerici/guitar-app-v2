import { Text, View } from 'react-native';

import { Button } from '@/components/Button';

/**
 * Step three, as far as it goes for now: the account exists and is signed in, and this is where
 * the flow hands over to the rest of onboarding.
 *
 * The field and the write to `user.name` are the next piece of work. What is real here is the
 * arrival: everything before it — a code, or Apple, or Google — lands on this step by the same
 * route, and `suggestedName` already has the provider's answer waiting to prefill it.
 */
export function NameStep({
  suggestion,
  onDone,
}: {
  /** What Apple or Google called them, or empty. Will be the field's initial value. */
  suggestion: string;
  onDone: () => void;
}) {
  return (
    <View>
      <Text className="text-[28px] leading-[32px] font-semibold tracking-[-0.7px] text-ink">
        What should we call you?
      </Text>
      <Text className="mt-[8px] text-[14px] leading-[20px] text-ink-muted">
        You’re signed in. This step is next.
      </Text>

      {suggestion ? (
        <View className="mt-[22px] rounded-[12px] border border-line-soft bg-tray px-[14px] py-[12px]">
          <Text className="font-mono text-[9.5px] uppercase tracking-[2px] text-ink-faint">
            From your provider
          </Text>
          <Text className="mt-[6px] text-[16px] tracking-[-0.2px] text-ink">{suggestion}</Text>
        </View>
      ) : null}

      <Button variant="primary" size="lg" radius={13} className="mt-[24px] w-full" onPress={onDone}>
        Done for now
      </Button>
    </View>
  );
}

import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/Button';

/** The first screen of the onboarding flow. A stub for now — the form comes later. */
export function CreateAccountScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-bg px-[18px]" style={{ paddingTop: insets.top + 10 }}>
      {/* A modal closes rather than goes back, so the affordance is a cross and not a chevron —
          and it stays even though the card can be swiped away, which is not discoverable. */}
      <Button
        variant="ghost"
        size="inline"
        icon="xmark"
        hitSlop={10}
        className="-ml-[4px] self-start"
        accessibilityLabel="Close"
        onPress={router.back}
      />

      <Text className="mt-[20px] text-[28px] leading-[32px] font-semibold tracking-[-0.7px] text-ink">
        Create Account
      </Text>
    </View>
  );
}

import { Text, View } from 'react-native';

import { useFace } from '@/components/CornerFace';

/**
 * What a guest sees above the sign-in forms (BACKEND_PLAN.md §5).
 *
 * A guest account is real and its progress is really saved — what it lacks is any way back in.
 * The only key to it is the session cookie in this phone's keychain, so the thing worth saying is
 * not "nothing is saved" but "this is the only phone that can reach it".
 */
export function GuestBanner() {
  const card = useFace('card', 12);

  return (
    <View className={`gap-[6px] rounded-[12px] p-[14px] ${card.className}`}>
      {card.paint}

      <Text className="font-mono text-[9.5px] uppercase tracking-[2px] text-ink-faint">Guest</Text>
      <Text className="text-[13px] leading-[18px] text-ink-muted">
        Your progress is tied to this phone. Create an account to keep it when you change devices —
        everything you’ve done so far comes with you.
      </Text>
    </View>
  );
}

import { Text, View } from 'react-native';

import { Face } from '@/components/Face';

// Shown for a block this build doesn't understand — newer content on an older
// app, an unregistered live component, or live props that failed validation.
// The article keeps reading; only this slot degrades.
export function UnknownContentCard() {
  return (
    <View className="mt-[18px] items-center px-[14px] py-[18px]">
      <Face fill="--surface" stroke="--line" dashed radius={13} />
      <Text className="font-mono text-[10px] uppercase tracking-[2px] text-ink-faint">
        Update the app to view this content
      </Text>
    </View>
  );
}

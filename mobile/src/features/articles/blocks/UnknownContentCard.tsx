import { Text, View } from 'react-native';

// Shown for a block this build doesn't understand — newer content on an older
// app, an unregistered live component, or live props that failed validation.
// The article keeps reading; only this slot degrades.
export function UnknownContentCard() {
  return (
    <View className="mt-[18px] items-center rounded-[13px] border border-dashed border-line bg-surface px-[14px] py-[18px]">
      <Text className="font-mono text-[10px] uppercase tracking-[2px] text-ink-faint">
        Update the app to view this content
      </Text>
    </View>
  );
}

import { Text, View } from 'react-native';

// Temporary body for tabs that aren't built yet: the tab name, centred.
export function PlaceholderScreen({ title }: { title: string }) {
  return (
    <View className="flex-1 items-center justify-center bg-bg">
      <Text className="font-mono text-[13px] uppercase tracking-[4px] text-ink-muted">{title}</Text>
    </View>
  );
}

import { Text, View } from 'react-native';

// Temporary body for tabs that aren't built yet: the tab name, centred.
export function PlaceholderScreen({ title }: { title: string }) {
  return (
    <View className="tab-screen">
      <Text className="tab-screen-label">{title}</Text>
    </View>
  );
}

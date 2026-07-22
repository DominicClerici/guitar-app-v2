import { Text, View } from 'react-native';

import './styles/variant-1.css';

export default function Variant1() {
  return (
    <View className="variant-1-root flex-1 items-center justify-center bg-[color:var(--lab-bg)]">
      <Text className="text-2xl font-bold text-[color:var(--lab-accent)]">Variant 1</Text>
    </View>
  );
}

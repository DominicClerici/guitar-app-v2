import { Text, View } from 'react-native';

import './styles/variant-3.css';

export default function Variant3() {
  return (
    <View className="variant-3-root flex-1 items-center justify-center bg-[color:var(--lab-bg)]">
      <Text className="text-2xl font-bold text-[color:var(--lab-accent)]">Variant 3</Text>
    </View>
  );
}

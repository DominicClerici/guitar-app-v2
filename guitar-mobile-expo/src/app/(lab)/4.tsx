import { Text, View } from 'react-native';

import './styles/variant-4.css';

export default function Variant4() {
  return (
    <View className="variant-4-root flex-1 items-center justify-center bg-[color:var(--lab-bg)]">
      <Text className="text-2xl font-bold text-[color:var(--lab-accent)]">Variant 4</Text>
    </View>
  );
}

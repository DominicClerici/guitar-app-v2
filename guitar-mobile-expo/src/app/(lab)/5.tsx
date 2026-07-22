import { Text, View } from 'react-native';

import './styles/variant-5.css';

export default function Variant5() {
  return (
    <View className="variant-5-root flex-1 items-center justify-center bg-[color:var(--lab-bg)]">
      <Text className="text-2xl font-bold text-[color:var(--lab-accent)]">Variant 5</Text>
    </View>
  );
}

import { Text, View } from 'react-native';

import './styles/variant-1.css';

export default function Variant1() {
  return (
    <View className="variant-1-root flex-1 items-center justify-center">
      <Text className="v1-label">Variant 1</Text>
    </View>
  );
}

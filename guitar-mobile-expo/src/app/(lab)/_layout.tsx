import { Slot } from 'expo-router';
import { View } from 'react-native';

import { VariantSwitcher } from './switcher';

export default function LabLayout() {
  return (
    <View style={{ flex: 1 }}>
      <Slot />
      <VariantSwitcher />
    </View>
  );
}

import { router, usePathname } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const VARIANTS = [1, 2, 3, 4, 5, 6] as const;

export function VariantSwitcher() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 8 }]}>
      {VARIANTS.map((n) => {
        const selected = pathname === `/${n}`;
        return (
          <Pressable
            key={n}
            onPress={() => router.replace(`/${n}`)}
            style={[styles.segment, selected && styles.segmentSelected]}
          >
            <Text style={[styles.label, selected && styles.labelSelected]}>{n}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    backgroundColor: '#1c1c1e',
    paddingTop: 8,
    paddingHorizontal: 8,
    gap: 4,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  segmentSelected: {
    backgroundColor: '#3a3a3c',
  },
  label: {
    color: '#8e8e93',
    fontSize: 16,
    fontWeight: '600',
  },
  labelSelected: {
    color: '#ffffff',
  },
});

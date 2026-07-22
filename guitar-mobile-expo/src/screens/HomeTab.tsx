import { SymbolView } from 'expo-symbols';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ON_ACCENT = '#04211f';
const GHOST_ICON = '#9aa0aa';

// Precision tuner scale — 25 graduations. The centre reads in tune (aqua),
// every fifth tick is a major graduation, the rest are fine.
const TICKS = Array.from({ length: 25 }, (_, i) => i);
const CENTER = 12;
function tickClass(i: number) {
  if (i === CENTER) return 'home-tick-center';
  if (i % 5 === 0) return 'home-tick home-tick-major';
  return 'home-tick';
}

// Colour carries information here: each stat gets its own key-coded hue.
const TILES = [
  { num: '14', label: 'Streak', hue: 'aqua' },
  { num: '92%', label: 'Accuracy', hue: 'rose' },
  { num: '3.2h', label: 'This week', hue: 'violet' },
];

export function HomeTab() {
  const insets = useSafeAreaInsets();

  return (
    <View className="home-root flex-1">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 16,
          paddingBottom: insets.bottom + 96,
          paddingHorizontal: 22,
        }}
      >
        {/* header */}
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="home-device">Practice unit</Text>
            <Text className="home-brand">
              Auro<Text className="home-brand-accent">ra</Text>
            </Text>
          </View>
          <View className="home-opus">
            <Text className="home-opus-no">05</Text>
            <Text className="home-opus-label">Study</Text>
          </View>
        </View>

        {/* machined hero */}
        <View className="home-tray" style={{ marginTop: 24 }}>
          <View className="home-face">
            <View className="home-face-topline">
              <Text className="home-eyebrow">Now playing</Text>
              <Text className="home-face-index">01 / 03</Text>
            </View>
            <Text className="home-face-title">Blackbird</Text>
            <Text className="home-face-sub">The Beatles · a fingerstyle study in G</Text>
            <View className="home-readout">
              <Text className="home-readout-time">03:12</Text>
              <Text className="home-readout-meta">92 BPM · 4/4 · CAPO 3</Text>
            </View>

            <View className="home-transport">
              <Pressable className="home-btn-primary">
                <SymbolView name="play.fill" size={14} tintColor={ON_ACCENT} />
                <Text className="home-btn-primary-text">Resume</Text>
              </Pressable>
              <Pressable className="home-btn-ghost">
                <SymbolView name="metronome" size={18} tintColor={GHOST_ICON} />
              </Pressable>
            </View>
          </View>
        </View>

        {/* signature — tuner scale */}
        <View className="home-section">
          <View className="home-section-head">
            <Text className="home-section-title">Tuner</Text>
            <Text className="home-section-meta">440 Hz · standard</Text>
          </View>
          <View className="home-tuner">
            <View className="home-tuner-head">
              <Text className="home-tuner-note">
                A<Text className="home-tuner-note-sub"> · 110.0 Hz</Text>
              </Text>
              <Text className="home-tuner-cents">−0.4 ¢</Text>
            </View>
            <View className="home-tuner-scale">
              {TICKS.map((i) => (
                <View key={i} className={tickClass(i)} />
              ))}
            </View>
            <View className="home-tuner-baseline" />
            <View className="home-tuner-labels">
              <Text className="home-tuner-label">−50</Text>
              <Text className="home-tuner-label">IN TUNE</Text>
              <Text className="home-tuner-label">+50</Text>
            </View>
          </View>
        </View>

        {/* machined stat tiles */}
        <View className="home-tiles">
          {TILES.map((t) => (
            <View key={t.label} className="home-tile">
              <Text className={`home-tile-num home-tile-num-${t.hue}`}>{t.num}</Text>
              <Text className="home-tile-label">{t.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

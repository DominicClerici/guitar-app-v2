import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import './styles/variant-2.css';

const ACCENT = '#2fe3b6';

const TILES: { icon: SymbolViewProps['name']; label: string }[] = [
  { icon: 'tuningfork', label: 'Tuner' },
  { icon: 'metronome', label: 'Tempo' },
  { icon: 'waveform', label: 'Record' },
  { icon: 'guitars', label: 'Chords' },
];

const SESSIONS = [
  { title: 'Sweep Picking', meta: 'Technique · 4 exercises', dur: '18:00', icon: 'bolt.fill' },
  { title: 'Minor Pentatonic', meta: 'Scales · Position 1', dur: '12:30', icon: 'circle.grid.3x3.fill' },
  { title: 'Ear Training', meta: 'Intervals · Level 3', dur: '09:15', icon: 'ear.fill' },
] as const;

export default function Variant2() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      className="v2-root flex-1"
      contentContainerStyle={{ paddingTop: insets.top + 14, paddingBottom: insets.bottom + 96 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="v2-scroll">
        {/* top bar */}
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="v2-greeting">Ready to play</Text>
            <Text className="v2-wordmark">
              amp<Text className="v2-wordmark-accent">stack</Text>
            </Text>
          </View>
          <View className="v2-avatar">
            <Text className="v2-avatar-text">DC</Text>
          </View>
        </View>

        {/* feature card */}
        <View className="v2-section">
          <View className="v2-feature">
            <View className="v2-feature-pill">
              <SymbolView name="flame.fill" size={12} tintColor={ACCENT} />
              <Text className="v2-feature-pill-text">7 day streak</Text>
            </View>
            <Text className="v2-feature-title">Today&apos;s set</Text>
            <Text className="v2-feature-sub">3 focused drills · roughly 40 minutes</Text>

            <View className="v2-ring-row">
              <View className="v2-ring">
                <Text className="v2-ring-text">72%</Text>
              </View>
              <View className="flex-1">
                <Text className="v2-stat-label">This week</Text>
                <Text className="v2-stat-value">4h 12m practiced</Text>
              </View>
            </View>

            <Pressable className="v2-btn v2-btn-primary">
              <SymbolView name="play.fill" size={15} tintColor="#04241c" />
              <Text className="v2-btn-primary-text">Start warm-up</Text>
            </Pressable>
          </View>
        </View>

        {/* quick actions */}
        <View className="v2-section">
          <Text className="v2-eyebrow">Tools</Text>
          <Text className="v2-section-title">Jump in</Text>
          <View className="v2-tile-row" style={{ marginTop: 16 }}>
            {TILES.map((t) => (
              <View key={t.label} className="v2-tile">
                <View className="v2-tile-badge">
                  <SymbolView name={t.icon} size={20} tintColor={ACCENT} />
                </View>
                <Text className="v2-tile-label">{t.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* sessions */}
        <View className="v2-section">
          <Text className="v2-eyebrow">Queued</Text>
          <Text className="v2-section-title">Your session</Text>
          <View style={{ marginTop: 6 }}>
            {SESSIONS.map((s) => (
              <View key={s.title} className="v2-row">
                <View className="v2-row-art">
                  <SymbolView name={s.icon} size={20} tintColor={ACCENT} />
                </View>
                <View className="flex-1">
                  <Text className="v2-row-title">{s.title}</Text>
                  <Text className="v2-row-meta">{s.meta}</Text>
                </View>
                <Text className="v2-row-dur">{s.dur}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* type specimen */}
        <View className="v2-section">
          <Text className="v2-eyebrow">Type system</Text>
          <Text className="v2-section-title">Bold &amp; kinetic</Text>
          <View className="v2-spec" style={{ marginTop: 16 }}>
            <Text className="v2-spec-display">
              Play<Text className="v2-spec-accent">.</Text>
            </Text>
            <Text className="v2-spec-body">
              A rounded geometric display carries energy and confidence, softened just enough to feel
              approachable. Monospace numerals lock timing, tempo and levels into a tidy grid.
            </Text>
            <View className="v2-spec-divider" />
            <Text className="v2-spec-mono">-6.0 dB · 128 BPM · GAIN 0.72</Text>
          </View>
        </View>

        {/* swatches */}
        <View className="v2-section">
          <Text className="v2-eyebrow">Palette</Text>
          <Text className="v2-section-title">Midnight &amp; mint</Text>
          <View className="v2-swatch-row" style={{ marginTop: 16 }}>
            <View>
              <View className="v2-swatch v2-sw-bg" />
              <Text className="v2-swatch-label">Base</Text>
            </View>
            <View>
              <View className="v2-swatch v2-sw-surface" />
              <Text className="v2-swatch-label">Raised</Text>
            </View>
            <View>
              <View className="v2-swatch v2-sw-accent" />
              <Text className="v2-swatch-label">Mint</Text>
            </View>
            <View>
              <View className="v2-swatch v2-sw-violet" />
              <Text className="v2-swatch-label">Violet</Text>
            </View>
            <View>
              <View className="v2-swatch v2-sw-text" />
              <Text className="v2-swatch-label">Text</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

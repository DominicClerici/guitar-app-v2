import { SymbolView } from 'expo-symbols';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import './styles/variant-2.css';

const ON_ACCENT = '#1a0d09';

// Live room-level meter — deterministic bar heights (px). The tallest read as
// the warm stage light, the mids as cool gel, the rest sit in shadow.
const LEVELS = [
  7, 12, 9, 16, 22, 14, 19, 28, 20, 13, 24, 34, 26, 17, 30, 21, 12, 18, 25, 15, 9, 20, 11, 7,
];

const SETLIST = [
  { title: 'Blackbird', meta: 'THE BEATLES · KEY OF G', time: '3:52' },
  { title: 'Wish You Were Here', meta: 'PINK FLOYD · CAPO 0', time: '5:34' },
  { title: 'Tears in Heaven', meta: 'ERIC CLAPTON · KEY OF A', time: '4:16' },
];

function barClass(h: number) {
  if (h >= 30) return 'v2-bar v2-bar-hot';
  if (h >= 22) return 'v2-bar v2-bar-on';
  if (h >= 16) return 'v2-bar v2-bar-cool';
  return 'v2-bar';
}

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
        <View className="flex-row items-start justify-between">
          <View>
            <Text className="v2-greeting">Doors 21:00 · last set</Text>
            <Text className="v2-wordmark">
              After<Text className="v2-wordmark-accent"> hours</Text>
            </Text>
            <View className="v2-live">
              <View className="v2-live-dot" />
              <Text className="v2-live-text">On air</Text>
            </View>
          </View>
        </View>

        {/* hero — on stage now */}
        <View className="v2-feature">
          <View className="v2-feature-pill">
            <SymbolView name="waveform" size={11} tintColor="#ff6a4d" />
            <Text className="v2-feature-pill-text">Now on stage</Text>
          </View>
          <Text className="v2-feature-title">Blackbird</Text>
          <Text className="v2-feature-sub">The Beatles · a fingerstyle study in G</Text>

          <View className="v2-progress-track">
            <View className="v2-progress-fill" />
          </View>
          <Text className="v2-readout">BAR 24 / 38 · 92 BPM · CAPO 3 · −4¢</Text>

          <Pressable className="v2-btn v2-btn-primary">
            <SymbolView name="play.fill" size={15} tintColor={ON_ACCENT} />
            <Text className="v2-btn-primary-text">Take the stage</Text>
          </Pressable>
        </View>

        {/* signature — room level meter */}
        <View className="v2-section">
          <Text className="v2-eyebrow">Live</Text>
          <Text className="v2-section-title">Room level</Text>
          <View className="v2-meter">
            <View className="v2-meter-head">
              <Text className="v2-meter-label">Input · 6th string</Text>
              <Text className="v2-meter-peak">−3.2 dB</Text>
            </View>
            <View className="v2-meter-row">
              {LEVELS.map((h, i) => (
                <View key={i} className={barClass(h)} style={{ height: h }} />
              ))}
            </View>
          </View>
        </View>

        {/* setlist — ticket stubs */}
        <View className="v2-section">
          <Text className="v2-eyebrow">Tonight</Text>
          <Text className="v2-section-title">The setlist</Text>
          <View style={{ marginTop: 6 }}>
            {SETLIST.map((s) => (
              <View key={s.title} className="v2-row">
                <View className="v2-stub-tick" />
                <View className="flex-1">
                  <Text className="v2-row-title">{s.title}</Text>
                  <Text className="v2-row-meta">{s.meta}</Text>
                </View>
                <Text className="v2-row-time">{s.time}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* type specimen */}
        <View className="v2-section">
          <Text className="v2-eyebrow">Type system</Text>
          <Text className="v2-section-title">A late, unhurried voice</Text>
          <View className="v2-spec">
            <Text className="v2-spec-display">
              Encore<Text className="v2-spec-accent">.</Text>
            </Text>
            <Text className="v2-spec-body">
              An italic serif does the singing — warm, close, a little smoky — while monospace keeps
              the tempo, the tuning and the set times honest. One turned up under a single warm light;
              everything else waits in the dark.
            </Text>
            <View className="v2-spec-divider" />
            <Text className="v2-spec-mono">92 BPM · 4/4 · CAPO 3 · −3.2 dB</Text>
          </View>
        </View>

        {/* palette */}
        <View className="v2-section">
          <Text className="v2-eyebrow">Palette</Text>
          <Text className="v2-section-title">Ink &amp; sodium light</Text>
          <View className="v2-swatch-row">
            <View className="flex-1">
              <View className="v2-swatch v2-sw-bg" />
              <Text className="v2-swatch-label">Ink</Text>
            </View>
            <View className="flex-1">
              <View className="v2-swatch v2-sw-surface" />
              <Text className="v2-swatch-label">Raised</Text>
            </View>
            <View className="flex-1">
              <View className="v2-swatch v2-sw-accent" />
              <Text className="v2-swatch-label">Sodium</Text>
            </View>
            <View className="flex-1">
              <View className="v2-swatch v2-sw-cool" />
              <Text className="v2-swatch-label">Gel</Text>
            </View>
            <View className="flex-1">
              <View className="v2-swatch v2-sw-gold" />
              <Text className="v2-swatch-label">Brass</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

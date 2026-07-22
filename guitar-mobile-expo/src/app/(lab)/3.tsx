import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import './styles/variant-3.css';

const CATALOGUE = [
  { n: '01', title: 'Legato Runs', meta: 'A MINOR · 6/8', bpm: '96' },
  { n: '02', title: 'String Skipping', meta: 'C MAJOR · 4/4', bpm: '120' },
  { n: '03', title: 'Hybrid Picking', meta: 'D DORIAN · 4/4', bpm: '84' },
  { n: '04', title: 'Vibrato Control', meta: 'E MINOR · 3/4', bpm: '72' },
];

// 10-segment progress, 6 filled
const SEGMENTS = Array.from({ length: 10 }, (_, i) => i < 6);

export default function Variant3() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      className="v3-root flex-1"
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 96 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="v3-scroll">
        {/* top bar */}
        <View className="v3-topbar">
          <View>
            <Text className="v3-kicker">Mon · 22 Jul</Text>
            <Text className="v3-wordmark">
              Score<Text className="v3-wordmark-accent">.</Text>
            </Text>
          </View>
          <View className="v3-daychip">
            <Text className="v3-daychip-text">WK 29</Text>
          </View>
        </View>

        {/* feature */}
        <View className="v3-feature">
          <View className="v3-feature-top">
            <Text className="v3-feature-label">Now practicing</Text>
            <Text className="v3-feature-num">01 / 04</Text>
          </View>
          <Text className="v3-feature-title">Ex. 4 — Legato Runs</Text>
          <Text className="v3-feature-sub">A minor · target 96 BPM · slur every four</Text>

          <View className="v3-seg-row">
            {SEGMENTS.map((on, i) => (
              <View key={i} className={on ? 'v3-seg v3-seg-on' : 'v3-seg'} />
            ))}
          </View>
          <View className="v3-seg-meta">
            <Text className="v3-mono-label">24 OF 38 BARS</Text>
            <Text className="v3-mono-label">64%</Text>
          </View>

          <Pressable className="v3-btn v3-btn-primary">
            <Text className="v3-btn-primary-text">Begin session →</Text>
          </Pressable>
        </View>

        {/* metrics */}
        <View className="v3-section">
          <View className="v3-section-head">
            <Text className="v3-index">A</Text>
            <Text className="v3-section-title">This week</Text>
            <Text className="v3-section-meta">7 DAYS</Text>
          </View>
          <View className="v3-grid">
            <View className="v3-cell">
              <Text className="v3-cell-num">4:12</Text>
              <Text className="v3-cell-label">Hours</Text>
            </View>
            <View className="v3-cell v3-cell-div">
              <Text className="v3-cell-num v3-cell-num-accent">72</Text>
              <Text className="v3-cell-label">Accuracy %</Text>
            </View>
            <View className="v3-cell v3-cell-div">
              <Text className="v3-cell-num">07</Text>
              <Text className="v3-cell-label">Streak</Text>
            </View>
          </View>
        </View>

        {/* catalogue */}
        <View className="v3-section">
          <View className="v3-section-head">
            <Text className="v3-index">B</Text>
            <Text className="v3-section-title">Exercises</Text>
            <Text className="v3-section-meta">04 ITEMS</Text>
          </View>
          <View>
            {CATALOGUE.map((s) => (
              <View key={s.n} className="v3-row">
                <Text className="v3-row-num">{s.n}</Text>
                <View className="flex-1">
                  <Text className="v3-row-title">{s.title}</Text>
                  <Text className="v3-row-meta">{s.meta}</Text>
                </View>
                <Text className="v3-row-bpm">{s.bpm} BPM</Text>
              </View>
            ))}
          </View>
        </View>

        {/* type specimen */}
        <View className="v3-section">
          <View className="v3-section-head">
            <Text className="v3-index">C</Text>
            <Text className="v3-section-title">Typeface</Text>
            <Text className="v3-section-meta">GROTESK / MONO</Text>
          </View>
          <View className="v3-spec">
            <Text className="v3-spec-display">
              Grid<Text className="v3-spec-accent">.</Text>
            </Text>
            <Text className="v3-spec-body">
              A tightly tracked grotesk does the structural work; monospace handles every number so
              bars, tempos and keys line up to the pixel. Nothing decorative — only what the score
              requires.
            </Text>
            <View className="v3-spec-divider" />
            <Text className="v3-spec-mono">96 BPM · 6/8 · A MINOR · POS. V</Text>
          </View>
        </View>

        {/* palette */}
        <View className="v3-section">
          <View className="v3-section-head">
            <Text className="v3-index">D</Text>
            <Text className="v3-section-title">Palette</Text>
            <Text className="v3-section-meta">05 TOKENS</Text>
          </View>
          <View className="v3-swatch-row">
            <View className="flex-1">
              <View className="v3-swatch v3-sw-bg" />
              <Text className="v3-swatch-label">Paper</Text>
            </View>
            <View className="flex-1">
              <View className="v3-swatch v3-sw-ink" />
              <Text className="v3-swatch-label">Ink</Text>
            </View>
            <View className="flex-1">
              <View className="v3-swatch v3-sw-accent" />
              <Text className="v3-swatch-label">Red</Text>
            </View>
            <View className="flex-1">
              <View className="v3-swatch v3-sw-wash" />
              <Text className="v3-swatch-label">Wash</Text>
            </View>
            <View className="flex-1">
              <View className="v3-swatch v3-sw-line" />
              <Text className="v3-swatch-label">Line</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

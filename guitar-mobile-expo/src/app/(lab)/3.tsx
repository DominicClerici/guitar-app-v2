import { SymbolView } from 'expo-symbols';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import './styles/variant-3.css';

const CHEVRON = '#9fa199';
const ON_INK = '#fdfdfc';

const STATS = [
  { num: '4:12', label: 'Hours', accent: false },
  { num: '72', label: 'Accuracy', accent: true },
  { num: '07', label: 'Streak', accent: false },
];

const SESSIONS = [
  { n: '01', title: 'Legato runs', meta: 'A minor · 6/8', tempo: '96 BPM' },
  { n: '02', title: 'String skipping', meta: 'C major · 4/4', tempo: '120 BPM' },
  { n: '03', title: 'Hybrid picking', meta: 'D dorian · 4/4', tempo: '84 BPM' },
];

export default function Variant3() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      className="v3-root flex-1"
      contentContainerStyle={{ paddingTop: insets.top + 18, paddingBottom: insets.bottom + 96 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="v3-scroll">
        {/* header */}
        <View className="v3-header">
          <View>
            <Text className="v3-kicker">Monday · practice</Text>
            <Text className="v3-wordmark">
              Ateli<Text className="v3-wordmark-bold">er</Text>
            </Text>
          </View>
          <View className="v3-avatar">
            <Text className="v3-avatar-text">DC</Text>
          </View>
        </View>

        {/* hero — floating focus card */}
        <View className="v3-hero">
          <Text className="v3-hero-eyebrow">Today&apos;s focus</Text>
          <Text className="v3-hero-title">Alternate picking</Text>
          <Text className="v3-hero-sub">
            Even down-up strokes across the strings · target 120 BPM
          </Text>

          <View className="v3-gauge">
            <View className="v3-gauge-head">
              <Text className="v3-gauge-big">
                68<Text className="v3-gauge-big-unit">%</Text>
              </Text>
              <Text className="v3-gauge-caption">24 of 38 bars</Text>
            </View>
            <View className="v3-gauge-track">
              <View className="v3-gauge-fill" />
              <View className="v3-gauge-thumb" />
            </View>
          </View>

          <Pressable className="v3-hero-btn">
            <Text className="v3-hero-btn-text">Begin session</Text>
            <View className="v3-hero-btn-icon">
              <SymbolView name="arrow.right" size={12} tintColor={ON_INK} weight="medium" />
            </View>
          </Pressable>
        </View>

        {/* floating stat trio */}
        <View className="v3-stats">
          {STATS.map((s) => (
            <View key={s.label} className="v3-stat">
              <Text className={s.accent ? 'v3-stat-num v3-stat-num-accent' : 'v3-stat-num'}>
                {s.num}
              </Text>
              <Text className="v3-stat-label">{s.label}</Text>
            </View>
          ))}
        </View>

        {/* sessions */}
        <View className="v3-section">
          <View className="v3-eyebrow">
            <View className="v3-eyebrow-dot" />
            <Text className="v3-eyebrow-text">This week</Text>
          </View>
          <Text className="v3-section-title">Studio sessions</Text>
          <View className="v3-list-card">
            {SESSIONS.map((s, i) => (
              <View
                key={s.n}
                className={i === SESSIONS.length - 1 ? 'v3-row v3-row-last' : 'v3-row'}
              >
                <Text className="v3-row-index">{s.n}</Text>
                <View className="flex-1">
                  <Text className="v3-row-title">{s.title}</Text>
                  <Text className="v3-row-meta">{s.meta}</Text>
                </View>
                <Text className="v3-row-tempo">{s.tempo}</Text>
                <View className="v3-row-chevron">
                  <SymbolView name="chevron.right" size={11} tintColor={CHEVRON} weight="semibold" />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* type specimen */}
        <View className="v3-section">
          <View className="v3-eyebrow">
            <View className="v3-eyebrow-dot" />
            <Text className="v3-eyebrow-text">Type system</Text>
          </View>
          <Text className="v3-section-title">Air &amp; structure</Text>
          <View className="v3-spec">
            <Text className="v3-spec-display">
              Poise<Text className="v3-spec-accent">.</Text>
            </Text>
            <Text className="v3-spec-body">
              One family carries every role. Weight and scale do the work that a second typeface
              usually would — a hairline 200 for display, a calm 400 for reading — so the interface
              stays quiet while the hierarchy stays unmistakable.
            </Text>
            <View className="v3-spec-divider" />
            <Text className="v3-spec-mono">120 BPM · 4/4 · POS. V · +2 semitones</Text>
          </View>
        </View>

        {/* palette */}
        <View className="v3-section">
          <View className="v3-eyebrow">
            <View className="v3-eyebrow-dot" />
            <Text className="v3-eyebrow-text">Palette</Text>
          </View>
          <Text className="v3-section-title">Bone, ink &amp; verdigris</Text>
          <View className="v3-swatch-row">
            {[
              { cls: 'v3-sw-bone', label: 'Bone' },
              { cls: 'v3-sw-ink', label: 'Ink' },
              { cls: 'v3-sw-verd', label: 'Verdigris' },
              { cls: 'v3-sw-surface', label: 'Surface' },
              { cls: 'v3-sw-line', label: 'Line' },
            ].map((s) => (
              <View key={s.label} className="flex-1">
                <View className={`v3-swatch ${s.cls}`} />
                <Text className="v3-swatch-label">{s.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

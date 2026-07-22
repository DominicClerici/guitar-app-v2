import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import './styles/variant-1.css';

// icon tints — the only place the palette is mirrored in JS (SymbolView needs a color prop)
const ACCENT = '#b4551f';
const FAINT = '#a99a88';

const TILES: { icon: SymbolViewProps['name']; label: string }[] = [
  { icon: 'tuningfork', label: 'Tuner' },
  { icon: 'metronome', label: 'Metronome' },
  { icon: 'guitars', label: 'Chords' },
  { icon: 'music.note.list', label: 'Library' },
];

const LIBRARY = [
  { n: 'I', title: 'Blackbird', meta: 'THE BEATLES · KEY OF G', tag: 'Learning' },
  { n: 'II', title: 'Dust in the Wind', meta: 'KANSAS · TRAVIS PICKING', tag: 'Review' },
  { n: 'III', title: 'Tears in Heaven', meta: 'ERIC CLAPTON · KEY OF A', tag: 'New' },
  { n: 'IV', title: 'Landslide', meta: 'FLEETWOOD MAC · CAPO 3', tag: 'Mastered' },
];

export default function Variant1() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      className="v1-root flex-1"
      contentContainerStyle={{ paddingTop: insets.top + 14, paddingBottom: insets.bottom + 96 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="v1-scroll">
        {/* top bar */}
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="v1-greeting">Good evening</Text>
            <Text className="v1-wordmark">
              Fret<Text className="v1-wordmark-accent">work</Text>
            </Text>
          </View>
          <View className="v1-avatar">
            <Text className="v1-avatar-text">DC</Text>
          </View>
        </View>

        {/* feature card */}
        <View className="v1-section">
          <View className="v1-feature">
            <View className="v1-feature-row">
              <SymbolView name="book.pages" size={13} tintColor={FAINT} />
              <Text className="v1-feature-kicker">Continue practice</Text>
            </View>
            <Text className="v1-feature-title">Blackbird</Text>
            <Text className="v1-feature-sub">The Beatles · Fingerstyle study in G</Text>

            <View className="v1-progress-track">
              <View className="v1-progress-fill" />
            </View>
            <View className="v1-progress-meta">
              <Text className="v1-progress-label">BAR 24 / 38</Text>
              <Text className="v1-progress-label">64%</Text>
            </View>

            <Pressable className="v1-btn v1-btn-primary">
              <SymbolView name="play.fill" size={15} tintColor="#fdf6ee" />
              <Text className="v1-btn-primary-text">Resume session</Text>
            </Pressable>
          </View>
        </View>

        {/* quick actions */}
        <View className="v1-section">
          <Text className="v1-eyebrow">Practice tools</Text>
          <Text className="v1-section-title">Warm up</Text>
          <View className="v1-tile-row" style={{ marginTop: 16 }}>
            {TILES.map((t) => (
              <View key={t.label} className="v1-tile">
                <View className="v1-tile-badge">
                  <SymbolView name={t.icon} size={19} tintColor={ACCENT} />
                </View>
                <Text className="v1-tile-label">{t.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* library */}
        <View className="v1-section">
          <Text className="v1-eyebrow">Repertoire</Text>
          <Text className="v1-section-title">Your library</Text>
          <View style={{ marginTop: 8 }}>
            {LIBRARY.map((s) => (
              <View key={s.title} className="v1-row">
                <Text className="v1-row-num">{s.n}</Text>
                <View className="flex-1">
                  <Text className="v1-row-title">{s.title}</Text>
                  <Text className="v1-row-meta">{s.meta}</Text>
                </View>
                <View className="v1-row-tag">
                  <Text className="v1-row-tag-text">{s.tag}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* type specimen */}
        <View className="v1-section">
          <Text className="v1-eyebrow">Type system</Text>
          <Text className="v1-section-title">A quiet, literary voice</Text>
          <View className="v1-spec" style={{ marginTop: 16 }}>
            <Text className="v1-spec-display">Andante</Text>
            <Text className="v1-spec-body">
              A serif display paired with a clean humanist body — warm, patient, and made for long
              reading. Numerals set in monospace keep tempo and tablature perfectly aligned.
            </Text>
            <View className="v1-spec-divider" />
            <Text className="v1-spec-mono">120 BPM · 4/4 · CAPO 3 · DROP D</Text>
          </View>
        </View>

        {/* swatches */}
        <View className="v1-section">
          <Text className="v1-eyebrow">Palette</Text>
          <Text className="v1-section-title">Parchment &amp; amber</Text>
          <View className="v1-swatch-row" style={{ marginTop: 16 }}>
            <View>
              <View className="v1-swatch v1-sw-bg" />
              <Text className="v1-swatch-label">Paper</Text>
            </View>
            <View>
              <View className="v1-swatch v1-sw-ink" />
              <Text className="v1-swatch-label">Ink</Text>
            </View>
            <View>
              <View className="v1-swatch v1-sw-accent" />
              <Text className="v1-swatch-label">Amber</Text>
            </View>
            <View>
              <View className="v1-swatch v1-sw-gold" />
              <Text className="v1-swatch-label">Brass</Text>
            </View>
            <View>
              <View className="v1-swatch v1-sw-wash" />
              <Text className="v1-swatch-label">Wash</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

import { SymbolView } from 'expo-symbols';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import './styles/variant-1.css';

const ON_ACCENT = '#f2efe7';
const GHOST_ICON = '#6f6a5f';

// Precision tuner scale — 25 graduations. The centre reads in tune (ink),
// every fifth tick is a major graduation, the rest are fine.
const TICKS = Array.from({ length: 25 }, (_, i) => i);
const CENTER = 12;
function tickClass(i: number) {
  if (i === CENTER) return 'v1-tick-center';
  if (i % 5 === 0) return 'v1-tick v1-tick-major';
  return 'v1-tick';
}

const TILES = [
  { num: '14', label: 'Streak', accent: false },
  { num: '92%', label: 'Accuracy', accent: true },
  { num: '3.2h', label: 'This week', accent: false },
];

const SETLIST = [
  { n: '01', title: 'Blackbird', meta: 'THE BEATLES · FINGERSTYLE', key: 'G' },
  { n: '02', title: 'Wish You Were Here', meta: 'PINK FLOYD · ACOUSTIC', key: 'G' },
  { n: '03', title: 'Tears in Heaven', meta: 'CLAPTON · FINGERSTYLE', key: 'A' },
];

export default function Variant1() {
  const insets = useSafeAreaInsets();

  return (
    <View className="variant-1-root flex-1">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 20,
          paddingBottom: insets.bottom + 96,
          paddingHorizontal: 22,
        }}
      >
        {/* header */}
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="v1-device">Practice unit</Text>
            <Text className="v1-brand">
              Étu<Text className="v1-brand-accent">de</Text>
            </Text>
          </View>
          <View className="v1-opus">
            <Text className="v1-opus-no">01</Text>
            <Text className="v1-opus-label">Study</Text>
          </View>
        </View>

        {/* machined hero */}
        <View className="v1-tray" style={{ marginTop: 24 }}>
          <View className="v1-face">
            <View className="v1-face-topline">
              <Text className="v1-eyebrow">Now playing</Text>
              <Text className="v1-face-index">01 / 03</Text>
            </View>
            <Text className="v1-face-title">Blackbird</Text>
            <Text className="v1-face-sub">The Beatles · a fingerstyle study in G</Text>
            <View className="v1-readout">
              <Text className="v1-readout-time">03:12</Text>
              <Text className="v1-readout-meta">92 BPM · 4/4 · CAPO 3</Text>
            </View>

            <View className="v1-transport">
              <Pressable className="v1-btn-primary">
                <SymbolView name="play.fill" size={14} tintColor={ON_ACCENT} />
                <Text className="v1-btn-primary-text">Resume</Text>
              </Pressable>
              <Pressable className="v1-btn-ghost">
                <SymbolView name="metronome" size={18} tintColor={GHOST_ICON} />
              </Pressable>
            </View>
          </View>
        </View>

        {/* signature — tuner scale */}
        <View className="v1-section">
          <View className="v1-section-head">
            <Text className="v1-section-title">Tuner</Text>
            <Text className="v1-section-meta">440 Hz · standard</Text>
          </View>
          <View className="v1-tuner">
            <View className="v1-tuner-head">
              <Text className="v1-tuner-note">
                A<Text className="v1-tuner-note-sub"> · 110.0 Hz</Text>
              </Text>
              <Text className="v1-tuner-cents">−0.4 ¢</Text>
            </View>
            <View className="v1-tuner-scale">
              {TICKS.map((i) => (
                <View key={i} className={tickClass(i)} />
              ))}
            </View>
            <View className="v1-tuner-baseline" />
            <View className="v1-tuner-labels">
              <Text className="v1-tuner-label">−50</Text>
              <Text className="v1-tuner-label">IN TUNE</Text>
              <Text className="v1-tuner-label">+50</Text>
            </View>
          </View>
        </View>

        {/* machined stat tiles */}
        <View className="v1-tiles">
          {TILES.map((t) => (
            <View key={t.label} className="v1-tile">
              <Text className={t.accent ? 'v1-tile-num v1-tile-num-accent' : 'v1-tile-num'}>
                {t.num}
              </Text>
              <Text className="v1-tile-label">{t.label}</Text>
            </View>
          ))}
        </View>

        {/* setlist */}
        <View className="v1-section">
          <View className="v1-section-head">
            <Text className="v1-section-title">Setlist</Text>
            <Text className="v1-section-meta">03 CUTS</Text>
          </View>
          <View style={{ marginTop: 4 }}>
            {SETLIST.map((s) => (
              <View key={s.n} className="v1-slot">
                <Text className="v1-slot-index">{s.n}</Text>
                <View className="flex-1">
                  <Text className="v1-slot-title">{s.title}</Text>
                  <Text className="v1-slot-meta">{s.meta}</Text>
                </View>
                <View className="v1-slot-key">
                  <Text className="v1-slot-key-text">{s.key}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* type specimen */}
        <View className="v1-section">
          <View className="v1-section-head">
            <Text className="v1-section-title">Type</Text>
            <Text className="v1-section-meta">GROTESK / MONO</Text>
          </View>
          <View className="v1-spec">
            <Text className="v1-spec-display">
              Plainspoken<Text className="v1-spec-accent">.</Text>
            </Text>
            <Text className="v1-spec-body">
              A tight grotesk holds the titles at low contrast; monospace runs every reading — time,
              tempo, cents — so the numbers align like an instrument face. One ink on warm paper.
              Nothing raised that doesn&apos;t earn its shadow.
            </Text>
            <View className="v1-spec-divider" />
            <Text className="v1-spec-mono">92 BPM · 4/4 · CAPO 3 · −0.4 ¢</Text>
          </View>
        </View>

        {/* palette */}
        <View className="v1-section">
          <View className="v1-section-head">
            <Text className="v1-section-title">Palette</Text>
            <Text className="v1-section-meta">05 TOKENS</Text>
          </View>
          <View className="v1-swatch-row">
            {[
              { cls: 'v1-sw-bg', label: 'Paper' },
              { cls: 'v1-sw-surface', label: 'Raised' },
              { cls: 'v1-sw-ink', label: 'Ink' },
              { cls: 'v1-sw-graphite', label: 'Graphite' },
              { cls: 'v1-sw-line', label: 'Line' },
            ].map((s) => (
              <View key={s.label} className="flex-1">
                <View className={`v1-swatch ${s.cls}`} />
                <Text className="v1-swatch-label">{s.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

import { SymbolView } from 'expo-symbols';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import './styles/variant-4.css';

const ON_CHAMP = '#1a1408';
const GHOST_ICON = '#a4a199';

// Precision tuner scale — 25 graduations. The centre reads in tune (champagne),
// every fifth tick is a major graduation, the rest are fine.
const TICKS = Array.from({ length: 25 }, (_, i) => i);
const CENTER = 12;
function tickClass(i: number) {
  if (i === CENTER) return 'v4-tick-center';
  if (i % 5 === 0) return 'v4-tick v4-tick-major';
  return 'v4-tick';
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

export default function Variant4() {
  const insets = useSafeAreaInsets();

  return (
    <View className="variant-4-root flex-1">
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
            <Text className="v4-device">Practice unit</Text>
            <Text className="v4-brand">
              Noctur<Text className="v4-brand-accent">ne</Text>
            </Text>
          </View>
          <View className="v4-opus">
            <Text className="v4-opus-no">04</Text>
            <Text className="v4-opus-label">Opus</Text>
          </View>
        </View>

        {/* machined hero */}
        <View className="v4-tray" style={{ marginTop: 24 }}>
          <View className="v4-face">
            <View className="v4-face-topline">
              <Text className="v4-eyebrow">Now playing</Text>
              <Text className="v4-face-index">01 / 03</Text>
            </View>
            <Text className="v4-face-title">Blackbird</Text>
            <Text className="v4-face-sub">The Beatles · a fingerstyle study in G</Text>
            <View className="v4-readout">
              <Text className="v4-readout-time">03:12</Text>
              <Text className="v4-readout-meta">92 BPM · 4/4 · CAPO 3</Text>
            </View>

            <View className="v4-transport">
              <Pressable className="v4-btn-primary">
                <SymbolView name="play.fill" size={14} tintColor={ON_CHAMP} />
                <Text className="v4-btn-primary-text">Resume</Text>
              </Pressable>
              <Pressable className="v4-btn-ghost">
                <SymbolView name="metronome" size={18} tintColor={GHOST_ICON} />
              </Pressable>
            </View>
          </View>
        </View>

        {/* signature — tuner scale */}
        <View className="v4-section">
          <View className="v4-section-head">
            <Text className="v4-section-title">Tuner</Text>
            <Text className="v4-section-meta">440 Hz · standard</Text>
          </View>
          <View className="v4-tuner">
            <View className="v4-tuner-head">
              <Text className="v4-tuner-note">
                A<Text className="v4-tuner-note-sub"> · 110.0 Hz</Text>
              </Text>
              <Text className="v4-tuner-cents">−0.4 ¢</Text>
            </View>
            <View className="v4-tuner-scale">
              {TICKS.map((i) => (
                <View key={i} className={tickClass(i)} />
              ))}
            </View>
            <View className="v4-tuner-baseline" />
            <View className="v4-tuner-labels">
              <Text className="v4-tuner-label">−50</Text>
              <Text className="v4-tuner-label">IN TUNE</Text>
              <Text className="v4-tuner-label">+50</Text>
            </View>
          </View>
        </View>

        {/* machined stat tiles */}
        <View className="v4-tiles">
          {TILES.map((t) => (
            <View key={t.label} className="v4-tile">
              <Text className={t.accent ? 'v4-tile-num v4-tile-num-accent' : 'v4-tile-num'}>
                {t.num}
              </Text>
              <Text className="v4-tile-label">{t.label}</Text>
            </View>
          ))}
        </View>

        {/* setlist */}
        <View className="v4-section">
          <View className="v4-section-head">
            <Text className="v4-section-title">Setlist</Text>
            <Text className="v4-section-meta">03 CUTS</Text>
          </View>
          <View style={{ marginTop: 4 }}>
            {SETLIST.map((s) => (
              <View key={s.n} className="v4-slot">
                <Text className="v4-slot-index">{s.n}</Text>
                <View className="flex-1">
                  <Text className="v4-slot-title">{s.title}</Text>
                  <Text className="v4-slot-meta">{s.meta}</Text>
                </View>
                <View className="v4-slot-key">
                  <Text className="v4-slot-key-text">{s.key}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* type specimen */}
        <View className="v4-section">
          <View className="v4-section-head">
            <Text className="v4-section-title">Type</Text>
            <Text className="v4-section-meta">GROTESK / MONO</Text>
          </View>
          <View className="v4-spec">
            <Text className="v4-spec-display">
              Precise<Text className="v4-spec-accent">.</Text>
            </Text>
            <Text className="v4-spec-body">
              A tight grotesk holds the titles at low contrast; monospace runs every reading — time,
              tempo, cents — so the numbers align like an instrument face. One warm metal against
              cool graphite. Nothing lit that doesn&apos;t need to be.
            </Text>
            <View className="v4-spec-divider" />
            <Text className="v4-spec-mono">92 BPM · 4/4 · CAPO 3 · −0.4 ¢</Text>
          </View>
        </View>

        {/* palette */}
        <View className="v4-section">
          <View className="v4-section-head">
            <Text className="v4-section-title">Palette</Text>
            <Text className="v4-section-meta">05 TOKENS</Text>
          </View>
          <View className="v4-swatch-row">
            {[
              { cls: 'v4-sw-bg', label: 'Graphite' },
              { cls: 'v4-sw-surface', label: 'Raised' },
              { cls: 'v4-sw-champ', label: 'Champagne' },
              { cls: 'v4-sw-bright', label: 'Highlight' },
              { cls: 'v4-sw-line', label: 'Line' },
            ].map((s) => (
              <View key={s.label} className="flex-1">
                <View className={`v4-swatch ${s.cls}`} />
                <Text className="v4-swatch-label">{s.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

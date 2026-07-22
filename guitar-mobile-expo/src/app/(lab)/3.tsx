import { SymbolView } from 'expo-symbols';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import './styles/variant-3.css';

const ON_ACCENT = '#14161a';
const GHOST_ICON = '#9ca0a8';

// Precision tuner scale — 25 graduations. The centre reads in tune (silver),
// every fifth tick is a major graduation, the rest are fine.
const TICKS = Array.from({ length: 25 }, (_, i) => i);
const CENTER = 12;
function tickClass(i: number) {
  if (i === CENTER) return 'v3-tick-center';
  if (i % 5 === 0) return 'v3-tick v3-tick-major';
  return 'v3-tick';
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

export default function Variant3() {
  const insets = useSafeAreaInsets();

  return (
    <View className="variant-3-root flex-1">
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
            <Text className="v3-device">Practice unit</Text>
            <Text className="v3-brand">
              Tac<Text className="v3-brand-accent">et</Text>
            </Text>
          </View>
          <View className="v3-opus">
            <Text className="v3-opus-no">03</Text>
            <Text className="v3-opus-label">Study</Text>
          </View>
        </View>

        {/* machined hero */}
        <View className="v3-tray" style={{ marginTop: 24 }}>
          <View className="v3-face">
            <View className="v3-face-topline">
              <Text className="v3-eyebrow">Now playing</Text>
              <Text className="v3-face-index">01 / 03</Text>
            </View>
            <Text className="v3-face-title">Blackbird</Text>
            <Text className="v3-face-sub">The Beatles · a fingerstyle study in G</Text>
            <View className="v3-readout">
              <Text className="v3-readout-time">03:12</Text>
              <Text className="v3-readout-meta">92 BPM · 4/4 · CAPO 3</Text>
            </View>

            <View className="v3-transport">
              <Pressable className="v3-btn-primary">
                <SymbolView name="play.fill" size={14} tintColor={ON_ACCENT} />
                <Text className="v3-btn-primary-text">Resume</Text>
              </Pressable>
              <Pressable className="v3-btn-ghost">
                <SymbolView name="metronome" size={18} tintColor={GHOST_ICON} />
              </Pressable>
            </View>
          </View>
        </View>

        {/* signature — tuner scale */}
        <View className="v3-section">
          <View className="v3-section-head">
            <Text className="v3-section-title">Tuner</Text>
            <Text className="v3-section-meta">440 Hz · standard</Text>
          </View>
          <View className="v3-tuner">
            <View className="v3-tuner-head">
              <Text className="v3-tuner-note">
                A<Text className="v3-tuner-note-sub"> · 110.0 Hz</Text>
              </Text>
              <Text className="v3-tuner-cents">−0.4 ¢</Text>
            </View>
            <View className="v3-tuner-scale">
              {TICKS.map((i) => (
                <View key={i} className={tickClass(i)} />
              ))}
            </View>
            <View className="v3-tuner-baseline" />
            <View className="v3-tuner-labels">
              <Text className="v3-tuner-label">−50</Text>
              <Text className="v3-tuner-label">IN TUNE</Text>
              <Text className="v3-tuner-label">+50</Text>
            </View>
          </View>
        </View>

        {/* machined stat tiles */}
        <View className="v3-tiles">
          {TILES.map((t) => (
            <View key={t.label} className="v3-tile">
              <Text className={t.accent ? 'v3-tile-num v3-tile-num-accent' : 'v3-tile-num'}>
                {t.num}
              </Text>
              <Text className="v3-tile-label">{t.label}</Text>
            </View>
          ))}
        </View>

        {/* setlist */}
        <View className="v3-section">
          <View className="v3-section-head">
            <Text className="v3-section-title">Setlist</Text>
            <Text className="v3-section-meta">03 CUTS</Text>
          </View>
          <View style={{ marginTop: 4 }}>
            {SETLIST.map((s) => (
              <View key={s.n} className="v3-slot">
                <Text className="v3-slot-index">{s.n}</Text>
                <View className="flex-1">
                  <Text className="v3-slot-title">{s.title}</Text>
                  <Text className="v3-slot-meta">{s.meta}</Text>
                </View>
                <View className="v3-slot-key">
                  <Text className="v3-slot-key-text">{s.key}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* type specimen */}
        <View className="v3-section">
          <View className="v3-section-head">
            <Text className="v3-section-title">Type</Text>
            <Text className="v3-section-meta">GROTESK / MONO</Text>
          </View>
          <View className="v3-spec">
            <Text className="v3-spec-display">
              Silver<Text className="v3-spec-accent">.</Text>
            </Text>
            <Text className="v3-spec-body">
              A tight grotesk holds the titles at low contrast; monospace runs every reading — time,
              tempo, cents — so the numbers align like an instrument face. No colour at all: only
              graphite and the cold light it catches.
            </Text>
            <View className="v3-spec-divider" />
            <Text className="v3-spec-mono">92 BPM · 4/4 · CAPO 3 · −0.4 ¢</Text>
          </View>
        </View>

        {/* palette */}
        <View className="v3-section">
          <View className="v3-section-head">
            <Text className="v3-section-title">Palette</Text>
            <Text className="v3-section-meta">05 TOKENS</Text>
          </View>
          <View className="v3-swatch-row">
            {[
              { cls: 'v3-sw-bg', label: 'Graphite' },
              { cls: 'v3-sw-surface', label: 'Raised' },
              { cls: 'v3-sw-silver', label: 'Silver' },
              { cls: 'v3-sw-bright', label: 'Highlight' },
              { cls: 'v3-sw-line', label: 'Line' },
            ].map((s) => (
              <View key={s.label} className="flex-1">
                <View className={`v3-swatch ${s.cls}`} />
                <Text className="v3-swatch-label">{s.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

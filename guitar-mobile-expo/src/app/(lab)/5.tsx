import { SymbolView } from 'expo-symbols';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import './styles/variant-5.css';

const ON_ACCENT = '#04211f';
const GHOST_ICON = '#9aa0aa';

// Precision tuner scale — 25 graduations. The centre reads in tune (aqua),
// every fifth tick is a major graduation, the rest are fine.
const TICKS = Array.from({ length: 25 }, (_, i) => i);
const CENTER = 12;
function tickClass(i: number) {
  if (i === CENTER) return 'v5-tick-center';
  if (i % 5 === 0) return 'v5-tick v5-tick-major';
  return 'v5-tick';
}

// Colour carries information here: each stat and each key gets its own hue,
// so the palette is legible at a glance instead of decorative.
const TILES = [
  { num: '14', label: 'Streak', hue: 'aqua' },
  { num: '92%', label: 'Accuracy', hue: 'rose' },
  { num: '3.2h', label: 'This week', hue: 'violet' },
];

const SETLIST = [
  { n: '01', title: 'Blackbird', meta: 'THE BEATLES · FINGERSTYLE', key: 'G', hue: 'aqua' },
  { n: '02', title: 'Georgia on My Mind', meta: 'RAY CHARLES · JAZZ', key: 'F', hue: 'amber' },
  { n: '03', title: 'Tears in Heaven', meta: 'CLAPTON · FINGERSTYLE', key: 'A', hue: 'rose' },
];

export default function Variant5() {
  const insets = useSafeAreaInsets();

  return (
    <View className="variant-5-root flex-1">
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
            <Text className="v5-device">Practice unit</Text>
            <Text className="v5-brand">
              Auro<Text className="v5-brand-accent">ra</Text>
            </Text>
          </View>
          <View className="v5-opus">
            <Text className="v5-opus-no">05</Text>
            <Text className="v5-opus-label">Study</Text>
          </View>
        </View>

        {/* machined hero */}
        <View className="v5-tray" style={{ marginTop: 24 }}>
          <View className="v5-face">
            <View className="v5-face-topline">
              <Text className="v5-eyebrow">Now playing</Text>
              <Text className="v5-face-index">01 / 03</Text>
            </View>
            <Text className="v5-face-title">Blackbird</Text>
            <Text className="v5-face-sub">The Beatles · a fingerstyle study in G</Text>
            <View className="v5-readout">
              <Text className="v5-readout-time">03:12</Text>
              <Text className="v5-readout-meta">92 BPM · 4/4 · CAPO 3</Text>
            </View>

            <View className="v5-transport">
              <Pressable className="v5-btn-primary">
                <SymbolView name="play.fill" size={14} tintColor={ON_ACCENT} />
                <Text className="v5-btn-primary-text">Resume</Text>
              </Pressable>
              <Pressable className="v5-btn-ghost">
                <SymbolView name="metronome" size={18} tintColor={GHOST_ICON} />
              </Pressable>
            </View>
          </View>
        </View>

        {/* signature — tuner scale */}
        <View className="v5-section">
          <View className="v5-section-head">
            <Text className="v5-section-title">Tuner</Text>
            <Text className="v5-section-meta">440 Hz · standard</Text>
          </View>
          <View className="v5-tuner">
            <View className="v5-tuner-head">
              <Text className="v5-tuner-note">
                A<Text className="v5-tuner-note-sub"> · 110.0 Hz</Text>
              </Text>
              <Text className="v5-tuner-cents">−0.4 ¢</Text>
            </View>
            <View className="v5-tuner-scale">
              {TICKS.map((i) => (
                <View key={i} className={tickClass(i)} />
              ))}
            </View>
            <View className="v5-tuner-baseline" />
            <View className="v5-tuner-labels">
              <Text className="v5-tuner-label">−50</Text>
              <Text className="v5-tuner-label">IN TUNE</Text>
              <Text className="v5-tuner-label">+50</Text>
            </View>
          </View>
        </View>

        {/* machined stat tiles */}
        <View className="v5-tiles">
          {TILES.map((t) => (
            <View key={t.label} className="v5-tile">
              <Text className={`v5-tile-num v5-tile-num-${t.hue}`}>{t.num}</Text>
              <Text className="v5-tile-label">{t.label}</Text>
            </View>
          ))}
        </View>

        {/* setlist */}
        <View className="v5-section">
          <View className="v5-section-head">
            <Text className="v5-section-title">Setlist</Text>
            <Text className="v5-section-meta">HUE = KEY</Text>
          </View>
          <View style={{ marginTop: 4 }}>
            {SETLIST.map((s) => (
              <View key={s.n} className="v5-slot">
                <Text className={`v5-slot-index v5-ink-${s.hue}`}>{s.n}</Text>
                <View className="flex-1">
                  <Text className="v5-slot-title">{s.title}</Text>
                  <Text className="v5-slot-meta">{s.meta}</Text>
                </View>
                <View className={`v5-slot-key v5-key-${s.hue}`}>
                  <Text className={`v5-slot-key-text v5-ink-${s.hue}`}>{s.key}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* type specimen */}
        <View className="v5-section">
          <View className="v5-section-head">
            <Text className="v5-section-title">Type</Text>
            <Text className="v5-section-meta">GROTESK / MONO</Text>
          </View>
          <View className="v5-spec">
            <Text className="v5-spec-display">
              Spectra<Text className="v5-spec-accent">.</Text>
            </Text>
            <Text className="v5-spec-body">
              A tight grotesk holds the titles; monospace runs every reading — time, tempo, cents.
              Colour is never decoration: each hue is bound to a key, so the setlist glows like a
              console before a single word is parsed.
            </Text>
            <View className="v5-spec-divider" />
            <Text className="v5-spec-mono">92 BPM · 4/4 · CAPO 3 · −0.4 ¢</Text>
          </View>
        </View>

        {/* palette */}
        <View className="v5-section">
          <View className="v5-section-head">
            <Text className="v5-section-title">Palette</Text>
            <Text className="v5-section-meta">05 TOKENS</Text>
          </View>
          <View className="v5-swatch-row">
            {[
              { cls: 'v5-sw-bg', label: 'Graphite' },
              { cls: 'v5-sw-aqua', label: 'Aqua' },
              { cls: 'v5-sw-rose', label: 'Rose' },
              { cls: 'v5-sw-amber', label: 'Amber' },
              { cls: 'v5-sw-violet', label: 'Violet' },
            ].map((s) => (
              <View key={s.label} className="flex-1">
                <View className={`v5-swatch ${s.cls}`} />
                <Text className="v5-swatch-label">{s.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

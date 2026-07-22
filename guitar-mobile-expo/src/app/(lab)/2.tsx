import { SymbolView } from 'expo-symbols';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import './styles/variant-2.css';

const ON_ACCENT = '#f7f4ee';
const GHOST_ICON = '#6e685c';

// Precision tuner scale — 25 graduations. The centre reads in tune (indigo),
// every fifth tick is a major graduation, the rest are fine.
const TICKS = Array.from({ length: 25 }, (_, i) => i);
const CENTER = 12;
function tickClass(i: number) {
  if (i === CENTER) return 'v2-tick-center';
  if (i % 5 === 0) return 'v2-tick v2-tick-major';
  return 'v2-tick';
}

// Colour carries information here: each stat and each key gets its own hue,
// so the palette is legible at a glance instead of decorative.
const TILES = [
  { num: '14', label: 'Streak', hue: 'teal' },
  { num: '92%', label: 'Accuracy', hue: 'rose' },
  { num: '3.2h', label: 'This week', hue: 'plum' },
];

const SETLIST = [
  { n: '01', title: 'Blackbird', meta: 'THE BEATLES · FINGERSTYLE', key: 'G', hue: 'teal' },
  { n: '02', title: 'Georgia on My Mind', meta: 'RAY CHARLES · JAZZ', key: 'F', hue: 'amber' },
  { n: '03', title: 'Tears in Heaven', meta: 'CLAPTON · FINGERSTYLE', key: 'A', hue: 'rose' },
];

export default function Variant2() {
  const insets = useSafeAreaInsets();

  return (
    <View className="variant-2-root flex-1">
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
            <Text className="v2-device">Practice unit</Text>
            <Text className="v2-brand">
              Solf<Text className="v2-brand-accent">ège</Text>
            </Text>
          </View>
          <View className="v2-opus">
            <Text className="v2-opus-no">02</Text>
            <Text className="v2-opus-label">Study</Text>
          </View>
        </View>

        {/* machined hero */}
        <View className="v2-tray" style={{ marginTop: 24 }}>
          <View className="v2-face">
            <View className="v2-face-topline">
              <Text className="v2-eyebrow">Now playing</Text>
              <Text className="v2-face-index">01 / 03</Text>
            </View>
            <Text className="v2-face-title">Blackbird</Text>
            <Text className="v2-face-sub">The Beatles · a fingerstyle study in G</Text>
            <View className="v2-readout">
              <Text className="v2-readout-time">03:12</Text>
              <Text className="v2-readout-meta">92 BPM · 4/4 · CAPO 3</Text>
            </View>

            <View className="v2-transport">
              <Pressable className="v2-btn-primary">
                <SymbolView name="play.fill" size={14} tintColor={ON_ACCENT} />
                <Text className="v2-btn-primary-text">Resume</Text>
              </Pressable>
              <Pressable className="v2-btn-ghost">
                <SymbolView name="metronome" size={18} tintColor={GHOST_ICON} />
              </Pressable>
            </View>
          </View>
        </View>

        {/* signature — tuner scale */}
        <View className="v2-section">
          <View className="v2-section-head">
            <Text className="v2-section-title">Tuner</Text>
            <Text className="v2-section-meta">440 Hz · standard</Text>
          </View>
          <View className="v2-tuner">
            <View className="v2-tuner-head">
              <Text className="v2-tuner-note">
                A<Text className="v2-tuner-note-sub"> · 110.0 Hz</Text>
              </Text>
              <Text className="v2-tuner-cents">−0.4 ¢</Text>
            </View>
            <View className="v2-tuner-scale">
              {TICKS.map((i) => (
                <View key={i} className={tickClass(i)} />
              ))}
            </View>
            <View className="v2-tuner-baseline" />
            <View className="v2-tuner-labels">
              <Text className="v2-tuner-label">−50</Text>
              <Text className="v2-tuner-label">IN TUNE</Text>
              <Text className="v2-tuner-label">+50</Text>
            </View>
          </View>
        </View>

        {/* machined stat tiles */}
        <View className="v2-tiles">
          {TILES.map((t) => (
            <View key={t.label} className="v2-tile">
              <Text className={`v2-tile-num v2-tile-num-${t.hue}`}>{t.num}</Text>
              <Text className="v2-tile-label">{t.label}</Text>
            </View>
          ))}
        </View>

        {/* setlist */}
        <View className="v2-section">
          <View className="v2-section-head">
            <Text className="v2-section-title">Setlist</Text>
            <Text className="v2-section-meta">HUE = KEY</Text>
          </View>
          <View style={{ marginTop: 4 }}>
            {SETLIST.map((s) => (
              <View key={s.n} className="v2-slot">
                <Text className={`v2-slot-index v2-ink-${s.hue}`}>{s.n}</Text>
                <View className="flex-1">
                  <Text className="v2-slot-title">{s.title}</Text>
                  <Text className="v2-slot-meta">{s.meta}</Text>
                </View>
                <View className={`v2-slot-key v2-key-${s.hue}`}>
                  <Text className={`v2-slot-key-text v2-ink-${s.hue}`}>{s.key}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* type specimen */}
        <View className="v2-section">
          <View className="v2-section-head">
            <Text className="v2-section-title">Type</Text>
            <Text className="v2-section-meta">GROTESK / MONO</Text>
          </View>
          <View className="v2-spec">
            <Text className="v2-spec-display">
              Chromatic<Text className="v2-spec-accent">.</Text>
            </Text>
            <Text className="v2-spec-body">
              A tight grotesk holds the titles; monospace runs every reading — time, tempo, cents.
              Colour is never decoration: each hue is bound to a key, so the setlist reads like a
              score before a single word is parsed.
            </Text>
            <View className="v2-spec-divider" />
            <Text className="v2-spec-mono">92 BPM · 4/4 · CAPO 3 · −0.4 ¢</Text>
          </View>
        </View>

        {/* palette */}
        <View className="v2-section">
          <View className="v2-section-head">
            <Text className="v2-section-title">Palette</Text>
            <Text className="v2-section-meta">05 TOKENS</Text>
          </View>
          <View className="v2-swatch-row">
            {[
              { cls: 'v2-sw-bg', label: 'Paper' },
              { cls: 'v2-sw-indigo', label: 'Indigo' },
              { cls: 'v2-sw-teal', label: 'Teal' },
              { cls: 'v2-sw-amber', label: 'Amber' },
              { cls: 'v2-sw-rose', label: 'Rose' },
            ].map((s) => (
              <View key={s.label} className="flex-1">
                <View className={`v2-swatch ${s.cls}`} />
                <Text className="v2-swatch-label">{s.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

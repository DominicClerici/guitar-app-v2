import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import './styles/variant-6.css';

const ON_KEY = '#f7f4ea';

const KEYS: { sym: SymbolViewProps['name']; label: string; cls: string }[] = [
  { sym: 'tuningfork', label: 'Tune', cls: 'v6-key-orange' },
  { sym: 'metronome', label: 'Tempo', cls: 'v6-key-blue' },
  { sym: 'waveform', label: 'Rec', cls: 'v6-key-red' },
  { sym: 'repeat', label: 'Loop', cls: 'v6-key-green' },
];

// VU meter: 12 segments, lit up to LEVEL. Green body, amber shoulder, red peak.
const VU_TOTAL = 12;
const VU_LEVEL = 9;
function vuSegClass(i: number) {
  if (i >= VU_LEVEL) return 'v6-vu-seg';
  if (i >= 10) return 'v6-vu-seg v6-vu-red';
  if (i >= 8) return 'v6-vu-seg v6-vu-amber';
  return 'v6-vu-seg v6-vu-green';
}

const PATCHES = [
  { led: '#ef6a3d', title: 'Pentatonic runs', meta: 'LEAD · BOX 1', bpm: '120' },
  { led: '#3f81d8', title: 'Barre transitions', meta: 'RHYTHM · DRILL 04', bpm: '84' },
  { led: '#4fae6d', title: 'Alternate picking', meta: 'TECHNIQUE · LADDER', bpm: '96' },
];

export default function Variant6() {
  const insets = useSafeAreaInsets();

  return (
    <View className="variant-6-root flex-1">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 20,
          paddingBottom: insets.bottom + 88,
          paddingHorizontal: 20,
          gap: 20,
        }}
      >
        {/* device header */}
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="v6-device">OP·6 — practice unit</Text>
            <Text className="v6-brand">woodshed</Text>
          </View>
          <View className="v6-power">
            <View className="v6-led" />
            <Text className="v6-power-text">On</Text>
          </View>
        </View>

        {/* LCD hero */}
        <View className="v6-lcd">
          <View className="v6-lcd-topline">
            <Text className="v6-lcd-tag">▶ Now playing</Text>
            <Text className="v6-lcd-rec">● REC</Text>
          </View>
          <Text className="v6-lcd-title">Pentatonic runs</Text>
          <Text className="v6-lcd-sub">Lead technique · box 1 · A minor</Text>
          <View className="v6-lcd-readout">
            <Text className="v6-lcd-time">03:12</Text>
            <Text className="v6-lcd-bpm">120 BPM · 4/4</Text>
          </View>
        </View>

        {/* function keys */}
        <View className="v6-keys">
          {KEYS.map((k) => (
            <View key={k.label} className="v6-key">
              <View className={`v6-key-cap ${k.cls}`}>
                <SymbolView name={k.sym} size={22} tintColor={ON_KEY} />
              </View>
              <Text className="v6-key-label">{k.label}</Text>
            </View>
          ))}
        </View>

        {/* control panel — knobs + VU */}
        <View className="v6-panel">
          <View className="v6-knob-cell">
            <View className="v6-knob" style={{ transform: [{ rotate: '-48deg' }] }}>
              <View className="v6-knob-tick" />
            </View>
            <Text className="v6-knob-num">14</Text>
            <Text className="v6-knob-label">Streak</Text>
          </View>
          <View className="v6-knob-cell">
            <View className="v6-knob" style={{ transform: [{ rotate: '62deg' }] }}>
              <View className="v6-knob-tick" />
            </View>
            <Text className="v6-knob-num">92%</Text>
            <Text className="v6-knob-label">Accuracy</Text>
          </View>
          <View className="v6-vu-cell">
            <Text className="v6-vu-label">Input</Text>
            <View className="v6-vu-row">
              {Array.from({ length: VU_TOTAL }).map((_, i) => (
                <View key={i} className={vuSegClass(i)} />
              ))}
            </View>
            <View className="v6-vu-scale">
              <Text className="v6-vu-tick">−20</Text>
              <Text className="v6-vu-tick">0</Text>
              <Text className="v6-vu-tick">+3</Text>
            </View>
          </View>
        </View>

        {/* patch list */}
        <View className="gap-3">
          <View className="flex-row items-center justify-between">
            <Text className="v6-section">Patch bank</Text>
            <Text className="v6-count">03 / 12</Text>
          </View>
          {PATCHES.map((p) => (
            <View key={p.title} className="v6-slot">
              <View className="v6-slot-led" style={{ backgroundColor: p.led }} />
              <View className="flex-1">
                <Text className="v6-slot-title">{p.title}</Text>
                <Text className="v6-slot-meta">{p.meta}</Text>
              </View>
              <Text className="v6-slot-bpm">{p.bpm} BPM</Text>
            </View>
          ))}
        </View>

        {/* transport */}
        <View className="gap-3">
          <Pressable className="v6-transport">
            <Text className="v6-transport-label">▶ Start session</Text>
          </Pressable>
          <Pressable className="v6-transport-ghost">
            <Text className="v6-transport-ghost-label">● Log a take</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

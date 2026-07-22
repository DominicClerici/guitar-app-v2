import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import './styles/variant-5.css';

const SESSIONS = [
  { key: 'Em', title: 'Pentatonic runs', meta: 'Lead technique · Box 1', bpm: '120 BPM' },
  { key: 'A', title: 'Barre transitions', meta: 'Rhythm · Drill 04', bpm: '84 BPM' },
  { key: 'C', title: 'Alternate picking', meta: 'Technique · Ladder', bpm: '96 BPM' },
];

const FILTERS = ['All', 'Rhythm', 'Lead', 'Theory'];

export default function Variant5() {
  const insets = useSafeAreaInsets();

  return (
    <View className="variant-5-root flex-1">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 20,
          paddingBottom: insets.bottom + 88,
          paddingHorizontal: 20,
          gap: 22,
        }}
      >
        <View className="flex-row items-start justify-between">
          <View className="gap-2">
            <Text className="v5-eyebrow">● Rec · Session 47</Text>
            <Text className="v5-title">Woodshed</Text>
          </View>
          <Pressable className="v5-rec">
            <View className="v5-rec-dot" />
          </Pressable>
        </View>

        <View className="v5-hero gap-4">
          <View className="flex-row items-start justify-between">
            <View className="gap-1 flex-1 pr-3">
              <Text className="v5-hero-tag">Now tuning</Text>
              <Text className="v5-hero-title">Standard · E A D G B E</Text>
              <Text className="v5-hero-sub">6th string · detected 82.1 Hz</Text>
            </View>
            <Text className="v5-hero-readout">−4¢</Text>
          </View>
          <View className="v5-hero-divider" />
          <View className="flex-row items-end gap-1">
            {Array.from({ length: 21 }).map((_, i) => (
              <View key={i} className={`v5-tick ${i === 8 ? 'v5-tick-on' : ''}`} />
            ))}
          </View>
        </View>

        <View className="v5-panel flex-row">
          <View className="v5-stat">
            <Text className="v5-stat-num">14</Text>
            <Text className="v5-stat-label">Streak</Text>
          </View>
          <View className="v5-vline" />
          <View className="v5-stat">
            <Text className="v5-stat-num">03:12</Text>
            <Text className="v5-stat-label">Today</Text>
          </View>
          <View className="v5-vline" />
          <View className="v5-stat">
            <Text className="v5-stat-num">92%</Text>
            <Text className="v5-stat-label">Accuracy</Text>
          </View>
        </View>

        <View className="gap-3">
          <View className="flex-row items-center justify-between">
            <Text className="v5-section">Queue</Text>
            <Text className="v5-count">03 / 12</Text>
          </View>
          {SESSIONS.map((s) => (
            <View key={s.title} className="v5-row">
              <View className="v5-badge">
                <Text className="v5-badge-key">{s.key}</Text>
              </View>
              <View className="flex-1">
                <Text className="v5-row-title">{s.title}</Text>
                <Text className="v5-row-meta">{s.meta}</Text>
              </View>
              <Text className="v5-bpm">{s.bpm}</Text>
            </View>
          ))}
        </View>

        <View className="flex-row flex-wrap gap-2">
          {FILTERS.map((f, i) => (
            <View key={f} className={`v5-pill ${i === 0 ? 'v5-pill-active' : ''}`}>
              <Text className={`v5-pill-label ${i === 0 ? 'v5-pill-label-active' : ''}`}>{f}</Text>
            </View>
          ))}
        </View>

        <View className="gap-3">
          <Pressable className="v5-cta">
            <Text className="v5-cta-label">Start metronome</Text>
          </Pressable>
          <Pressable className="v5-ghost">
            <Text className="v5-ghost-label">Log a session</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

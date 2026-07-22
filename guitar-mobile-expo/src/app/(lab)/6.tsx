import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import './styles/variant-6.css';

const LESSONS = [
  { icon: '♫', title: 'Your First Chords', meta: 'Beginner · 8 lessons', dur: '4 min' },
  { icon: '◈', title: 'Strumming Patterns', meta: 'Rhythm · 6 lessons', dur: '6 min' },
  { icon: '❤', title: 'Fingerpicking Basics', meta: 'Technique · 5 lessons', dur: '5 min' },
];

const MOODS = ['For you', 'Chill', 'Warm-up', 'Theory'];

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
          gap: 24,
        }}
      >
        <View className="flex-row items-center justify-between">
          <View className="gap-1.5">
            <Text className="v6-eyebrow">Welcome back, Sam</Text>
            <Text className="v6-title">Let&apos;s play</Text>
          </View>
          <View className="v6-avatar">
            <Text className="v6-avatar-glyph">S</Text>
          </View>
        </View>

        <View className="v6-hero gap-6">
          <View className="flex-row items-center justify-between">
            <View className="gap-1 flex-1 pr-4">
              <Text className="v6-hero-kicker">Pick up where you left off</Text>
              <Text className="v6-hero-title">The G–C–D Song</Text>
              <Text className="v6-hero-sub">Chord changes · Lesson 3 of 8</Text>
            </View>
            <Pressable className="v6-play">
              <Text className="v6-play-glyph">▶</Text>
            </Pressable>
          </View>
          <View className="v6-hero-track">
            <View className="v6-hero-track-fill" style={{ width: '45%' }} />
          </View>
        </View>

        <View className="flex-row gap-3">
          <View className="v6-stat">
            <Text className="v6-stat-num v6-stat-accent">7</Text>
            <Text className="v6-stat-label">Day streak</Text>
          </View>
          <View className="v6-stat">
            <Text className="v6-stat-num">45m</Text>
            <Text className="v6-stat-label">This week</Text>
          </View>
          <View className="v6-stat">
            <Text className="v6-stat-num">12</Text>
            <Text className="v6-stat-label">Chords learned</Text>
          </View>
        </View>

        <View className="gap-3">
          <View className="flex-row items-center justify-between">
            <Text className="v6-section">Keep learning</Text>
            <Text className="v6-section-link">Browse</Text>
          </View>
          {LESSONS.map((l) => (
            <View key={l.title} className="v6-row">
              <View className="v6-cover">
                <Text className="v6-cover-glyph">{l.icon}</Text>
              </View>
              <View className="flex-1">
                <Text className="v6-row-title">{l.title}</Text>
                <Text className="v6-row-meta">{l.meta}</Text>
              </View>
              <Text className="v6-row-dur">{l.dur}</Text>
            </View>
          ))}
        </View>

        <View className="flex-row flex-wrap gap-2.5">
          {MOODS.map((m, i) => (
            <View key={m} className={`v6-chip ${i === 0 ? 'v6-chip-active' : ''}`}>
              <Text className={`v6-chip-label ${i === 0 ? 'v6-chip-label-active' : ''}`}>{m}</Text>
            </View>
          ))}
        </View>

        <View className="gap-3">
          <Pressable className="v6-cta">
            <Text className="v6-cta-label">Continue lesson</Text>
          </Pressable>
          <Pressable className="v6-ghost">
            <Text className="v6-ghost-label">Practice freestyle</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

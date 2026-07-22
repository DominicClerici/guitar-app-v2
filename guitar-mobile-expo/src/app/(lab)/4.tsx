import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import './styles/variant-4.css';

const PIECES = [
  { n: '01', title: 'Blackbird', meta: 'Fingerstyle · The Beatles', key: 'G' },
  { n: '02', title: 'Wish You Were Here', meta: 'Acoustic · Pink Floyd', key: 'G' },
  { n: '03', title: 'Tears in Heaven', meta: 'Fingerstyle · Clapton', key: 'A' },
  { n: '04', title: 'Dust in the Wind', meta: 'Travis picking · Kansas', key: 'C' },
];

const GENRES = ['Fingerstyle', 'Blues', 'Folk', 'Classical'];

export default function Variant4() {
  const insets = useSafeAreaInsets();

  return (
    <View className="variant-4-root flex-1">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 20,
          paddingBottom: insets.bottom + 88,
          paddingHorizontal: 22,
          gap: 26,
        }}
      >
        <View className="flex-row items-start justify-between">
          <View className="gap-2">
            <Text className="v4-eyebrow">Good evening</Text>
            <Text className="v4-title">The Practice{'\n'}Room</Text>
          </View>
          <View className="v4-avatar">
            <Text className="v4-display" style={{ color: '#dda659', fontSize: 18 }}>
              ♪
            </Text>
          </View>
        </View>

        <View className="v4-hero gap-5">
          <View className="flex-row items-center justify-between">
            <View className="gap-1 flex-1 pr-4">
              <Text className="v4-hero-kicker">Continue</Text>
              <Text className="v4-hero-title">Nocturne in E minor</Text>
              <Text className="v4-hero-sub">Sor · Study No. 12 · 6 min left</Text>
            </View>
            <Pressable className="v4-play">
              <Text className="v4-play-glyph">▶</Text>
            </Pressable>
          </View>
          <View className="gap-2">
            <View className="v4-track">
              <View className="v4-track-fill" style={{ width: '68%' }} />
            </View>
            <View className="flex-row justify-between">
              <Text className="v4-hero-sub" style={{ fontSize: 12 }}>
                Measure 24 of 36
              </Text>
              <Text className="v4-row-key">68%</Text>
            </View>
          </View>
        </View>

        <View className="flex-row gap-3">
          <View className="v4-stat">
            <Text className="v4-stat-num">14</Text>
            <Text className="v4-stat-label">Day streak</Text>
          </View>
          <View className="v4-stat">
            <Text className="v4-stat-num">3.2h</Text>
            <Text className="v4-stat-label">This week</Text>
          </View>
          <View className="v4-stat">
            <Text className="v4-stat-num">28</Text>
            <Text className="v4-stat-label">Pieces</Text>
          </View>
        </View>

        <View className="gap-1">
          <View className="flex-row items-center justify-between">
            <Text className="v4-section">Your repertoire</Text>
            <Text className="v4-section-link">See all</Text>
          </View>
          <View>
            {PIECES.map((p) => (
              <View key={p.n} className="v4-row">
                <Text className="v4-row-index">{p.n}</Text>
                <View className="flex-1">
                  <Text className="v4-row-title">{p.title}</Text>
                  <Text className="v4-row-meta">{p.meta}</Text>
                </View>
                <Text className="v4-row-key">{p.key}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className="flex-row flex-wrap gap-2">
          {GENRES.map((g, i) => (
            <View key={g} className={`v4-chip ${i === 0 ? 'v4-chip-active' : ''}`}>
              <Text className={`v4-chip-label ${i === 0 ? 'v4-chip-label-active' : ''}`}>{g}</Text>
            </View>
          ))}
        </View>

        <View className="gap-3">
          <Pressable className="v4-cta">
            <Text className="v4-cta-label">Begin today&apos;s session</Text>
          </Pressable>
          <Pressable className="v4-ghost">
            <Text className="v4-ghost-label">Open the tuner</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

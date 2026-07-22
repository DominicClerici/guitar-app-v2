import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import './styles/variant-4.css';

const PIECES = [
  { n: '01', title: 'Blackbird', meta: 'FINGERSTYLE · THE BEATLES', key: 'G' },
  { n: '02', title: 'Wish You Were Here', meta: 'ACOUSTIC · PINK FLOYD', key: 'G' },
  { n: '03', title: 'Tears in Heaven', meta: 'FINGERSTYLE · CLAPTON', key: 'A' },
  { n: '04', title: 'Dust in the Wind', meta: 'TRAVIS PICKING · KANSAS', key: 'C' },
];

const LANES = ['All', 'Fingerstyle', 'Blues', 'Folk'];

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
        {/* masthead */}
        <View>
          <View className="flex-row items-start justify-between">
            <Text className="v4-kicker">Pressed — a practice zine</Text>
            <View className="v4-stamp" style={{ transform: [{ rotate: '-5deg' }] }}>
              <Text className="v4-stamp-text">No. 04</Text>
            </View>
          </View>
          <View className="v4-rule-thick" />
          <View className="v4-mast-wrap">
            <View style={{ position: 'relative' }}>
              <Text className="v4-mast-shadow">OPEN{'\n'}MIC.</Text>
              <Text className="v4-mast">OPEN{'\n'}MIC.</Text>
            </View>
          </View>
        </View>

        {/* feature poster */}
        <View className="v4-poster gap-5">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-4">
              <Text className="v4-poster-kicker">Tonight&apos;s pressing</Text>
              <Text className="v4-poster-title">Blackbird</Text>
              <Text className="v4-poster-sub">The Beatles · study in G · 6 min left</Text>
            </View>
            <Pressable className="v4-poster-play">
              <Text className="v4-poster-play-glyph">▶</Text>
            </Pressable>
          </View>
          <View className="gap-2">
            <View className="v4-poster-track">
              <View className="v4-poster-track-fill" style={{ width: '68%' }} />
            </View>
            <View className="flex-row justify-between">
              <Text className="v4-poster-meta">BAR 24 / 38</Text>
              <Text className="v4-poster-meta">68%</Text>
            </View>
          </View>
        </View>

        {/* stat blocks */}
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

        {/* repertoire */}
        <View className="gap-1">
          <View className="v4-section-head">
            <Text className="v4-section">Repertoire</Text>
            <Text className="v4-section-meta">04 CUTS</Text>
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

        {/* tear-off tabs */}
        <View className="v4-tearoff">
          <Text className="v4-tearoff-caption">✂ tear off a lane</Text>
          <View className="flex-row flex-wrap gap-2">
            {LANES.map((l, i) => (
              <View
                key={l}
                className={`v4-tab ${i === 0 ? 'v4-tab-active' : ''}`}
                style={i === 2 ? { transform: [{ rotate: '-2deg' }] } : undefined}
              >
                <Text className="v4-tab-label">{l}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* coupon CTA */}
        <View className="gap-3">
          <Pressable className="v4-coupon">
            <Text className="v4-coupon-label">Begin today&apos;s session</Text>
            <Text className="v4-coupon-sub">Admit one</Text>
          </Pressable>
          <Pressable className="v4-ghost">
            <Text className="v4-ghost-label">Open the tuner</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

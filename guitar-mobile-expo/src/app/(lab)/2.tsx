import { SymbolView } from 'expo-symbols';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import './styles/variant-2.css';

const ON_CLARET = '#f8efe0';

// Engraved G-major chord chart. Six strings (low E → high e), four fret spaces.
// Markers sit above the nut; open strings read "o". Root notes (G) are inked,
// the third (B) takes the claret accent.
const MARKERS = ['', '', 'o', 'o', 'o', ''];
const DOTS: Record<string, 'root' | 'note'> = {
  '2-0': 'root',
  '1-1': 'note',
  '2-5': 'root',
};
const FRET_ROWS = [0, 1, 2, 3];
const STRINGS = [0, 1, 2, 3, 4, 5];

const PROGRAMME = [
  { roman: 'I', title: 'Prelude in G', meta: 'BACH · CELLO SUITE · ARR.', time: '3:52' },
  { roman: 'II', title: 'Lágrima', meta: 'TÁRREGA · KEY OF E', time: '2:41' },
  { roman: 'III', title: 'Cavatina', meta: 'MYERS · POS. VII', time: '4:16' },
  { roman: 'IV', title: 'Asturias', meta: 'ALBÉNIZ · A MINOR', time: '6:08' },
];

export default function Variant2() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      className="v2-root flex-1"
      contentContainerStyle={{ paddingTop: insets.top + 18, paddingBottom: insets.bottom + 96 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="v2-scroll">
        {/* masthead */}
        <View className="v2-masthead">
          <View>
            <Text className="v2-kicker">The practice programme</Text>
            <Text className="v2-wordmark">
              Cadenza<Text className="v2-wordmark-accent">.</Text>
            </Text>
          </View>
          <View className="v2-folio">
            <Text className="v2-folio-no">No. II</Text>
            <Text className="v2-folio-label">Summer</Text>
          </View>
        </View>
        <View className="v2-rule" />
        <View className="v2-rule-hair" />

        {/* hero — now studying */}
        <View className="v2-mat-tray">
          <View className="v2-mat">
            <Text className="v2-feature-eyebrow">Now studying</Text>
            <Text className="v2-feature-title">Prelude in G</Text>
            <Text className="v2-feature-sub">
              Bach, arranged for six strings · an unhurried study in voice-leading
            </Text>

            <View className="v2-progress-head">
              <Text className="v2-progress-label">Bar 24 / 38</Text>
              <Text className="v2-progress-pct">64%</Text>
            </View>
            <View className="v2-progress-track">
              <View className="v2-progress-fill" />
            </View>
            <Text className="v2-readout">72 BPM · 3/4 · POS. II · TUNING E A D G B E</Text>

            <Pressable className="v2-btn v2-btn-primary">
              <Text className="v2-btn-primary-text">Resume the study</Text>
              <View className="v2-btn-icon">
                <SymbolView name="arrow.right" size={12} tintColor={ON_CLARET} weight="medium" />
              </View>
            </Pressable>
          </View>
        </View>

        {/* signature — engraved chord chart */}
        <View className="v2-section">
          <Text className="v2-eyebrow">Voicing</Text>
          <Text className="v2-section-title">
            The open <Text className="v2-section-title-accent">G</Text>
          </Text>
          <View className="v2-chord">
            <View className="v2-chord-diagram">
              <View className="v2-chord-markers">
                {MARKERS.map((m, c) => (
                  <View key={c} className="v2-chord-mark">
                    <Text className="v2-chord-mark-text">{m}</Text>
                  </View>
                ))}
              </View>
              <View className="v2-chord-nut" />
              {FRET_ROWS.map((r) => (
                <View key={r} className="v2-fret-row">
                  {STRINGS.map((c) => {
                    const dot = DOTS[`${r}-${c}`];
                    return (
                      <View
                        key={c}
                        className={c === 0 ? 'v2-fret-cell v2-fret-cell-first' : 'v2-fret-cell'}
                      >
                        {dot ? (
                          <View className={dot === 'root' ? 'v2-dot v2-dot-root' : 'v2-dot'} />
                        ) : null}
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>
            <View className="v2-chord-legend">
              <Text className="v2-chord-name">
                G<Text className="v2-chord-name-sup"> maj</Text>
              </Text>
              <Text className="v2-chord-desc">
                Root on the sixth, doubled on the first — the warm, ringing shape the whole prelude
                leans on.
              </Text>
              <Text className="v2-chord-fingering">3 2 0 0 0 3</Text>
            </View>
          </View>
        </View>

        {/* programme list */}
        <View className="v2-section">
          <Text className="v2-eyebrow">Tonight</Text>
          <Text className="v2-section-title">The programme</Text>
          <View style={{ marginTop: 8 }}>
            {PROGRAMME.map((p) => (
              <View key={p.roman} className="v2-row">
                <Text className="v2-row-roman">{p.roman}</Text>
                <View className="flex-1">
                  <Text className="v2-row-title">{p.title}</Text>
                  <Text className="v2-row-meta">{p.meta}</Text>
                </View>
                <Text className="v2-row-time">{p.time}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* type specimen */}
        <View className="v2-section">
          <Text className="v2-eyebrow">Type system</Text>
          <Text className="v2-section-title">A serif that sings</Text>
          <View className="v2-mat-tray">
            <View className="v2-mat">
              <Text className="v2-spec-display">
                Encore<Text className="v2-spec-accent">.</Text>
              </Text>
              <Text className="v2-spec-body">
                A high-contrast italic serif carries the romance of the piece — its name, its
                movements, its voice. A quiet sans keeps the prose readable, and monospace holds the
                tempos and tunings dead level, so the numbers never argue with the melody.
              </Text>
              <View className="v2-spec-divider" />
              <Text className="v2-spec-mono">72 BPM · 3/4 · POS. II · CAPO 0</Text>
            </View>
          </View>
        </View>

        {/* palette */}
        <View className="v2-section">
          <Text className="v2-eyebrow">Palette</Text>
          <Text className="v2-section-title">Paper, ink &amp; claret</Text>
          <View className="v2-swatch-row">
            {[
              { cls: 'v2-sw-paper', label: 'Paper' },
              { cls: 'v2-sw-ink', label: 'Ink' },
              { cls: 'v2-sw-claret', label: 'Claret' },
              { cls: 'v2-sw-brass', label: 'Brass' },
              { cls: 'v2-sw-line', label: 'Rule' },
            ].map((s) => (
              <View key={s.label} className="flex-1">
                <View className={`v2-swatch ${s.cls}`} />
                <Text className="v2-swatch-label">{s.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

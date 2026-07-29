import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { Segmented, type Segment } from '@/components/Segmented';

import { VOICES } from './droneVoices';
import type { Intonation } from './intonation';
import { MAX_OCTAVE, MIN_OCTAVE } from './voicing';

const OCTAVES: { value: number; label: string; name: string }[] = [
  { value: MIN_OCTAVE, label: '8vb', name: 'An octave down' },
  { value: 0, label: '·', name: 'Normal octave' },
  { value: MAX_OCTAVE, label: '8va', name: 'An octave up' },
];

interface Props {
  voiceId: string;
  intonation: Intonation;
  octave: number;
  onVoice: (id: string) => void;
  onIntonation: (mode: Intonation) => void;
  onOctave: (octave: number) => void;
}

/**
 * The three things that change how the drone sounds without changing what it is
 * playing. Read down the left, set on the right — the same card the metronome
 * puts its own settings in.
 */
export function ControlShelf({
  voiceId,
  intonation,
  octave,
  onVoice,
  onIntonation,
  onOctave,
}: Props) {
  return (
    <View className="rounded-[13px] border border-t-edge-top border-x-line-soft border-b-edge-bottom bg-surface px-[16px]">
      <Row label="Voice">
        <Segmented
          segments={VOICES.map((voice) => chip(voice.id, voice.label, voice.id === voiceId))}
          value={voiceId}
          onChange={onVoice}
        />
      </Row>

      {/* Pure tunes the intervals as the overtone series makes them, which is
          what stops a held third beating. The root does not move either way, so
          the drone still agrees with the tuner. */}
      <Row label="Tuning">
        <Segmented
          segments={[
            chip('equal', 'Equal', intonation === 'equal'),
            chip('just', 'Pure', intonation === 'just'),
          ]}
          value={intonation}
          onChange={(id) => onIntonation(id as Intonation)}
        />
      </Row>

      <Row label="Octave" last>
        <Segmented
          segments={OCTAVES.map(({ value, label, name }) =>
            chip(String(value), label, value === octave, name),
          )}
          value={String(octave)}
          onChange={(id) => onOctave(Number(id))}
        />
      </Row>
    </View>
  );
}

function chip(id: string, label: string, selected: boolean, name = label): Segment {
  return {
    id,
    label: name,
    content: (
      <Text
        className={`text-[12.5px] font-medium tracking-[-0.1px] ${
          selected ? 'text-accent' : 'text-ink-muted'
        }`}
      >
        {label}
      </Text>
    ),
  };
}

function Row({ label, last, children }: { label: string; last?: boolean; children: ReactNode }) {
  return (
    <View
      className={`min-h-[48px] flex-row items-center justify-between gap-[12px] py-[7px] ${
        last ? '' : 'border-b border-b-line-soft'
      }`}
    >
      <Text className="font-mono text-[10px] font-semibold uppercase tracking-[1.8px] text-ink-faint">
        {label}
      </Text>
      {children}
    </View>
  );
}

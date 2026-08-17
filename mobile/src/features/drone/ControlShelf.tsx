import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { Face } from '@/components/Face';
import { PillSelector, type PillOption } from '@/components/PillSelector';
import { Ticker } from '@/components/Ticker';

import { VOICES } from './droneVoices';
import type { Intonation } from './intonation';
import { MAX_OCTAVE, MIN_OCTAVE } from './voicing';

/** Signed both ways, so the shift up reads as a shift rather than as a count. */
function octaveLabel(octave: number): string {
  return octave > 0 ? `+${octave}` : String(octave);
}

const VOICE_OPTIONS: PillOption[] = VOICES.map((voice) => ({
  id: voice.id,
  label: voice.label,
}));

const TUNINGS: PillOption[] = [
  { id: 'equal', label: 'Equal', name: 'Equal temperament' },
  { id: 'just', label: 'Pure', name: 'Pure intervals' },
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
    <View className="px-[16px]">
      <Face name="card" radius={13} />
      {/* Both of these are things you sweep across to hear the difference, so
          they carry the pill you can drag rather than chips you tap one at a
          time — and they report live, so the drone answers on the way. */}
      <Row label="Voice">
        <PillSelector
          options={VOICE_OPTIONS}
          value={voiceId}
          onChange={onVoice}
          label="Voice"
          className="w-2/3"
        />
      </Row>

      {/* Pure tunes the intervals as the overtone series makes them, which is
          what stops a held third beating. The root does not move either way, so
          the drone still agrees with the tuner. */}
      <Row label="Tuning">
        <PillSelector
          options={TUNINGS}
          value={intonation}
          onChange={(id) => onIntonation(id as Intonation)}
          label="Tuning"
          className="w-2/3"
        />
      </Row>

      {/* Three steps wide, so a held key has nowhere to run to — one press per
          octave, and the ends go quiet when you are already there. */}
      <Row label="Octave" last>
        <Ticker
          value={octave}
          onChange={onOctave}
          min={MIN_OCTAVE}
          max={MAX_OCTAVE}
          format={octaveLabel}
          repeatOnHold={false}
          label="Octave"
          className="w-2/3"
        />
      </Row>
    </View>
  );
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

import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { PillSelector, type PillOption } from '@/components/PillSelector';
import { Ticker } from '@/components/Ticker';

import { VOICES } from './clickVoices';
import { MAX_BEATS, MIN_BEATS, SUBDIVISIONS } from './patterns';

/**
 * The subdivision reads as what it sounds like rather than as what it is called:
 * one dot per click in the beat, the first of them being the beat itself. Four of
 * those are quicker to tell apart at a glance than four names ending in "notes".
 */
const SUBDIVISION_OPTIONS: PillOption[] = SUBDIVISIONS.map((subdivision) => ({
  id: subdivision.id,
  name: subdivision.label,
  content: (lit) => <Dots count={subdivision.perBeat} selected={lit} />,
}));

const VOICE_OPTIONS: PillOption[] = VOICES.map((voice) => ({
  id: voice.id,
  label: voice.label,
}));

interface Props {
  beats: number;
  perBeat: number;
  voiceId: string;
  onBeats: (beats: number) => void;
  onPerBeat: (perBeat: number) => void;
  onVoice: (id: string) => void;
}

/** Everything that shapes the click, one setting to a line. */
export function ControlsStrip({ beats, perBeat, voiceId, onBeats, onPerBeat, onVoice }: Props) {
  return (
    <View className="rounded-[13px] border border-x-line-soft border-t-edge-top border-b-edge-bottom bg-surface px-[16px]">
      <Row label="Subdivision">
        <PillSelector
          options={SUBDIVISION_OPTIONS}
          value={SUBDIVISIONS.find((s) => s.perBeat === perBeat)?.id ?? null}
          onChange={(id) => {
            const found = SUBDIVISIONS.find((s) => s.id === id);
            if (found) onPerBeat(found.perBeat);
          }}
          label="Subdivision"
        />
      </Row>

      {/* A dozen steps wide, so the keys repeat while held — but the number stays
          a readout: twelve is a walk, not a journey. */}
      <Row label="Beats per bar">
        <Ticker
          value={beats}
          onChange={onBeats}
          min={MIN_BEATS}
          max={MAX_BEATS}
          label="Beats per bar"
        />
      </Row>

      <Row label="Sound" last>
        <PillSelector options={VOICE_OPTIONS} value={voiceId} onChange={onVoice} label="Sound" />
      </Row>
    </View>
  );
}

/**
 * A fixed column for the name and the rest for the control, rather than each row
 * sizing itself: the three trays stack, so they have to agree on both edges — and
 * `Beats per bar` is long enough that a share of the width would push the tray off
 * the card on a narrow screen.
 */
function Row({ label, last, children }: { label: string; last?: boolean; children: ReactNode }) {
  return (
    <View
      className={`min-h-[58px] flex-row items-center gap-[12px] py-[11px] ${
        last ? '' : 'border-b border-b-line-soft'
      }`}
    >
      <Text
        numberOfLines={1}
        className="w-[110px] font-mono text-[10px] font-semibold uppercase tracking-[1.8px] text-ink-faint"
      >
        {label}
      </Text>
      <View className="flex-1">{children}</View>
    </View>
  );
}

/** One dot per click in the beat, the first of them being the beat itself. */
function Dots({ count, selected }: { count: number; selected: boolean }) {
  return (
    <View className="flex-row items-center gap-[3px]">
      {Array.from({ length: count }, (_, i) => (
        <View
          key={i}
          className={`h-[5px] w-[5px] rounded-full ${
            selected
              ? i === 0
                ? 'bg-accent'
                : 'bg-accent-line'
              : i === 0
                ? 'bg-ink'
                : 'bg-ink-faint'
          }`}
        />
      ))}
    </View>
  );
}

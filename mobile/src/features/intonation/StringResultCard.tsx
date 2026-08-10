import { Text, View } from 'react-native';

import {
  directionFor,
  saddleTravelMm,
  severityFor,
  SEVERITY_LABEL,
  SEVERITY_TONE,
} from './intonationMath';
import { SaddleDiagram } from './SaddleDiagram';
import type { GuitarString } from './strings';
import type { Measurement } from './useIntonation';

const MINUS = '−';

interface Props {
  string: GuitarString;
  measurement: Measurement;
  scaleInches: number;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between py-[7px]">
      <Text className="font-mono text-[9.5px] uppercase tracking-[1.5px] text-ink-faint">
        {label}
      </Text>
      <Text className="font-mono text-[12px] tracking-[0.5px] text-ink-muted">{value}</Text>
    </View>
  );
}

/** The verdict for one string: how far out, which way to move, and by how much. */
export function StringResultCard({ string, measurement, scaleInches }: Props) {
  const { cents } = measurement;
  const direction = directionFor(cents);
  const severity = severityFor(cents);
  const travel = saddleTravelMm(cents, scaleInches);
  const sign = cents >= 0 ? '+' : MINUS;

  return (
    <View>
      <View className="items-center rounded-[13px] border border-x-line-soft border-t-edge-top border-b-edge-bottom bg-surface px-[18px] pb-[20px] pt-[22px]">
        <Text className="font-mono text-[9.5px] uppercase tracking-[2.5px] text-ink-faint">
          {string.label} string
        </Text>

        <Text
          className={`mt-[10px] text-[58px] font-semibold leading-[62px] tracking-[-2px] ${SEVERITY_TONE[severity]}`}
        >
          {sign}
          {Math.abs(cents).toFixed(1)}
        </Text>
        <Text className="mt-[2px] font-mono text-[10px] uppercase tracking-[2px] text-ink-faint">
          Cents
        </Text>

        <Text className="mt-[14px] text-center text-[14px] leading-[20px] text-ink">
          {direction === 'none'
            ? 'The 12th fret matches the harmonic. Nothing to adjust.'
            : `The 12th fret is ${cents > 0 ? 'sharp' : 'flat'} of the harmonic.`}
        </Text>

        <View className="mt-[16px] w-full">
          <SaddleDiagram direction={direction} />
        </View>

        {direction === 'none' ? null : (
          <Text className="mt-[14px] text-center text-[14px] leading-[20px] text-ink-muted">
            Move it{' '}
            <Text className="font-semibold text-ink">
              about {travel.toFixed(1)} mm {direction === 'toward' ? 'toward' : 'away from'} the
              neck
            </Text>
            , retune the open string, and measure again.
          </Text>
        )}
      </View>

      <View className="mt-[12px] rounded-[13px] border border-line-soft bg-tray px-[16px] py-[8px]">
        <Row label="Harmonic" value={`${measurement.harmonicHz.toFixed(2)} Hz`} />
        <View className="h-px bg-line-soft" />
        <Row label="12th fret" value={`${measurement.frettedHz.toFixed(2)} Hz`} />
        <View className="h-px bg-line-soft" />
        <Row label="Verdict" value={SEVERITY_LABEL[severity]} />
      </View>
    </View>
  );
}

import { Text, View } from 'react-native';

import {
  directionFor,
  saddleTravelMm,
  severityFor,
  SEVERITY_TONE,
  TOLERANCE_CENTS,
} from './intonationMath';
import { STRING_COUNT } from './strings';
import { useGuitarStrings } from './useGuitarStrings';
import { orderedResults, type Measurement } from './useIntonation';

const MINUS = '−';

interface Props {
  results: Measurement[];
  scaleInches: number;
}

/** Every string on one page, in rail order, worst offenders visible at a glance. */
export function ResultsSummary({ results, scaleInches }: Props) {
  const strings = useGuitarStrings();
  const rows = orderedResults(strings, results);
  const off = rows.filter((r) => r && Math.abs(r.cents) > TOLERANCE_CENTS).length;

  const headline =
    off === 0
      ? 'Every string is intonated.'
      : `${off} ${off === 1 ? 'string needs' : 'strings need'} a saddle adjustment.`;

  return (
    <View>
      <Text className="text-[22px] font-semibold leading-[28px] tracking-[-0.5px] text-ink">
        {headline}
      </Text>
      <Text className="mt-[6px] text-[13px] leading-[19px] text-ink-muted">
        Each figure is the 12th fret measured against that string&apos;s own 12th-fret harmonic.
        After moving a saddle, retune the open string and run the check again.
      </Text>

      <View className="mt-[18px] rounded-[13px] border border-x-line-soft border-t-edge-top border-b-edge-bottom bg-surface px-[16px]">
        {strings.map((string, i) => {
          const measurement = rows[i];
          const last = i === STRING_COUNT - 1;

          if (!measurement) {
            return (
              <View
                key={string.id}
                className={`flex-row items-center py-[14px] ${last ? '' : 'border-b border-b-line-soft'}`}
              >
                <Text className="w-[26px] text-[15px] font-semibold text-ink-faint">
                  {string.glyph}
                </Text>
                <Text className="flex-1 font-mono text-[10px] uppercase tracking-[1.5px] text-ink-faint">
                  Not measured
                </Text>
              </View>
            );
          }

          const direction = directionFor(measurement.cents);
          const severity = severityFor(measurement.cents);
          const sign = measurement.cents >= 0 ? '+' : MINUS;

          return (
            <View
              key={string.id}
              className={`flex-row items-center py-[14px] ${last ? '' : 'border-b border-b-line-soft'}`}
            >
              <Text className="w-[26px] text-[15px] font-semibold tracking-[-0.2px] text-ink">
                {string.glyph}
              </Text>

              <View className="flex-1">
                <Text
                  className={`font-mono text-[14px] tracking-[0.5px] ${SEVERITY_TONE[severity]}`}
                >
                  {sign}
                  {Math.abs(measurement.cents).toFixed(1)} ¢
                </Text>
                <Text className="mt-[3px] text-[12px] leading-[16px] text-ink-muted">
                  {direction === 'none'
                    ? 'In tolerance'
                    : `${saddleTravelMm(measurement.cents, scaleInches).toFixed(1)} mm ${
                        direction === 'toward' ? 'toward' : 'away from'
                      } the neck`}
                </Text>
              </View>

              <View
                className={`h-[8px] w-[8px] rounded-full ${
                  severity === 'good' ? 'bg-accent' : severity === 'large' ? 'bg-rose' : 'bg-amber'
                }`}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
}

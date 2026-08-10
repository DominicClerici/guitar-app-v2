import { View } from 'react-native';

/**
 * How far through a pathway or chapter the learner is, as one lit segment per section.
 *
 * Segments rather than a filled bar: the counts here are small and whole — three sections, five —
 * and a bar drawn to 66% of a track invites the reader to measure a percentage that was never the
 * point. It also keeps the whole thing in utility classes, which a proportional width cannot be.
 *
 * A long chapter falls back to a fixed number of segments and rounds into them, because past a
 * couple of dozen marks the one-per-section reading stops being legible anyway.
 */
const MAX_SEGMENTS = 24;

export function ProgressTrack({ completed, total }: { completed: number; total: number }) {
  const segments = Math.min(Math.max(total, 1), MAX_SEGMENTS);
  // Floor, not round: a single finished section out of twenty must not light two marks, and a
  // pathway one section short of done must not look finished.
  const lit = total === 0 ? 0 : Math.floor((completed / total) * segments);

  return (
    <View className="h-[6px] flex-row gap-[3px]">
      {Array.from({ length: segments }, (_, index) => (
        <View
          key={index}
          className={`h-[6px] flex-1 rounded-[2px] ${index < lit ? 'bg-accent' : 'bg-line'}`}
        />
      ))}
    </View>
  );
}

import { SymbolView } from 'expo-symbols';
import { Pressable, Text, View } from 'react-native';

import { Face } from '@/components/Face';
import {
  sessionBestPct,
  sessionStatus,
  trackProgress,
  type EarSession,
  type EarTrack,
  type EarTrackStatus,
} from '@/lib/ear-training';
import type { ProgressBySection } from '@/lib/learning';
import { useToken } from '@/lib/tokens';

import { SessionRow } from './SessionRow';

// One sub-pathway as a card in the accordion: the track you are in open, what
// is behind it folded away, what is ahead locked with the reason on show.
//
// The same shape as a chapter on the Learn tab, deliberately — the learner has
// already been taught to read it there.

export function TrackCard({
  track,
  index,
  firstSessionIndex,
  status,
  progress,
  expanded,
  lockReason,
  nextSectionId,
  onToggle,
  onOpenSession,
}: {
  track: EarTrack;
  index: number;
  /** Where the track's first session sits in the flattened seventeen. */
  firstSessionIndex: number;
  status: EarTrackStatus;
  progress: ProgressBySection;
  expanded: boolean;
  /** Why a later track cannot be opened yet, named specifically enough to act on. */
  lockReason: string;
  /**
   * The one row Continue opens, as a section id. Passed down rather than
   * derived here so the marker and the button can never disagree about where
   * "next" is.
   */
  nextSectionId: string | null;
  onToggle: () => void;
  onOpenSession: (session: EarSession) => void;
}) {
  const faint = useToken('--ink-faint', '#62666e');
  const accent = useToken('--accent', '#5ec8c2');

  const locked = status === 'locked';
  const tally = trackProgress(track, progress);
  const open = expanded && !locked;

  const summary = locked
    ? lockReason
    : status === 'complete'
      ? 'Complete'
      : `${tally.passed} of ${tally.total} passed`;

  return (
    <View className="p-[15px]">
      <Face name={status === 'open' ? 'card' : 'tray'} radius={13} />

      <Pressable
        onPress={locked ? undefined : onToggle}
        disabled={locked}
        accessibilityRole="button"
        accessibilityState={{ disabled: locked, expanded: open }}
        accessibilityLabel={`${track.title} track, ${summary}`}
        className="flex-row items-center gap-[12px] active:opacity-60"
      >
        <View className="flex-1">
          <Text className="font-mono text-[9px] uppercase tracking-[2px] text-ink-faint">
            Track {index + 1} · {tally.total} sessions
          </Text>
          <Text
            className={`mt-[5px] text-[16px] font-semibold tracking-[-0.3px] ${
              locked ? 'text-ink-muted' : 'text-ink'
            }`}
          >
            {track.title}
          </Text>
          <Text
            className={`mt-[4px] text-[12px] leading-[17px] ${
              status === 'complete' ? 'text-accent' : 'text-ink-muted'
            }`}
          >
            {summary}
          </Text>
        </View>

        {locked ? (
          <SymbolView name="lock.fill" size={14} tintColor={faint} />
        ) : status === 'complete' && !open ? (
          <SymbolView name="checkmark" size={13} weight="bold" tintColor={accent} />
        ) : (
          <SymbolView
            name={open ? 'chevron.up' : 'chevron.down'}
            size={12}
            weight="semibold"
            tintColor={faint}
          />
        )}
      </Pressable>

      {open ? (
        <View className="mt-[12px]">
          <Text className="mb-[10px] text-[12.5px] leading-[18px] text-ink-muted">
            {track.blurb}
          </Text>

          {track.sessions.map((session, position) => (
            <SessionRow
              key={session.id}
              session={session}
              ordinal={position + 1}
              // `sessionStatus` walks the flattened seventeen, which is the one
              // place the transitive lock is worked out.
              status={sessionStatus(firstSessionIndex + position, progress)}
              next={session.sectionId === nextSectionId}
              bestPct={sessionBestPct(session, progress)}
              onPress={() => onOpenSession(session)}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

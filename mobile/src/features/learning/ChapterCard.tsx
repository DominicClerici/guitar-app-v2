import { SymbolView } from 'expo-symbols';
import { Pressable, Text, View } from 'react-native';

import type { CurriculumChapter, CurriculumSection, RenderSection } from '@/lib/content';
import {
  chapterProgress,
  checkpointStatus,
  checkpointSectionId,
  sectionComplete,
  type ChapterStatus,
  type ProgressBySection,
} from '@/lib/learning';
import { useToken } from '@/lib/tokens';

// A chapter as one card in the accordion. Chapters are the only thing that gates, so this is where
// the whole gating story has to be legible: what is open, what is done, and — for a locked chapter
// — what specifically stands in the way.
//
// Inside an open chapter nothing is ordered. Every section is tappable in any order, because the
// sequence is a suggestion and the checkpoint is the only real gate.

const KIND_LABEL: Record<CurriculumSection['kind'], string> = {
  article: 'Read',
  quiz: 'Quiz',
  activity: 'Practice',
};

function strapFor(section: CurriculumSection): string {
  const parts = [KIND_LABEL[section.kind]];
  if (section.optional) parts.unshift('Optional');
  if (section.estimatedMin) parts.push(`${section.estimatedMin} min`);

  return parts.join(' · ').toUpperCase();
}

function Marker({ complete, muted }: { complete: boolean; muted: boolean }) {
  const onAccent = useToken('--on-accent', '#04211f');

  if (complete) {
    return (
      <View className="h-[18px] w-[18px] items-center justify-center rounded-full bg-accent">
        <SymbolView name="checkmark" size={9} weight="bold" tintColor={onAccent} />
      </View>
    );
  }

  return (
    <View
      className={`h-[18px] w-[18px] items-center justify-center rounded-full border ${
        muted ? 'border-line' : 'border-accent-line'
      }`}
    >
      <View className={`h-[5px] w-[5px] rounded-full ${muted ? 'bg-line' : 'bg-accent-line'}`} />
    </View>
  );
}

function SectionRow({
  section,
  complete,
  onPress,
}: {
  section: RenderSection;
  complete: boolean;
  onPress: () => void;
}) {
  // A section this build cannot open is shown rather than hidden, so chapter numbering reads the
  // same on every version of the app. It never counts and never blocks.
  if (section.kind === 'unknown') {
    return (
      <View className="flex-row items-center gap-[12px] border-t border-t-line-soft py-[13px] opacity-60">
        <Marker complete={false} muted />
        <View className="flex-1">
          <Text className="text-[14px] font-medium tracking-[-0.2px] text-ink-muted">
            Something new
          </Text>
          <Text className="mt-[3px] font-mono text-[9px] uppercase tracking-[2px] text-ink-faint">
            Update the app to open this
          </Text>
        </View>
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open ${section.title}`}
      className="flex-row items-center gap-[12px] border-t border-t-line-soft py-[13px] active:opacity-55"
    >
      <Marker complete={complete} muted={section.optional === true} />
      <View className="flex-1">
        <Text className="text-[14px] font-medium tracking-[-0.2px] text-ink">{section.title}</Text>
        <Text className="mt-[3px] font-mono text-[9px] uppercase tracking-[2px] text-ink-faint">
          {strapFor(section)}
        </Text>
      </View>
    </Pressable>
  );
}

function CheckpointRow({
  chapter,
  progress,
  onPress,
}: {
  chapter: CurriculumChapter;
  progress: ProgressBySection;
  onPress: () => void;
}) {
  const status = checkpointStatus(chapter, progress);
  if (status === 'none') return null;

  const score = progress.get(checkpointSectionId(chapter))?.bestScorePct;
  const locked = status === 'locked';
  const passed = status === 'passed';

  const strap = locked
    ? 'Finish the sections above first'
    : passed
      ? `Passed${score === null || score === undefined ? '' : ` · ${score}%`}`
      : `${chapter.checkpoint?.passThresholdPct ?? 0}% to pass`;

  return (
    <Pressable
      onPress={onPress}
      disabled={locked}
      accessibilityRole="button"
      accessibilityState={{ disabled: locked }}
      accessibilityLabel={`Chapter checkpoint — ${strap}`}
      className={`mt-[12px] flex-row items-center gap-[12px] rounded-[10px] border px-[13px] py-[12px] ${
        locked
          ? 'border-line-soft bg-surface-raised opacity-55'
          : 'border-accent-line bg-accent-wash active:opacity-70'
      }`}
    >
      <Marker complete={passed} muted={locked} />
      <View className="flex-1">
        <Text className="font-mono text-[9px] uppercase tracking-[2px] text-ink-faint">
          Checkpoint
        </Text>
        <Text
          className={`mt-[3px] text-[13.5px] font-medium tracking-[-0.2px] ${
            locked ? 'text-ink-muted' : 'text-ink'
          }`}
        >
          {strap}
        </Text>
      </View>
    </Pressable>
  );
}

export function ChapterCard({
  index,
  chapter,
  status,
  progress,
  expanded,
  lockReason,
  onToggle,
  onOpenSection,
  onOpenCheckpoint,
}: {
  index: number;
  chapter: CurriculumChapter;
  status: ChapterStatus;
  progress: ProgressBySection;
  expanded: boolean;
  /** Why a locked chapter is locked, named specifically enough to act on. */
  lockReason: string;
  onToggle: () => void;
  onOpenSection: (section: CurriculumSection) => void;
  onOpenCheckpoint: () => void;
}) {
  const faint = useToken('--ink-faint', '#62666e');
  const accent = useToken('--accent', '#5ec8c2');

  const locked = status === 'locked';
  const tally = chapterProgress(chapter, progress);
  const open = expanded && !locked;

  const summary = locked
    ? lockReason
    : status === 'complete'
      ? 'Complete'
      : `${tally.completed} of ${tally.total} done`;

  return (
    <View
      className={`rounded-[13px] border border-t-edge-top border-x-line-soft border-b-edge-bottom p-[15px] ${
        status === 'open' ? 'bg-surface' : 'bg-tray'
      }`}
    >
      <Pressable
        onPress={locked ? undefined : onToggle}
        disabled={locked}
        accessibilityRole="button"
        accessibilityState={{ disabled: locked, expanded: open }}
        accessibilityLabel={`Chapter ${index + 1}: ${chapter.title}`}
        className="flex-row items-center gap-[12px] active:opacity-60"
      >
        <View className="flex-1">
          <Text className="font-mono text-[9px] uppercase tracking-[2px] text-ink-faint">
            Chapter {index + 1}
          </Text>
          <Text
            className={`mt-[5px] text-[16px] font-semibold tracking-[-0.3px] ${
              locked ? 'text-ink-muted' : 'text-ink'
            }`}
          >
            {chapter.title}
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
          {chapter.summary ? (
            <Text className="mb-[10px] text-[12.5px] leading-[18px] text-ink-muted">
              {chapter.summary}
            </Text>
          ) : null}

          {chapter.sections.map((section) => (
            <SectionRow
              key={section.id}
              section={section}
              complete={sectionComplete(progress.get(section.id))}
              onPress={() => {
                if (section.kind === 'unknown') return;
                onOpenSection(section);
              }}
            />
          ))}

          <CheckpointRow chapter={chapter} progress={progress} onPress={onOpenCheckpoint} />
        </View>
      ) : null}
    </View>
  );
}

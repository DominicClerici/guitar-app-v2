import { SymbolView } from 'expo-symbols';
import { Pressable, Text, View } from 'react-native';

import { Face } from '@/components/Face';
import { StepMarker, stepStateFor } from '@/components/StepMarker';
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

/**
 * An article is the default here and says nothing about itself — a pathway is mostly reading, and
 * labelling every row READ is noise on the one kind the learner already assumes. The kinds that
 * are *not* reading still announce themselves.
 */
const KIND_LABEL: Partial<Record<CurriculumSection['kind'], string>> = {
  quiz: 'Quiz',
  activity: 'Practice',
};

function strapFor(section: CurriculumSection): string {
  const kind = KIND_LABEL[section.kind];
  const parts = kind ? [kind] : [];
  if (section.optional) parts.unshift('Optional');
  if (section.estimatedMin) parts.push(`${section.estimatedMin} min`);

  return parts.join(' · ').toUpperCase();
}

function SectionRow({
  section,
  complete,
  next,
  onPress,
}: {
  section: RenderSection;
  complete: boolean;
  next: boolean;
  onPress: () => void;
}) {
  // A section this build cannot open is shown rather than hidden, so chapter numbering reads the
  // same on every version of the app. It never counts and never blocks.
  if (section.kind === 'unknown') {
    return (
      <View className="flex-row items-center gap-[12px] border-t border-t-line-soft py-[13px] opacity-60">
        <StepMarker state="muted" />
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

  const strap = strapFor(section);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open ${section.title}`}
      className="flex-row items-center gap-[12px] border-t border-t-line-soft py-[13px] active:opacity-55"
    >
      <StepMarker state={stepStateFor({ complete, next, muted: section.optional === true })} />
      <View className="flex-1">
        <Text className="text-[14px] font-medium tracking-[-0.2px] text-ink">{section.title}</Text>
        {strap ? (
          <Text className="mt-[3px] font-mono text-[9px] uppercase tracking-[2px] text-ink-faint">
            {strap}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

function CheckpointRow({
  chapter,
  progress,
  next,
  onPress,
}: {
  chapter: CurriculumChapter;
  progress: ProgressBySection;
  next: boolean;
  onPress: () => void;
}) {
  const status = checkpointStatus(chapter, progress);
  if (status === 'none') return null;

  const score = progress.get(checkpointSectionId(chapter))?.bestScorePct;
  const locked = status === 'locked';
  const passed = status === 'passed';

  // The authored one-liner is what the row is *for*; the pass mark is a rule, not a name, and the
  // results screen is where it actually matters. A tree without one falls back to naming the row.
  const name = chapter.checkpoint?.title ?? 'Everything in this chapter';

  return (
    <Pressable
      onPress={onPress}
      disabled={locked}
      accessibilityRole="button"
      accessibilityState={{ disabled: locked }}
      accessibilityLabel={`Chapter quiz — ${name}${passed ? ', passed' : ''}`}
      className={`mt-[12px] flex-row items-center gap-[12px] px-[13px] py-[12px] ${
        locked ? 'opacity-55' : 'active:opacity-70'
      }`}
    >
      <Face name={locked ? 'key' : 'accent'} radius={10} />
      <StepMarker state={stepStateFor({ complete: passed, next, muted: locked })} />
      <View className="flex-1">
        <View className="flex-row items-center justify-between gap-[10px]">
          <Text className="font-mono text-[9px] uppercase tracking-[2px] text-ink-faint">
            Chapter Quiz
          </Text>
          {passed ? (
            <Text className="font-mono text-[9px] uppercase tracking-[2px] text-accent">
              Passed{score === null || score === undefined ? '' : ` · ${score}%`}
            </Text>
          ) : null}
        </View>
        <Text
          className={`mt-[3px] text-[13.5px] font-medium tracking-[-0.2px] ${
            locked ? 'text-ink-muted' : 'text-ink'
          }`}
        >
          {name}
        </Text>
        {locked ? (
          <Text className="mt-[3px] text-[11.5px] leading-[16px] text-ink-faint">
            Finish the lessons above first
          </Text>
        ) : null}
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
  nextSectionId,
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
  /**
   * The one row Continue opens, as a section id — `checkpointSectionId(chapter)` when what is
   * outstanding is the chapter quiz. Null on a finished pathway. Passed down rather than derived
   * here so the marker and the button can never disagree about where "next" is.
   */
  nextSectionId: string | null;
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
    <View className="p-[15px]">
      <Face name={status === 'open' ? 'card' : 'tray'} radius={13} />
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
              next={section.id === nextSectionId}
              onPress={() => {
                if (section.kind === 'unknown') return;
                onOpenSection(section);
              }}
            />
          ))}

          <CheckpointRow
            chapter={chapter}
            progress={progress}
            next={checkpointSectionId(chapter) === nextSectionId}
            onPress={onOpenCheckpoint}
          />
        </View>
      ) : null}
    </View>
  );
}

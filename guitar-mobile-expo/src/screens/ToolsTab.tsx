import { useRouter, type Href } from 'expo-router';
import { SymbolView, type SFSymbol } from 'expo-symbols';
import { useRef } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BpmSheet, type BpmSheetRef } from '@/features/bpm-finder';
import { TunerSheet, type TunerSheetRef } from '@/features/tuner';
import { useToken } from '@/lib/tokens';

export type ToolId =
  | 'tuner'
  | 'metronome'
  | 'chord-detector'
  | 'key-detector'
  | 'intonation'
  | 'bpm-finder'
  | 'drone'
  | 'chord-shapes'
  | 'scale-visualizer';

// A mark in a card emblem. Both emblems are the same primitive drawn from
// different data: the tuner's is a calibration scale, the metronome's is one bar
// of four with the downbeat accented.
interface Mark {
  height: string;
  tone: string;
}

const MINOR = 'bg-line';
const MAJOR = 'bg-ink-faint';

const TUNER_TICKS: Mark[] = [
  { height: 'h-[15px]', tone: MAJOR },
  { height: 'h-[8px]', tone: MINOR },
  { height: 'h-[8px]', tone: MINOR },
  { height: 'h-[8px]', tone: MINOR },
  { height: 'h-[15px]', tone: MAJOR },
  { height: 'h-[24px]', tone: 'bg-accent' },
  { height: 'h-[15px]', tone: MAJOR },
  { height: 'h-[8px]', tone: MINOR },
  { height: 'h-[8px]', tone: MINOR },
  { height: 'h-[8px]', tone: MINOR },
  { height: 'h-[15px]', tone: MAJOR },
];

const METRONOME_BEATS: Mark[] = [
  { height: 'h-[24px]', tone: 'bg-accent' },
  { height: 'h-[13px]', tone: MAJOR },
  { height: 'h-[13px]', tone: MAJOR },
  { height: 'h-[13px]', tone: MAJOR },
];

interface PinnedTool {
  id: ToolId;
  title: string;
  caption: string;
  marks: Mark[];
  markWidth: string;
  markGap: string;
}

// The two tools you reach for before playing anything, so they get the top of
// the page and a card each. Everything else lives in the catalogue below.
const PINNED: PinnedTool[] = [
  {
    id: 'tuner',
    title: 'Tuner',
    caption: 'PITCH · CENTS',
    marks: TUNER_TICKS,
    markWidth: 'w-[2px]',
    markGap: 'gap-[4px]',
  },
  {
    id: 'metronome',
    title: 'Metronome',
    caption: 'TEMPO · BEATS',
    marks: METRONOME_BEATS,
    markWidth: 'w-[3px]',
    markGap: 'gap-[16px]',
  },
];

interface Tool {
  id: ToolId;
  icon: SFSymbol;
  title: string;
  subtitle: string;
}

interface Section {
  label: string;
  tools: Tool[];
}

// Listen = takes the mic and tells you what it hears. Reference = something you
// consult or play against.
const SECTIONS: Section[] = [
  {
    label: 'Listen',
    tools: [
      {
        id: 'intonation',
        icon: 'ruler',
        title: 'Intonation Checker',
        subtitle: 'Checks each string against its 12th-fret harmonic',
      },
      {
        id: 'bpm-finder',
        icon: 'stopwatch',
        title: 'BPM Finder',
        subtitle: 'Reads the tempo of what it hears',
      },
    ],
  },
  {
    label: 'Reference',
    tools: [
      {
        id: 'chord-detector',
        icon: 'magnifyingglass',
        title: 'Chord Detector',
        subtitle: 'Names any shape you build on the neck',
      },
      {
        id: 'key-detector',
        icon: 'music.note.list',
        title: 'Key Detector',
        subtitle: 'Names the key of a progression you build',
      },
      {
        id: 'drone',
        icon: 'speaker.wave.2',
        title: 'Drone Player',
        subtitle: 'Holds a pitch to play against',
      },
      {
        id: 'chord-shapes',
        icon: 'guitars',
        title: 'Chord Shapes',
        subtitle: 'Every voicing, up the neck',
      },
      {
        id: 'scale-visualizer',
        icon: 'square.grid.3x3',
        title: 'Scale Visualizer',
        subtitle: 'Maps any scale onto the fretboard',
      },
    ],
  },
];

function Emblem({ marks, width, gap }: { marks: Mark[]; width: string; gap: string }) {
  return (
    <View className={`h-[24px] flex-row items-end ${gap}`}>
      {marks.map((mark, index) => (
        <View key={index} className={`rounded-full ${width} ${mark.height} ${mark.tone}`} />
      ))}
    </View>
  );
}

function PinnedCard({ tool, onPress }: { tool: PinnedTool; onPress: (id: ToolId) => void }) {
  return (
    <Pressable
      onPress={() => onPress(tool.id)}
      accessibilityRole="button"
      accessibilityLabel={`Open ${tool.title}`}
      className="flex-1 rounded-[13px] border border-t-edge-top border-x-line-soft border-b-edge-bottom bg-surface p-[16px] active:opacity-70"
    >
      <Emblem marks={tool.marks} width={tool.markWidth} gap={tool.markGap} />
      <Text className="mt-[18px] text-[16px] font-semibold tracking-[-0.2px] text-ink">
        {tool.title}
      </Text>
      <Text className="mt-[5px] font-mono text-[9.5px] tracking-[1.5px] text-ink-faint">
        {tool.caption}
      </Text>
    </Pressable>
  );
}

// The rule running off the label is what ties the rows beneath it into a set.
function SectionLabel({ label }: { label: string }) {
  return (
    <View className="flex-row items-center gap-[12px]">
      <Text className="font-mono text-[10px] font-semibold uppercase tracking-[2.5px] text-ink-faint">
        {label}
      </Text>
      <View className="h-px flex-1 bg-line-soft" />
    </View>
  );
}

function ToolRow({
  tool,
  last,
  onPress,
}: {
  tool: Tool;
  last: boolean;
  onPress: (id: ToolId) => void;
}) {
  const muted = useToken('--ink-muted', '#9aa0aa');
  const faint = useToken('--ink-faint', '#62666e');

  return (
    <Pressable
      onPress={() => onPress(tool.id)}
      accessibilityRole="button"
      accessibilityLabel={`Open ${tool.title}`}
      className={`flex-row items-center gap-[14px] py-[15px] active:opacity-55 ${
        last ? '' : 'border-b border-b-line-soft'
      }`}
    >
      <View className="w-[24px] items-center">
        <SymbolView name={tool.icon} size={18} tintColor={muted} />
      </View>
      <View className="flex-1">
        <Text className="text-[15px] font-medium tracking-[-0.2px] text-ink">{tool.title}</Text>
        <Text className="mt-[3px] text-[12.5px] leading-[17px] text-ink-muted">
          {tool.subtitle}
        </Text>
      </View>
      <SymbolView name="chevron.right" size={12} weight="semibold" tintColor={faint} />
    </Pressable>
  );
}

// Tools that have a screen of their own to push. The rest open in a sheet or
// are not built yet.
const ROUTES: Partial<Record<ToolId, Href>> = {
  'chord-detector': '/chord-detector',
  'key-detector': '/key-detector',
  intonation: '/intonation',
  metronome: '/metronome',
};

export function ToolsTab() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const tunerSheet = useRef<TunerSheetRef>(null);
  const bpmSheet = useRef<BpmSheetRef>(null);

  const openTool = (id: ToolId) => {
    if (id === 'tuner') {
      tunerSheet.current?.present();
      return;
    }
    if (id === 'bpm-finder') {
      bpmSheet.current?.present();
      return;
    }

    const route = ROUTES[id];
    if (route) router.push(route);
  };

  return (
    <View className="flex-1 bg-bg">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pt-[20px] px-[18px]"
        contentContainerStyle={{ paddingBottom: insets.bottom + 96 }}
      >
        <View className="flex-row gap-[10px]">
          {PINNED.map((tool) => (
            <PinnedCard key={tool.id} tool={tool} onPress={openTool} />
          ))}
        </View>

        {SECTIONS.map((section) => (
          <View key={section.label} className="mt-[32px]">
            <SectionLabel label={section.label} />
            <View className="mt-[2px]">
              {section.tools.map((tool, index) => (
                <ToolRow
                  key={tool.id}
                  tool={tool}
                  last={index === section.tools.length - 1}
                  onPress={openTool}
                />
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      <TunerSheet ref={tunerSheet} />
      <BpmSheet ref={bpmSheet} />
    </View>
  );
}

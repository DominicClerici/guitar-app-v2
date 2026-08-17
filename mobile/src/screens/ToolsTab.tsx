import { useRouter, type Href } from 'expo-router';
import { SymbolView, type SFSymbol } from 'expo-symbols';
import { useRef, type ReactNode } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useFacePaint } from '@/components/buttonFace';
import { SquirclePressable } from '@/components/Squircle';
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
  | 'scale-visualizer'
  | 'rhythm-trainer';

/** The one radius every card on this screen is drawn at. */
const CARD_RADIUS = 14;

// A mark in a bar emblem. The tuner's and the rhythm trainer's are the same
// primitive drawn from different data: a calibration scale, and one bar of
// eighths with the downbeat accented.
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

const RHYTHM_PULSES: Mark[] = [
  { height: 'h-[24px]', tone: 'bg-accent' },
  { height: 'h-[9px]', tone: MINOR },
  { height: 'h-[16px]', tone: MAJOR },
  { height: 'h-[9px]', tone: MINOR },
  { height: 'h-[16px]', tone: MAJOR },
  { height: 'h-[9px]', tone: MINOR },
  { height: 'h-[16px]', tone: MAJOR },
  { height: 'h-[9px]', tone: MINOR },
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

/** Where the grid's lines land, so the dots can be placed against them. */
const STRINGS = [0, 1, 2, 3, 4, 5];
const FRETS = [0, 1, 2];

/**
 * Three fingers of an open E on a two-fret window of the neck: the shape you
 * hold, which is what this tool is given and asked to name. `left` is a string,
 * `top` a fret space, both already centred on a 5px dot.
 */
const CHORD_DOTS = [
  { left: 'left-[9px]', top: 'top-[14px]' },
  { left: 'left-[20px]', top: 'top-[14px]' },
  { left: 'left-[31px]', top: 'top-[3px]' },
];

// A chord diagram rather than a bar chart: the bar emblems read as a signal
// over time, and nothing this tool does is about time.
function ChordEmblem() {
  return (
    <View className="h-[24px] w-[56px] justify-center">
      <View className="h-[23px] w-full">
        <View className="absolute inset-0 flex-row justify-between">
          {STRINGS.map((string) => (
            <View key={string} className="h-full w-px bg-line" />
          ))}
        </View>
        <View className="absolute inset-0 justify-between">
          {FRETS.map((fret) => (
            <View key={fret} className={`h-px w-full ${fret === 0 ? MAJOR : MINOR}`} />
          ))}
        </View>
        {CHORD_DOTS.map((dot) => (
          <View
            key={`${dot.left}${dot.top}`}
            className={`absolute h-[5px] w-[5px] rounded-full bg-accent ${dot.left} ${dot.top}`}
          />
        ))}
      </View>
    </View>
  );
}

interface CardTool {
  id: ToolId;
  title: string;
  caption: string;
  emblem: ReactNode;
}

// The two tools you reach for before playing anything, so they get the top of
// the page and a card each. Everything else lives in the catalogue below.
const PINNED: CardTool[] = [
  {
    id: 'tuner',
    title: 'Tuner',
    caption: 'PITCH · CENTS',
    emblem: <Emblem marks={TUNER_TICKS} width="w-[2px]" gap="gap-[4px]" />,
  },
  {
    id: 'chord-detector',
    title: 'Chord Finder',
    caption: 'SHAPE · NAME',
    emblem: <ChordEmblem />,
  },
];

// The one tool you sit down *with* rather than consult, so it takes the width
// of the page instead of half of it.
const FEATURED: CardTool = {
  id: 'rhythm-trainer',
  title: 'Rhythm Trainer',
  caption: 'READ · PLAY',
  emblem: <Emblem marks={RHYTHM_PULSES} width="w-[3px]" gap="gap-[8px]" />,
};

interface Tool {
  id: ToolId;
  icon: SFSymbol;
  title: string;
  subtitle: string;
}

interface Section {
  /** A key only — the rule above a group is what sets it apart, not a heading. */
  id: string;
  tools: Tool[];
}

// Two groups, in the order you meet them: the things you play against or look
// up, then the things that measure — a click to play to and the two tools that
// take the mic to tell you a number.
const SECTIONS: Section[] = [
  {
    id: 'reference',
    tools: [
      {
        id: 'drone',
        icon: 'speaker.wave.2',
        title: 'Drone Player',
        subtitle: 'Holds a pitch to play against',
      },
      {
        id: 'key-detector',
        icon: 'music.note.list',
        title: 'Key Detector',
        subtitle: 'Names the key of a progression you build',
      },
      {
        id: 'scale-visualizer',
        icon: 'square.grid.3x3',
        title: 'Scale Visualizer',
        subtitle: 'Maps any scale onto the fretboard',
      },
      {
        id: 'chord-shapes',
        icon: 'guitars',
        title: 'Chord Shapes',
        subtitle: 'Every voicing, up the neck',
      },
    ],
  },
  {
    id: 'measure',
    tools: [
      {
        id: 'metronome',
        icon: 'metronome',
        title: 'Metronome',
        subtitle: 'Keeps time at any tempo',
      },
      {
        id: 'bpm-finder',
        icon: 'stopwatch',
        title: 'BPM Finder',
        subtitle: 'Reads the tempo of what it hears',
      },
      {
        id: 'intonation',
        icon: 'ruler',
        title: 'Intonation Checker',
        subtitle: 'Checks each string against its 12th-fret harmonic',
      },
    ],
  },
];

function CardTitle({ tool }: { tool: CardTool }) {
  return (
    <>
      <Text className="text-[16px] font-semibold tracking-[-0.2px] text-ink">{tool.title}</Text>
      <Text className="mt-[5px] font-mono text-[9.5px] tracking-[1.5px] text-ink-faint">
        {tool.caption}
      </Text>
    </>
  );
}

/**
 * A card face: the flat hairline and fill of a `quiet` surface, drawn as a
 * native squircle. No bevel — the emblem is the thing that should catch the
 * eye here, not the edge.
 */
function useCardFace() {
  const paint = useFacePaint();
  return { radius: CARD_RADIUS, fill: paint('--surface'), stroke: paint('--line-soft') } as const;
}

function PinnedCard({ tool, onPress }: { tool: CardTool; onPress: (id: ToolId) => void }) {
  const face = useCardFace();

  return (
    <SquirclePressable
      onPress={() => onPress(tool.id)}
      accessibilityRole="button"
      accessibilityLabel={`Open ${tool.title}`}
      {...face}
      strokeWidth={1}
      className="flex-1 p-[16px] active:opacity-70"
    >
      {tool.emblem}
      <View className="mt-[18px]">
        <CardTitle tool={tool} />
      </View>
    </SquirclePressable>
  );
}

// The same card laid on its side: the page is wider than one emblem needs, so
// the title takes the left and the emblem sits out at the right margin.
function WideCard({ tool, onPress }: { tool: CardTool; onPress: (id: ToolId) => void }) {
  const face = useCardFace();

  return (
    <SquirclePressable
      onPress={() => onPress(tool.id)}
      accessibilityRole="button"
      accessibilityLabel={`Open ${tool.title}`}
      {...face}
      strokeWidth={1}
      className="flex-row items-center gap-[16px] px-[16px] py-[24px] active:opacity-70"
    >
      <View className="flex-1">
        <CardTitle tool={tool} />
      </View>
      {tool.emblem}
    </SquirclePressable>
  );
}

// The rule above a group is all that ties its rows into a set — the rows say
// what they are well enough on their own.
function SectionRule() {
  return <View className="h-px bg-line-soft" />;
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
  'chord-shapes': '/chord-shapes',
  'key-detector': '/key-detector',
  intonation: '/intonation',
  metronome: '/metronome',
  drone: '/drone',
  'scale-visualizer': '/scale-visualizer',
  'rhythm-trainer': '/rhythm-trainer',
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

        <View className="mt-[10px]">
          <WideCard tool={FEATURED} onPress={openTool} />
        </View>

        {SECTIONS.map((section) => (
          <View key={section.id} className="mt-[30px]">
            <SectionRule />
            {section.tools.map((tool, index) => (
              <ToolRow
                key={tool.id}
                tool={tool}
                last={index === section.tools.length - 1}
                onPress={openTool}
              />
            ))}
          </View>
        ))}
      </ScrollView>

      <TunerSheet ref={tunerSheet} />
      <BpmSheet
        ref={bpmSheet}
        onUseTempo={(bpm) => router.push({ pathname: '/metronome', params: { bpm: String(bpm) } })}
      />
    </View>
  );
}

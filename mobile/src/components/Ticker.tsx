import * as Haptics from 'expo-haptics';
import type { SFSymbol } from 'expo-symbols';
import { useEffect, useRef, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { clampTo, parseTyped, stepTo, type Range } from '@/lib/ticker';
import { useToken } from '@/lib/tokens';

import { Button } from './Button';
import { Face } from './Face';

/**
 * The pill tray's own radius. The height matches it too — `h-[38px]`, holding a
 * 30px key inside 4 points of padding — so a card can stack one under the other
 * and have the two read as the same kind of housing.
 */
const TRAY_RADIUS = 9;

/** Held this long before a key starts repeating, then one step this often. */
const REPEAT_DELAY = 380;
const REPEAT_EVERY = 70;

interface Props {
  value: number;
  onChange: (value: number) => void;
  /** How far one press moves it. */
  step?: number;
  min?: number;
  max?: number;
  /** Tapping the number opens it for typing. */
  isNumberEditable?: boolean;
  /** How the value reads, where the bare number is not it. */
  format?: (value: number) => string;
  /** Whether holding a key runs on stepping. Off for a range only a few wide. */
  repeatOnHold?: boolean;
  /**
   * Which way the keys sit. `vertical` stacks them — up over the readout, down under it — for a
   * row of tickers that have to be read across rather than one control on a settings line.
   */
  orientation?: 'horizontal' | 'vertical';
  disabled?: boolean;
  /** Names the control in each key's announcement. */
  label?: string;
  /** Layout only — width, flex, margins. */
  className?: string;
}

/**
 * A number with a key either side of it. The keys are the control: press one for
 * a step, hold it for a run of them. The number is a readout by default and a
 * field when `isNumberEditable` says so, which is worth turning on once a range
 * is wider than you would want to walk across.
 *
 * It wears the tray-and-keys face the metronome's beats control already had, at
 * the same height as `PillSelector`, so a settings card can put one under the
 * other and have the two agree. Give it its width from the call site: the keys
 * and the number take a third of it each, so the two things you press stay the
 * size of the control rather than the size of a glyph.
 *
 * ```tsx
 * <Ticker value={octave} onChange={setOctave} min={-1} max={1} label="Octave" className="w-2/3" />
 * ```
 *
 * Turned `vertical` it takes the other axis from the call site instead — the keys stack, and the
 * width and height are both the caller's to give, since a column of these is sized by the row it
 * sits in rather than by anything the control knows:
 *
 * ```tsx
 * <Ticker orientation="vertical" value={pitch} onChange={tune} className="h-[108px] flex-1" />
 * ```
 *
 * The arithmetic — clamping, the step grid, what a typed value comes out as —
 * lives in `@/lib/ticker`.
 */
export function Ticker({
  value,
  onChange,
  step = 1,
  min = -Infinity,
  max = Infinity,
  isNumberEditable = false,
  format,
  repeatOnHold = true,
  orientation = 'horizontal',
  disabled = false,
  label,
  className = '',
}: Props) {
  const accent = useToken('--accent', '#5ec8c2');
  /** What is in the field while it is open, which is not yet the value. */
  const [draft, setDraft] = useState<string | null>(null);

  const range: Range = { min, max, step };
  const display = format ? format(value) : String(value);
  const named = label ? `${label}, ${display}` : display;
  const vertical = orientation === 'vertical';

  const commit = () => {
    const typed = draft === null ? null : parseTyped(draft, range);
    setDraft(null);
    if (typed !== null && typed !== value) onChange(typed);
  };

  const decrease = (
    <Key
      symbol={vertical ? 'chevron.down' : 'minus'}
      accessibilityLabel={label ? `Decrease ${label}` : 'Decrease'}
      disabled={disabled || value <= min}
      from={value}
      delta={-1}
      range={range}
      repeatOnHold={repeatOnHold}
      vertical={vertical}
      onChange={onChange}
    />
  );

  const increase = (
    <Key
      symbol={vertical ? 'chevron.up' : 'plus'}
      accessibilityLabel={label ? `Increase ${label}` : 'Increase'}
      disabled={disabled || value >= max}
      from={value}
      delta={1}
      range={range}
      repeatOnHold={repeatOnHold}
      vertical={vertical}
      onChange={onChange}
    />
  );

  return (
    <View
      className={`items-center p-[4px] ${
        // Upright, the caller gives both axes: a row of these is as wide as the row lets them be.
        vertical ? 'flex-col' : 'h-[38px] flex-row'
      } ${className}`}
    >
      <Face name="tray" radius={TRAY_RADIUS} />

      {/* Up is the increase whichever way the control lies, so the keys are ordered rather than
          swapped: reading down the stack is reading the pitches in the order they sound. */}
      {vertical ? increase : decrease}

      {/* The middle third, between a key of the same size either side. */}
      <View className={`flex-1 items-center justify-center ${vertical ? 'w-full' : 'h-full'}`}>
        {draft !== null ? (
          <TextInput
            value={draft}
            onChangeText={setDraft}
            onBlur={commit}
            onSubmitEditing={commit}
            autoFocus
            selectTextOnFocus
            returnKeyType="done"
            // A range that reaches below zero, or steps by less than one, needs
            // more than the digits pad has on it.
            keyboardType={min < 0 || step < 1 ? 'numbers-and-punctuation' : 'number-pad'}
            selectionColor={accent}
            accessibilityLabel={label ?? 'Value'}
            className="h-full w-full text-center font-mono text-[14px] text-ink"
          />
        ) : isNumberEditable ? (
          <Pressable
            onPress={() => setDraft(String(value))}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={`Edit ${named}`}
            className="h-full w-full items-center justify-center active:opacity-60"
          >
            <Readout display={display} disabled={disabled} />
          </Pressable>
        ) : (
          <View accessible accessibilityLabel={named}>
            <Readout display={display} disabled={disabled} />
          </View>
        )}
      </View>

      {vertical ? decrease : increase}
    </View>
  );
}

interface KeyProps {
  symbol: SFSymbol;
  accessibilityLabel: string;
  disabled: boolean;
  /** Where the next run starts from. */
  from: number;
  /** Which way one press goes. */
  delta: number;
  range: Range;
  repeatOnHold: boolean;
  /** Stacked keys take the tray's width and their own height, rather than the other way round. */
  vertical: boolean;
  onChange: (value: number) => void;
}

/**
 * One end of the ticker. It owns the run rather than the ticker doing so,
 * because a repeat fires faster than the parent can hand back what it set —
 * so where the run has got to is kept in the press itself, and each step goes
 * from there rather than from a `value` prop several steps behind.
 */
function Key({
  symbol,
  accessibilityLabel,
  disabled,
  from,
  delta,
  range,
  repeatOnHold,
  vertical,
  onChange,
}: KeyProps) {
  const delay = useRef<ReturnType<typeof setTimeout> | null>(null);
  const repeat = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopRepeating = () => {
    if (delay.current) {
      clearTimeout(delay.current);
      delay.current = null;
    }
    if (repeat.current) {
      clearInterval(repeat.current);
      repeat.current = null;
    }
  };

  useEffect(() => stopRepeating, []);

  // The step lands on press rather than on release, so a quick tap is a step and
  // a hold is a run of them without the first one arriving late.
  const onPressIn = () => {
    let current = clampTo(from, range);

    const advance = () => {
      const next = stepTo(current, delta, range);
      // Reaching the end stops the run there rather than going on reporting the
      // same number fourteen times a second.
      if (next === current) {
        stopRepeating();
        return;
      }

      current = next;
      void Haptics.selectionAsync();
      onChange(next);
    };

    advance();
    if (!repeatOnHold) return;

    delay.current = setTimeout(() => {
      repeat.current = setInterval(advance, REPEAT_EVERY);
    }, REPEAT_DELAY);
  };

  return (
    <Button
      variant="secondary"
      size="xs"
      // Not `square`: the key takes a third of the tray rather than a width from
      // its own height. `flex-1` is what makes the thirds equal — on the `auto`
      // basis a square would have, the glyph's own box would be handed out
      // first and only the remainder would be split three ways.
      square={false}
      icon={symbol}
      disabled={disabled}
      hitSlop={6}
      accessibilityLabel={accessibilityLabel}
      onPressIn={onPressIn}
      onPressOut={stopRepeating}
      // Stacked, the size's own height is the right one and only the width is the tray's, so the
      // readout keeps whatever is left between the two keys rather than a third of the column.
      className={vertical ? 'w-full' : 'flex-1'}
    />
  );
}

function Readout({ display, disabled }: { display: string; disabled: boolean }) {
  return (
    <Text
      numberOfLines={1}
      className={`font-mono text-[14px] ${disabled ? 'text-ink-faint' : 'text-ink'}`}
    >
      {display}
    </Text>
  );
}

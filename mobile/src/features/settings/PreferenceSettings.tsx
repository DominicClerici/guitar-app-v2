import type { ReactNode } from 'react';
import { useRef } from 'react';
import { Text, View } from 'react-native';

import { Face } from '@/components/Face';
import type { PillOption } from '@/components/PillSelector';
import { usePreferences } from '@/lib/preferences';

import { ActionRow } from './ActionRow';
import { ColorVisionSheet, type ColorVisionSheetRef } from './ColorVisionSheet';
import { describeColorVision } from './colorVision';
import { PreferenceRow } from './PreferenceRow';
import { TuningSheet, type TuningSheetRef } from './TuningSheet';
import { describeTuning, tuningFrom } from './tuning';

/** Ids are the stored values — see `preferenceSchemas` in `@guitar/shared`. */
const THEME_OPTIONS: PillOption[] = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'system', label: 'System', name: 'System, following the device' },
];

const ACCIDENTAL_OPTIONS: PillOption[] = [
  { id: 'sharp', label: 'Sharps' },
  { id: 'flat', label: 'Flats' },
  { id: 'auto', label: 'Auto', name: 'Auto, however the key is spelled' },
];

/**
 * Both toggles are stated as the thing itself rather than as its absence — "Haptics: Off" rather
 * than "Disable haptics: On", which is a row you have to read twice to find out what it is doing.
 * Reduce motion keeps its own name because that is what the system setting it follows is called,
 * and matching it is how someone recognises the setting they already have.
 */
const TOGGLE_OPTIONS: PillOption[] = [
  { id: 'on', label: 'On' },
  { id: 'off', label: 'Off' },
];

/**
 * The settings that follow the account rather than the device, in one card.
 *
 * Both are read from the local database and both are written to it, so they are already correct on
 * a device that has never been online and they arrive on a second one when sync next runs. Neither
 * row knows that — reading is a live query and writing returns immediately (BACKEND_PLAN.md §6).
 *
 * `footer` is where the account's own rows go, under a rule of their own. They share the card
 * rather than starting another one because there is only one list of things to change on this
 * screen, and a second card for three rows would read as a second screen's worth of settings.
 */
export function PreferenceSettings({ footer }: { footer?: ReactNode }) {
  const preferences = usePreferences();
  const tuning = useRef<TuningSheetRef>(null);
  const colorVision = useRef<ColorVisionSheetRef>(null);

  return (
    <View>
      <SectionLabel label="Preferences" />

      <View className="mt-[14px] py-[3px]">
        <Face name="card" radius={14} />

        <PreferenceRow
          label="Appearance"
          name="theme"
          stored={preferences.theme}
          options={THEME_OPTIONS}
        />

        <View className="mx-[14px] h-px bg-line-soft" />

        <PreferenceRow
          label="Accidentals"
          name="accidentalPreference"
          stored={preferences.accidentalPreference}
          options={ACCIDENTAL_OPTIONS}
        />

        <View className="mx-[14px] h-px bg-line-soft" />

        {/* A palette cannot be picked from a pill tray for the same reason a tuning cannot: the
            names mean nothing until you have seen what they do. */}
        <ActionRow
          label="Colour vision"
          value={describeColorVision(preferences.colorVision)}
          onPress={() => colorVision.current?.present()}
        />

        <View className="mx-[14px] h-px bg-line-soft" />

        <PreferenceRow
          label="Haptics"
          name="haptics"
          stored={preferences.haptics}
          options={TOGGLE_OPTIONS}
        />

        <View className="mx-[14px] h-px bg-line-soft" />

        {/* Off until the device says otherwise: a phone already set to reduce motion arrives here
            reading On, without anything having been written for the user. See `usePreferences`. */}
        <PreferenceRow
          label="Reduce motion"
          name="reduceMotion"
          stored={preferences.reduceMotion}
          options={TOGGLE_OPTIONS}
        />

        <View className="mx-[14px] h-px bg-line-soft" />

        {/* Six strings will not fit on a settings line, so this one says what it is set to and
            opens the control that sets it. */}
        <ActionRow
          label="Tuning"
          value={describeTuning(tuningFrom(preferences.tuning), preferences.accidentalPreference)}
          onPress={() => tuning.current?.present()}
        />

        {footer ? (
          <>
            <View className="mx-[14px] h-px bg-line-soft" />
            {footer}
          </>
        ) : null}
      </View>

      <TuningSheet
        ref={tuning}
        stored={preferences.tuning}
        accidentals={preferences.accidentalPreference}
      />

      <ColorVisionSheet ref={colorVision} stored={preferences.colorVision} />
    </View>
  );
}

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

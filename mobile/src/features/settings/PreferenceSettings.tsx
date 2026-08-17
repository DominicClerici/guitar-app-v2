import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

import { Face } from '@/components/Face';
import type { PillOption } from '@/components/PillSelector';
import { usePreferences } from '@/lib/preferences';

import { PreferenceRow } from './PreferenceRow';

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

        {footer ? (
          <>
            <View className="mx-[14px] h-px bg-line-soft" />
            {footer}
          </>
        ) : null}
      </View>
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

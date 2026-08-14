import { readToolSettings, writeToolSettings } from '@/lib/tool-settings';

import { decodeSettings, type TrainerSettings } from './trainerSettings';

/**
 * The trainer's settings, in and out of the device database.
 *
 * The split is the same one `lib/preferences` makes: what a setting is allowed to be is a pure
 * question with a test, and where the row lives is not. Nothing here validates and nothing there
 * reads.
 */

const TOOL = 'rhythm-trainer' as const;

export function loadSettings(): TrainerSettings {
  return decodeSettings(readToolSettings(TOOL));
}

export function saveSettings(settings: TrainerSettings): void {
  writeToolSettings(TOOL, JSON.stringify(settings));
}

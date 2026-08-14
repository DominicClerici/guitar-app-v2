/**
 * How a tool remembers the way it was left (BACKEND_PLAN.md §6).
 *
 * Device-local, so unlike `lib/preferences` there is no account to key on, nothing to push and
 * nothing to merge — a write lands in SQLite and that is the whole story. What this module owns is
 * only the row; what the JSON in it means belongs to the tool, which parses it at its own boundary.
 *
 * Reads are synchronous, which is the point: a tool opens already showing the tempo and the note
 * values you left it on, with no loading state and no first frame at the defaults.
 */
import { toolSettings } from '@guitar/db/schema.sqlite';
import { eq } from 'drizzle-orm';

import { db } from '@/lib/db';

/** The tools that keep settings. A string union rather than free text so a typo cannot orphan a row. */
export type ToolSettingsKey = 'rhythm-trainer';

/**
 * The stored body, or null when nothing has been saved — which is also what a database whose
 * migrations have not run yet answers. Every caller has to handle null anyway, so a failed read is
 * reported as the same thing rather than thrown: a tool that cannot reach its settings opens at its
 * defaults, which is the behaviour that was wanted.
 */
export function readToolSettings(tool: ToolSettingsKey): string | null {
  try {
    const row = db.select().from(toolSettings).where(eq(toolSettings.tool, tool)).get();
    return row?.body ?? null;
  } catch {
    return null;
  }
}

export function writeToolSettings(tool: ToolSettingsKey, body: string): void {
  try {
    db.insert(toolSettings)
      .values({ tool, body, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: toolSettings.tool,
        set: { body, updatedAt: new Date() },
      })
      .run();
  } catch {
    // A setting that could not be saved is a setting that opens at its default next time, which is
    // not worth interrupting a practice session over.
  }
}

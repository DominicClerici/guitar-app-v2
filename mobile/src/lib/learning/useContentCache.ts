/**
 * Keeping the device's offline copy in line with what the learner is working on
 * (BACKEND_PLAN.md §6, §8).
 *
 * `reconcileCache` is the only thing that fills the content cache, and this hook is the only thing
 * that calls it. Nothing else does it on the way past — an article opened from a pathway is cached
 * because its whole chapter was fetched here, not because it was read — so with this unmounted the
 * device holds nothing and a pathway is unreadable the moment the network goes.
 *
 * It runs whenever the target changes (an enrollment started or dropped, a chapter finished) and on
 * every foreground, which is when a chapter's version is most likely to have moved on. Every fetch
 * behind it is version-conditional, so the usual foreground cost is one small round trip per cached
 * chapter rather than a re-download.
 */
import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { reconcileCache, type CachedChapter } from '@/lib/content-cache';

/**
 * `null` means "not known yet" and is emphatically not an empty target: an empty one evicts every
 * cached chapter, which is the right answer once a learner has dropped everything and the wrong one
 * while a pathway tree is still loading.
 */
export function useContentCache(target: readonly CachedChapter[] | null): void {
  const [attempt, setAttempt] = useState(0);
  // Identity, not contents: `target` is rebuilt every render, and depending on it directly would
  // re-fetch three chapters on every keystroke's worth of re-render.
  const key =
    target === null
      ? null
      : target.map((chapter) => `${chapter.pathwaySlug}/${chapter.chapterId}`).join(' ');

  const latest = useRef(target);
  useEffect(() => {
    latest.current = target;
  }, [target]);

  useEffect(() => {
    const chapters = latest.current;
    if (key === null || chapters === null) return;

    // Failure is the ordinary case here — being offline — and there is no screen to report it to.
    // Whatever is cached still renders, and the next foreground tries again.
    void reconcileCache(chapters).catch(() => undefined);
  }, [key, attempt]);

  useEffect(() => {
    const foreground = AppState.addEventListener('change', (state) => {
      if (state === 'active') setAttempt((n) => n + 1);
    });

    return () => foreground.remove();
  }, []);
}

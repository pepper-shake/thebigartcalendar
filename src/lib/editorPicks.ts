import type { ArtEvent } from '@/types';
import { eventSlug } from '@/lib/slug';
import { isCurrent, todayISO } from '@/lib/events';

/**
 * "Editor choice" on the homepage, chosen by hand each month. Keyed by month
 * ("YYYY-MM"); values are event slugs (the part after /events/). The first slug
 * is the large card, the next four the small ones.
 *
 * Picks that are hidden, deleted or already finished drop out, and the band is
 * topped up with the next upcoming events that have an image, so it is never
 * empty. See docs/product/homepage.md.
 */
export const EDITOR_PICKS: Record<string, string[]> = {
  // '2026-11': ['some-event-slug', '…'],
};

export const EDITOR_PICKS_COUNT = 5;

export interface EditorChoice {
  /** True when at least one hand-picked event is shown. */
  curated: boolean;
  events: ArtEvent[];
}

export function selectEditorChoice(current: ArtEvent[], today: string = todayISO()): EditorChoice {
  const slugs = EDITOR_PICKS[today.slice(0, 7)] ?? [];
  const bySlug = new Map(current.map((e) => [eventSlug(e), e]));
  const picked = slugs
    .map((s) => bySlug.get(s))
    .filter((e): e is ArtEvent => !!e && isCurrent(e, today))
    .slice(0, EDITOR_PICKS_COUNT);

  const chosen = new Set(picked.map((e) => e.id));
  // Top-up: events starting soonest (not long-running shows that began months
  // ago), with an image, skipping repeats of the same title.
  const titles = new Set(picked.map((e) => e.title));
  const fill: ArtEvent[] = [];
  for (const e of current) {
    if (picked.length + fill.length >= EDITOR_PICKS_COUNT) break;
    if (chosen.has(e.id) || !e.image || e.date < today || titles.has(e.title)) continue;
    titles.add(e.title);
    fill.push(e);
  }
  return { curated: picked.length > 0, events: [...picked, ...fill] };
}

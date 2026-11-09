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
 * empty. A pick can carry its own `image` for the homepage card only (the
 * event page keeps its own): a site path under public/editor-picks/<month>/ or
 * any image URL. See docs/product/homepage.md.
 */
export type EditorPick = string | { slug: string; image: string };

export const EDITOR_PICKS: Record<string, EditorPick[]> = {
  '2026-11': [
    'zinemaking-as-alternative-future-making-with-ema-goncalves-lisbon-c91411fa',
    {
      slug: 'drawing-session-190-lisbon-840706d1',
      // Lisbon Drawing Club's photo from its /places page.
      image:
        'https://pn4cabqkop1baqwd.public.blob.vercel-storage.com/places/lisbon-drawing-club-Qyv1pSdmp5T6jVtEyBDfNgWEAy671a.jpg',
    },
    'soap-making-porto-cad848c6',
    'ceramic-workshop-with-the-artist-mab-ko-porto-09270406',
    { slug: 'embroidery-workshop-lisbon-c358269f', image: '/editor-picks/2026-11/embroidery-workshop.webp' },
  ],
};

export const EDITOR_PICKS_COUNT = 5;

export interface EditorChoice {
  /** True when at least one hand-picked event is shown. */
  curated: boolean;
  events: ArtEvent[];
}

export function selectEditorChoice(current: ArtEvent[], today: string = todayISO()): EditorChoice {
  const picks = EDITOR_PICKS[today.slice(0, 7)] ?? [];
  const bySlug = new Map(current.map((e) => [eventSlug(e), e]));
  const picked = picks
    .map((p) => {
      const pick = typeof p === 'string' ? { slug: p } : p;
      const e = bySlug.get(pick.slug);
      if (!e || !isCurrent(e, today)) return undefined;
      return 'image' in pick ? { ...e, image: pick.image } : e;
    })
    .filter((e): e is ArtEvent => !!e)
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

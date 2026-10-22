import type { ArtEvent } from '@/types';
import { slugify } from '@/lib/slug';

/**
 * Duotone card schemes (Figma "Calendar", cards 285:4018…285:4061; Style
 * Reference 1 §1): each card is exactly one background + one foreground. Title,
 * meta, chip text and icons all use `fg`; `chip` is the translucent wash behind
 * the type label (white on light cards, black on dark ones).
 */
export interface CardScheme {
  bg: string;
  fg: string;
  chip: string;
}

const LIGHT_CHIP = 'rgba(255, 255, 255, 0.5)';
const DARK_CHIP = 'rgba(0, 0, 0, 0.2)';

/** Schemes series are coloured from (see assignCardSchemes). */
export const CARD_SCHEMES: CardScheme[] = [
  { bg: '#E4B6D1', fg: '#5A1F2D', chip: LIGHT_CHIP }, // blush / oxblood
  { bg: '#263322', fg: '#B0E2A0', chip: DARK_CHIP }, // forest / lime
  { bg: '#92B8DA', fg: '#5A1F2D', chip: LIGHT_CHIP }, // sky / oxblood
  { bg: '#FEEA8A', fg: '#427BB7', chip: LIGHT_CHIP }, // butter / cornflower
  { bg: '#AAA462', fg: '#FFE4AD', chip: DARK_CHIP }, // olive / cream
  // Extra pairs from Style Reference 1 §2.2, so that no day needs a repeat
  // (the busiest days carry ~8 different events).
  { bg: '#155797', fg: '#C3D7C5', chip: DARK_CHIP }, // cobalt / sage
  { bg: '#EB4937', fg: '#C4D5C3', chip: DARK_CHIP }, // tomato / sage
  { bg: '#6D453E', fg: '#F4E8A9', chip: DARK_CHIP }, // cocoa / butter
  { bg: '#C7A086', fg: '#5A1F2D', chip: LIGHT_CHIP }, // tan / oxblood
  { bg: '#000E58', fg: '#92B8DA', chip: DARK_CHIP }, // navy / sky
];

/**
 * Places whose events always use one scheme, keyed by /places slug (matched on
 * the event's venue or organiser). These schemes are reserved: they are not in
 * CARD_SCHEMES, so no other event can land on them.
 */
const PLACE_SCHEMES: Record<string, CardScheme> = {
  'disco-wheel': { bg: '#5A1F2E', fg: '#ED87AF', chip: DARK_CHIP }, // wine / pink
};

function pinnedScheme(event: Pick<ArtEvent, 'venuePlace' | 'organiserPlace'>): CardScheme | undefined {
  return PLACE_SCHEMES[event.venuePlace?.slug ?? ''] ?? PLACE_SCHEMES[event.organiserPlace?.slug ?? ''];
}

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) & 0xffffffff;
  return Math.abs(h);
}

/** A "series": the same event recurring on other dates (same title, same venue). */
function seriesKey(e: ArtEvent): string {
  return `${slugify(e.title)}|${slugify(e.venue ?? '')}|${slugify(e.city ?? '')}`;
}

/** Every YYYY-MM-DD an event covers (start..end inclusive). */
function daysCovered(e: ArtEvent): string[] {
  const end = e.endDate ?? e.date;
  const [y, m, d] = e.date.split('-').map(Number);
  const cur = new Date(Date.UTC(y, m - 1, d));
  const days: string[] = [];
  for (let s = e.date; s <= end && days.length < 400; ) {
    days.push(s);
    cur.setUTCDate(cur.getUTCDate() + 1);
    s = cur.toISOString().slice(0, 10);
  }
  return days;
}

/**
 * Give every event a card scheme so that no two series showing on the same day
 * share a colour, while every date of one series keeps the same colour.
 *
 * Greedy graph colouring: series are nodes, and two series conflict when they
 * are on at least one common day. Series are coloured in order of their first
 * date, each taking its preferred colour (hashed from the series key) if no
 * conflicting series already has it, otherwise the next free one. Processing in
 * date order keeps colours stable as the scrape adds later events. With more
 * than CARD_SCHEMES.length series on one day a repeat is unavoidable; then the
 * colour least used by conflicting series is taken. Pinned places keep their
 * reserved scheme and don't take part.
 */
export function assignCardSchemes(events: ArtEvent[]): ArtEvent[] {
  const n = CARD_SCHEMES.length;
  const seriesOf = new Map<string, string>(); // event id → series key
  const firstDate = new Map<string, string>(); // series key → earliest date
  const byDay = new Map<string, Set<string>>(); // day → series keys on it

  for (const e of events) {
    if (pinnedScheme(e)) continue;
    const key = seriesKey(e);
    seriesOf.set(e.id, key);
    if (!firstDate.has(key) || e.date < firstDate.get(key)!) firstDate.set(key, e.date);
    for (const day of daysCovered(e)) {
      const set = byDay.get(day) ?? new Set<string>();
      set.add(key);
      byDay.set(day, set);
    }
  }

  const neighbours = new Map<string, Set<string>>();
  for (const keys of byDay.values()) {
    for (const a of keys) {
      const set = neighbours.get(a) ?? new Set<string>();
      for (const b of keys) if (b !== a) set.add(b);
      neighbours.set(a, set);
    }
  }

  const order = [...firstDate.keys()].sort(
    (a, b) => firstDate.get(a)!.localeCompare(firstDate.get(b)!) || a.localeCompare(b),
  );
  const colour = new Map<string, number>();
  for (const key of order) {
    const used = new Array<number>(n).fill(0);
    for (const nb of neighbours.get(key) ?? []) {
      const c = colour.get(nb);
      if (c !== undefined) used[c]++;
    }
    const preferred = hash(key) % n;
    let pick = -1;
    for (let i = 0; i < n && pick < 0; i++) if (used[(preferred + i) % n] === 0) pick = (preferred + i) % n;
    if (pick < 0) pick = used.indexOf(Math.min(...used)); // more than n series on a day
    colour.set(key, pick);
  }

  return events.map((e) => {
    const key = seriesOf.get(e.id);
    return key === undefined ? e : { ...e, schemeIndex: colour.get(key) };
  });
}

/**
 * Card scheme for an event: a place's pinned scheme if it has one, else the
 * scheme assignCardSchemes chose, else (event not run through it) a hash of
 * the id.
 */
export function getCardScheme(
  event: Pick<ArtEvent, 'id' | 'venuePlace' | 'organiserPlace' | 'schemeIndex'>,
): CardScheme {
  return (
    pinnedScheme(event) ??
    CARD_SCHEMES[event.schemeIndex ?? hash(event.id) % CARD_SCHEMES.length]
  );
}

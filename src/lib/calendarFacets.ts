import { ArtEvent, CalendarFilters, EventType } from '@/types';

// Which calendar options have events. The calendar only ever offers years,
// months, types and cities that lead to at least one event (past events count —
// they stay browsable in grayscale), and each option reacts to the other
// filters: e.g. with city = Lisbon, only months/years/types with Lisbon events
// are offered. Dates are handled by DateStrip, which only lists event days.

const pad = (n: number) => String(n).padStart(2, '0');

/** "YYYY-MM" for a 0-indexed month. */
export const monthKey = (year: number, month: number) => `${year}-${pad(month + 1)}`;

/** Every "YYYY-MM" an event covers, start to end inclusive (multi-day exhibitions). */
function monthKeysOf(e: ArtEvent): string[] {
  const end = (e.endDate ?? e.date).slice(0, 7);
  const keys: string[] = [];
  let [y, m] = e.date.slice(0, 7).split('-').map(Number);
  for (let k = e.date.slice(0, 7); k <= end; ) {
    keys.push(k);
    m++;
    if (m > 12) { m = 1; y++; }
    k = `${y}-${pad(m)}`;
  }
  return keys;
}

const matchesType = (e: ArtEvent, f: CalendarFilters) => f.type === 'all' || e.type === f.type;
const matchesCity = (e: ArtEvent, f: CalendarFilters) => f.city === 'all' || e.city === f.city;

export interface CalendarFacets {
  /** Sorted "YYYY-MM" keys that have events under the current type + city filters. */
  monthKeys: string[];
  years: number[];
  /** Types with events in the selected city (any type selection). */
  types: EventType[];
  /** Cities with events of the selected type (any city selection). */
  cities: string[];
}

export function computeFacets(events: ArtEvent[], filters: CalendarFilters): CalendarFacets {
  const keys = new Set<string>();
  const types = new Set<EventType>();
  const cities = new Set<string>();
  for (const e of events) {
    const t = matchesType(e, filters);
    const c = matchesCity(e, filters);
    if (t && c) monthKeysOf(e).forEach((k) => keys.add(k));
    if (c) types.add(e.type);
    if (t && e.city) cities.add(e.city);
  }
  const monthKeys = [...keys].sort();
  return {
    monthKeys,
    years: [...new Set(monthKeys.map((k) => Number(k.slice(0, 4))))],
    types: [...types],
    cities: [...cities].sort(),
  };
}

/** 0-indexed months of `year` that have events. */
export function monthsInYear(monthKeys: string[], year: number): number[] {
  return monthKeys.filter((k) => k.startsWith(`${year}-`)).map((k) => Number(k.slice(5)) - 1);
}

/** The month to show for a requested year/month: itself if it has events,
 *  else the next month with events, else the latest one. */
export function resolveMonth(
  monthKeys: string[],
  year: number,
  month: number,
): { year: number; month: number } {
  if (monthKeys.length === 0) return { year, month };
  const target = monthKey(year, month);
  const hit = monthKeys.find((k) => k >= target) ?? monthKeys[monthKeys.length - 1];
  return { year: Number(hit.slice(0, 4)), month: Number(hit.slice(5)) - 1 };
}

/** When the user picks a year: keep the current month if it has events there,
 *  else the next month with events in that year, else that year's last one. */
export function monthForYear(monthKeys: string[], year: number, month: number): number {
  const months = monthsInYear(monthKeys, year);
  if (months.length === 0) return month;
  return months.find((m) => m >= month) ?? months[months.length - 1];
}

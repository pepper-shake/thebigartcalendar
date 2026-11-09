import type { ArtEvent } from '@/types';

/** "2026-11-09" + n days, as YYYY-MM-DD (UTC arithmetic, so no DST drift). */
function addDays(iso: string, n: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/**
 * The next `count` days, from `today` on, that have at least one event, the
 * same way the calendar's day strip counts them: a multi-day event covers every
 * day it runs. Looks at most `horizon` days ahead.
 */
export function nextEventDays(events: ArtEvent[], today: string, count = 4, horizon = 120): string[] {
  const last = addDays(today, horizon);
  const days = new Set<string>();
  for (const e of events) {
    const end = e.endDate ?? e.date;
    if (end < today || e.date > last) continue;
    let d = e.date < today ? today : e.date;
    const stop = end > last ? last : end;
    for (let i = 0; d <= stop && i <= horizon; i++, d = addDays(d, 1)) days.add(d);
  }
  return [...days].sort().slice(0, count);
}

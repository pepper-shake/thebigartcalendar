// Maps an event's country to its IANA timezone. Scoped to countries we
// currently ingest — all single-timezone, so the mapping is unambiguous.
// Extend this as new countries appear in the data.
const COUNTRY_TZ: Record<string, string> = {
  Portugal: 'Europe/Lisbon',
  Italy: 'Europe/Rome',
  Hungary: 'Europe/Budapest',
  Lithuania: 'Europe/Vilnius',
  'United Kingdom': 'Europe/London',
  Poland: 'Europe/Warsaw',
  Spain: 'Europe/Madrid',
  France: 'Europe/Paris',
  Germany: 'Europe/Berlin',
  Netherlands: 'Europe/Amsterdam',
  Belgium: 'Europe/Brussels',
  Austria: 'Europe/Vienna',
};

/** IANA timezone for an event's country, or null if we don't know it. */
export function eventTimeZone(country: string): string | null {
  return COUNTRY_TZ[country] ?? null;
}

/** "Europe/London" → "London"; "America/New_York" → "New York". */
export function zoneCity(tz: string): string {
  return tz.split('/').pop()?.replace(/_/g, ' ') ?? tz;
}

/** Milliseconds to add to a UTC instant to get wall-clock time in `tz`. */
function tzOffsetMs(instant: Date, tz: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(instant);
  const p: Record<string, string> = {};
  for (const part of parts) p[part.type] = part.value;
  // Intl can render hour "24" at midnight; normalize to 0.
  const hour = p.hour === '24' ? 0 : Number(p.hour);
  const asUTC = Date.UTC(Number(p.year), Number(p.month) - 1, Number(p.day), hour, Number(p.minute), Number(p.second));
  return asUTC - instant.getTime();
}

/** The UTC instant for a wall-clock date+time interpreted in `tz`. */
function zonedWallToUtc(year: number, month: number, day: number, hour: number, minute: number, tz: string): Date {
  const guess = Date.UTC(year, month - 1, day, hour, minute);
  // Two passes settle the offset across DST boundaries.
  let utc = guess - tzOffsetMs(new Date(guess), tz);
  utc = guess - tzOffsetMs(new Date(utc), tz);
  return new Date(utc);
}

/** "HH:MM" (24h) for an instant rendered in `tz`. */
function formatHHMM(instant: Date, tz: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: tz,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(instant);
}

/**
 * The event's start time expressed in the viewer's timezone, as "15:00 London".
 * Returns null when there's nothing useful to show — unknown zones, or when the
 * viewer's clock time matches the event's (same instant), so we don't render a
 * redundant duplicate.
 */
export function viewerLocalTime(
  dateStr: string,
  timeStr: string,
  eventTz: string,
  viewerTz: string,
): string | null {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hour, minute] = timeStr.split(':').map(Number);
  if (!year || !month || !day || Number.isNaN(hour) || Number.isNaN(minute)) return null;

  const instant = zonedWallToUtc(year, month, day, hour, minute, eventTz);
  const eventHHMM = formatHHMM(instant, eventTz);
  const viewerHHMM = formatHHMM(instant, viewerTz);
  if (viewerHHMM === eventHHMM) return null;

  return `${viewerHHMM} ${zoneCity(viewerTz)}`;
}

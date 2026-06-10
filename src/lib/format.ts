import { MONTH_NAMES } from '@/lib/calendarUtils';

/** "2026-06-14" → "14 June 2026". Falls back to the raw string if malformed. */
export function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  if (!y || !m || !d) return dateStr;
  return `${d} ${MONTH_NAMES[m - 1]} ${y}`;
}

/** Single date, or "start – end" for multi-day events. */
export function formatDateRange(e: { date: string; endDate?: string }): string {
  if (e.endDate && e.endDate !== e.date) {
    return `${formatDate(e.date)} – ${formatDate(e.endDate)}`;
  }
  return formatDate(e.date);
}

/** "start – end", just "start", or "" when no time is known. */
export function formatTimeRange(e: { startTime?: string; endTime?: string }): string {
  if (!e.startTime) return '';
  return e.endTime ? `${e.startTime} – ${e.endTime}` : e.startTime;
}

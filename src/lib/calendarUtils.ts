import { ArtEvent } from '@/types';

export function getCalendarDays(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Start from the Monday of the first day's week
  const startDay = new Date(firstDay);
  const dow = firstDay.getDay(); // 0=Sun
  const offset = dow === 0 ? -6 : 1 - dow;
  startDay.setDate(firstDay.getDate() + offset);

  // End on the Sunday of the last day's week
  const endDay = new Date(lastDay);
  const lastDow = lastDay.getDay();
  endDay.setDate(lastDay.getDate() + (lastDow === 0 ? 0 : 7 - lastDow));

  const days: Date[] = [];
  const cur = new Date(startDay);
  while (cur <= endDay) {
    days.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}

export function groupByWeeks(days: Date[]): Date[][] {
  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }
  return weeks;
}

export function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getEventsForDate(events: ArtEvent[], date: Date): ArtEvent[] {
  const key = toDateString(date);
  return events.filter((e) => e.date === key);
}

export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

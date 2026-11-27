import type { Metadata } from 'next';
import { getPublishedEvents } from '@/lib/events';
import CalendarClient from '@/components/calendar/CalendarClient';
import SiteFooter from '@/components/layout/SiteFooter';
import { SITE_NAME, SITE_DESCRIPTION, absoluteUrl } from '@/lib/site';

// Re-rendered at most hourly; the DB reads come from the shared data cache
// (src/db/queries.ts), so the daily scrape and curation edits appear within the
// hour without a redeploy.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: { absolute: `Art events calendar — ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  alternates: { canonical: absoluteUrl('/calendar') },
  openGraph: { url: absoluteUrl('/calendar') },
};

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ date?: string | string[] }> }) {
  // Place-linked (like the SEO routes) so cards can use a place's pinned colour.
  const [events, { date }] = await Promise.all([getPublishedEvents(), searchParams]);
  // ?date=YYYY-MM-DD (homepage day links) opens on that day; anything else is ignored.
  const initialDate = typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : undefined;
  return (
    <>
      {/* The calendar's design has no visible title; this gives the page its heading for search engines and screen readers. */}
      <h1 className="sr-only">Art events calendar</h1>
      <CalendarClient events={events} footer={<SiteFooter />} initialDate={initialDate} />
    </>
  );
}

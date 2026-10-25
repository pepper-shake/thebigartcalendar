import type { Metadata } from 'next';
import { getPublishedEvents } from '@/lib/events';
import CalendarClient from '@/components/calendar/CalendarClient';
import SiteFooter from '@/components/layout/SiteFooter';
import { SITE_NAME, SITE_DESCRIPTION, SITE_TAGLINE, absoluteUrl } from '@/lib/site';

// Read the DB at request time (like the SEO routes) so the daily scrape and
// curation edits appear without a redeploy, instead of freezing at build time.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: { absolute: `${SITE_NAME} — ${SITE_TAGLINE}` },
  description: SITE_DESCRIPTION,
  alternates: { canonical: absoluteUrl('/') },
  openGraph: { url: absoluteUrl('/') },
};

export default async function HomePage() {
  // Place-linked (like the SEO routes) so cards can use a place's pinned colour.
  const events = await getPublishedEvents();
  return <CalendarClient events={events} footer={<SiteFooter />} />;
}

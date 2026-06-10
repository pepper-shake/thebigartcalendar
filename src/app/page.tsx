import type { Metadata } from 'next';
import { getAllEvents } from '@/db/queries';
import { toArtEvent } from '@/lib/transform';
import CalendarClient from '@/components/calendar/CalendarClient';
import { SITE_NAME, SITE_DESCRIPTION, absoluteUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: { absolute: `${SITE_NAME} — Art Events Across Europe` },
  description: SITE_DESCRIPTION,
  alternates: { canonical: absoluteUrl('/') },
  openGraph: { url: absoluteUrl('/') },
};

export default async function HomePage() {
  const rows = await getAllEvents();
  const events = rows.map(toArtEvent);
  const cities = [...new Set(events.map((e) => e.city).filter(Boolean))].sort();

  return <CalendarClient events={events} cities={cities} />;
}

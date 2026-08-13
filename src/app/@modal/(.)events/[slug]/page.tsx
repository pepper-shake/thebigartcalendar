import { notFound } from 'next/navigation';
import { getEventBySlug, getPublishedEvents } from '@/lib/events';
import EventModalRoute from '@/components/events/EventModalRoute';

// Intercepts client-side navigation to /events/[slug] and shows the event as a
// modal over the page underneath (e.g. the calendar). A hard load / refresh of
// the URL is not intercepted and renders the standalone event page instead.
export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ slug: string }> };

export default async function InterceptedEventModal({ params }: Params) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  // Ordered by start date (asc) — drives the modal's prev/next.
  const events = await getPublishedEvents();

  return <EventModalRoute event={event} events={events} />;
}

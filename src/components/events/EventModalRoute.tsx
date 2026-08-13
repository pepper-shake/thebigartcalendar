'use client';

import { useRouter } from 'next/navigation';
import { ArtEvent } from '@/types';
import { eventSlug } from '@/lib/slug';
import EventModal from './EventModal';

/**
 * Client wrapper that drives the shared EventModal from the router when it is
 * rendered as an intercepted route (@modal/(.)events/[slug]). Closing goes back
 * to the page underneath; prev/next replace the URL with the adjacent event.
 */
export default function EventModalRoute({ event, events }: { event: ArtEvent; events: ArtEvent[] }) {
  const router = useRouter();
  return (
    <EventModal
      event={event}
      events={events}
      onClose={() => router.back()}
      onNavigate={(e) => router.replace(`/events/${eventSlug(e)}`, { scroll: false })}
    />
  );
}

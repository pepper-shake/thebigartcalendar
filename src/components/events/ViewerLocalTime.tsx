'use client';

import { useSyncExternalStore } from 'react';
import { ArtEvent } from '@/types';
import { eventTimeZone, viewerLocalTime } from '@/lib/timezone';

const emptySubscribe = () => () => {};

/** True only once hydrated on the client; false on the server and first paint. */
function useHydrated(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

/**
 * Appends the event's start time in the viewer's own timezone, e.g. the
 * " · 15:00 London" after "16:00 Lisbon". Renders nothing on the server or
 * before hydration (the viewer's zone is only known in the browser), and
 * nothing when the viewer's clock time matches the event's — so it never
 * shows a redundant duplicate.
 */
export default function ViewerLocalTime({ event }: { event: ArtEvent }) {
  const hydrated = useHydrated();
  if (!hydrated || !event.startTime) return null;

  const eventTz = eventTimeZone(event.country);
  if (!eventTz) return null;

  const viewerTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (!viewerTz) return null;

  const suffix = viewerLocalTime(event.date, event.startTime, eventTz, viewerTz);
  if (!suffix) return null;

  return <> · {suffix}</>;
}

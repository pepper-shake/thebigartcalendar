import { type ArtEvent, type EventType } from '@/types';
import { eventImageCandidates } from '@/lib/organiser-images';
import { type EventWithDefault } from '@/db/queries';

export function toArtEvent(row: EventWithDefault): ArtEvent {
  const imageCandidates = eventImageCandidates(row, row.organiserDefaultImage);
  return {
    id: row.id,
    title: row.titleOverride ?? row.title,
    type: row.type as EventType,
    date: row.startDate,
    endDate: row.endDate ?? undefined,
    startTime: row.startTime ?? undefined,
    endTime: row.endTime ?? undefined,
    venue: row.venue ?? '',
    venueUrl: row.venueUrl ?? undefined,
    city: row.city ?? '',
    country: row.country ?? '',
    address: row.address ?? '',
    organiserName: row.organiserName ?? undefined,
    organiserUrl: row.organiserUrl ?? undefined,
    description: row.descriptionOverride ?? row.description ?? '',
    image: imageCandidates[0],
    imageCandidates,
    ticketsUrl: row.ticketsUrl ?? undefined,
    sourceUrl: row.sourceUrl ?? undefined,
    price: row.price ?? undefined,
    tags: row.tags ?? undefined,
  };
}

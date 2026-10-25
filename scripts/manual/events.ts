// Hand-entered events, as reviewable data — for places with no scrapable
// source (Instagram-only venues). `npm run events:manual` upserts every entry
// (see docs/product/event-curation.md §Manual events). Past entries can stay:
// the site shows them as past, and re-syncing them is harmless.
//
// Each entry needs a title, type and date; everything else falls back to the
// venue defaults in MANUAL_VENUES (keyed by `venue`).

export interface ManualEvent {
  venue: keyof typeof MANUAL_VENUES;
  title: string;
  type: 'gallery' | 'fair' | 'workshop' | 'performance' | 'auction';
  startDate: string; // YYYY-MM-DD
  endDate?: string;
  startTime?: string; // HH:MM
  endTime?: string;
  description?: string;
  price?: string;
  imageUrl?: string;
  ticketsUrl?: string;
  tags?: string[];
  /** Where the details came from (a post, a poster). Not shown on the site. */
  source?: string;
}

export const MANUAL_VENUES = {
  'svet-space': {
    venue: 'Svet Space',
    city: 'Porto',
    country: 'Portugal',
    address: 'Praça do Exército Libertador 6, 4250-205 Porto',
    url: 'https://www.instagram.com/svet__space/',
    imageUrl:
      'https://pn4cabqkop1baqwd.public.blob.vercel-storage.com/places/svet-space-UX2oKCIU9mJfRHeATtFaXqSQwRXsVr.jpg',
    bookingNote: 'Book via Instagram @svet__space.',
  },
} as const;

export const MANUAL_EVENTS: ManualEvent[] = [
  // --- Svet Space, October 2026 programme poster + operator notes (2026-10-25).
  // Skipped from the poster: ceramic coworking (studio time, not an event) and
  // the Portuguese speaking club (not art).
  {
    venue: 'svet-space',
    title: 'Human Figure Sketching',
    type: 'workshop',
    startDate: '2026-10-25',
    description: 'Human figure sketching session at Svet Space. In English and Portuguese.',
    tags: ['drawing', 'life-drawing'],
    source: 'October events poster',
  },
  ...['2026-10-26', '2026-10-30'].map(
    (startDate): ManualEvent => ({
      venue: 'svet-space',
      title: 'Ceramic Class',
      type: 'workshop',
      startDate,
      description: 'Ceramics class in the Svet Space studio. In Russian and English.',
      tags: ['ceramics'],
      source: 'October events poster',
    }),
  ),
  {
    venue: 'svet-space',
    title: 'Graphic Journal',
    type: 'workshop',
    startDate: '2026-10-29',
    startTime: '18:30',
    endTime: '20:30',
    description: 'Graphic journal evening at Svet Space. In Portuguese and English.',
    tags: ['drawing', 'journaling', 'collage'],
    source: 'October events poster + operator',
  },
  {
    venue: 'svet-space',
    title: 'Decorate Your Ceramics',
    type: 'workshop',
    startDate: '2026-10-31',
    startTime: '17:00',
    endTime: '18:30',
    price: 'from €20 (depends on size)',
    description: 'Decorate your own ceramic piece at Svet Space. Price depends on the size of the piece.',
    tags: ['ceramics', 'painting'],
    source: 'operator',
  },
];

// Hand-entered events, as reviewable data — for places with no scraper
// (Instagram-only venues, or a few dated sessions on a small site). `npm run events:manual` upserts every entry
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
  'eva-le-ceramics': {
    venue: 'Eva Lé Ceramics',
    city: 'Lisbon',
    country: 'Portugal',
    address: 'Rua Laureano de Oliveira 24A, 1885-051 Moscavide',
    url: 'https://www.evaleceramics.com/classes',
    imageUrl:
      'https://images.squarespace-cdn.com/content/v1/618324d3161175414b596c45/7ede22cb-845a-46db-9b28-69ed3dcfb7ca/IMG_0193.JPG',
    bookingNote: 'Book on evaleceramics.com.',
  },
  auake: {
    venue: 'AUAKE',
    city: 'Sintra',
    country: 'Portugal',
    address: 'Rua da Praia da Adraga 26, Almoçageme, 2705-059 Colares',
    url: 'https://www.auake.com/products/handbuilding-classes',
    imageUrl:
      'https://cdn.shopify.com/s/files/1/0551/8334/3786/files/Sans_titre_1.29.1_fb0b811e-b687-48f1-8bf0-a15340c28e13.jpg?v=1778752257',
    bookingNote: 'Book on auake.com; the studio arranges the time slot with you by email.',
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
  {
    venue: 'svet-space',
    title: 'Soap Making',
    type: 'workshop',
    startDate: '2026-11-15',
    startTime: '15:00',
    endTime: '17:00',
    price: '€40',
    description:
      'Make autumn/Christmas-themed cold-process soap from scratch with oils, butters and essential oils, playing with colours and decorating along the way. Take home two soaps you made. In English, ages 14+. Sign up via Instagram @solidshampoobars.',
    imageUrl: 'https://pn4cabqkop1baqwd.public.blob.vercel-storage.com/events/svet-soap-making-Tw5S93BfwkdoH68GjO5Kgd6M2W10th.jpg',
    ticketsUrl: 'https://www.instagram.com/solidshampoobars/',
    tags: ['soap-making', 'crafts'],
    source: 'Instagram post + poster (2026-10-25)',
  },
  // --- Eva Lé Ceramics, dated sessions from the booking shop on
  // evaleceramics.com/classes (2026-10-28). Classes booked first and scheduled
  // afterwards (wheel taster, wheel pack, regular classes) are not events.
  {
    venue: 'eva-le-ceramics',
    title: 'After Work: Paint a Ceramic Piece',
    type: 'workshop',
    startDate: '2026-10-29',
    startTime: '18:00',
    endTime: '20:00',
    price: '€30',
    description:
      'Thursday after-work ceramics session: pick a ready-made ceramic piece and decorate it with colours and patterns. No experience needed; materials and firing included.',
    imageUrl:
      'https://images.squarespace-cdn.com/content/v1/618324d3161175414b596c45/e20e2ffd-7fbb-47ec-a6b5-e21abb8a71d4/IMG_5917.png',
    ticketsUrl: 'https://www.evaleceramics.com/classes/p/0n4nag02tedew56w7irj2rcvhyxpyv-48f4p',
    tags: ['ceramics', 'painting'],
    source: 'evaleceramics.com booking shop',
  },
  {
    venue: 'eva-le-ceramics',
    title: 'After Work: Free Clay Piece',
    type: 'workshop',
    startDate: '2026-11-05',
    startTime: '18:00',
    endTime: '20:00',
    price: '€30',
    description:
      'Thursday after-work ceramics session with no rules or template: make whatever you like in clay. No experience needed; clay, tools, slips and firing included.',
    imageUrl:
      'https://images.squarespace-cdn.com/content/v1/618324d3161175414b596c45/e20e2ffd-7fbb-47ec-a6b5-e21abb8a71d4/IMG_5917.png',
    ticketsUrl: 'https://www.evaleceramics.com/classes/p/0n4nag02tedew56w7irj2rcvhyxpyv-48f4p',
    tags: ['ceramics'],
    source: 'evaleceramics.com booking shop',
  },
  ...['2026-11-14', '2026-11-21'].map(
    (startDate): ManualEvent => ({
      venue: 'eva-le-ceramics',
      title: 'Ceramics & Tea Workshop',
      type: 'workshop',
      startDate,
      startTime: '11:00',
      endTime: '13:30',
      price: '€40',
      description: 'Saturday-morning ceramics workshop with tea at the Eva Lé Ceramics atelier.',
      ticketsUrl: 'https://www.evaleceramics.com/classes/p/workshoop-ceramica-iniciao-anj5d-b2wfc-hcahj',
      tags: ['ceramics'],
      source: 'evaleceramics.com booking shop (operator screenshot)',
    }),
  ),
  // --- AUAKE: the Classic handbuilding workshop runs every weekend, morning
  // and afternoon, but the site gives no session times or dates — these are
  // the weekends through November, added at the operator's request
  // (2026-10-28). Extend with more weekends when these pass.
  ...['2026-10-31', '2026-11-01', '2026-11-07', '2026-11-08', '2026-11-14',
    '2026-11-15', '2026-11-21', '2026-11-22', '2026-11-28', '2026-11-29'].map(
    (startDate): ManualEvent => ({
      venue: 'auake',
      title: 'Weekend Handbuilding Workshop',
      type: 'workshop',
      startDate,
      price: '€45 (€55 with Portuguese natural wines)',
      description:
        'Two-hour beginners pottery class at the AUAKE studio near Adraga Beach, for adults and teens (15+), max 6 people. Learn pinching, coiling and slab building and make up to 3 small pieces, which the studio glazes and fires for collection within 8 weeks. Clay, tools and a coffee, latte or organic tea included. Mornings and afternoons; in English, Portuguese or Spanish.',
      tags: ['ceramics', 'pottery', 'handbuilding'],
      source: 'auake.com handbuilding-classes product page',
    }),
  ),
];

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
  amazonas: {
    venue: 'Amazonas',
    city: 'Lisbon',
    country: 'Portugal',
    address: '8 Marvila, Praça David Leandro da Silva 8, 1950-064 Lisboa',
    url: 'https://www.instagram.com/amazonas.events/',
    imageUrl: '/venues/amazonas-market-art-weekend.jpg',
    bookingNote: 'Details on Instagram @amazonas.events.',
  },
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
} as const;

export const MANUAL_EVENTS: ManualEvent[] = [
  // --- Amazonas, Art Weekend Edition post (2026-10-19).
  {
    venue: 'amazonas',
    title: 'Amazonas Market: Art Weekend Edition',
    type: 'fair',
    startDate: '2026-11-07',
    endDate: '2026-11-08',
    startTime: '12:00',
    endTime: '20:00',
    price: 'Free',
    description:
      'Art weekend edition of the Amazonas market at 8 Marvila: 70+ independent artists, designers and makers presenting original art and prints, ceramics, fashion and jewellery. Workshops all weekend, exhibitions along the 8 Marvila corridor, live performances, and DJs and live music from noon.',
    tags: ['market', 'art', 'design', 'ceramics', 'jewellery'],
    source: 'https://www.instagram.com/p/Der2buBN5u2/',
  },
  // --- Amazonas Linktree, Art Weekend workshops (2026-11-06). Skipped: Drawing
  // Session 7 Nov (Lisbon Drawing Club #189, already scraped), Collage Workshop
  // (Collage Working Club parser), and the sold-out Mood Board 7 Nov and Lost Wax.
  {
    venue: 'amazonas',
    title: 'Arraiolos Embroidery Workshop',
    type: 'workshop',
    startDate: '2026-11-07',
    startTime: '14:00',
    endTime: '17:00',
    price: '€60',
    description:
      'A contemporary take on the traditional Portuguese Arraiolos stitch with A Rendeira, at Amazonas Market. All materials included; take home your piece and what you need to finish it. Limited to 8 people.',
    imageUrl:
      'https://ugc.production.linktr.ee/fe48ccc7-1843-4a65-a805-3f10954b66b8_Arraiolos-EN-1x.png',
    ticketsUrl: 'https://forms.gle/4Fe79GY4cfEpqL9v9',
    tags: ['embroidery', 'textiles'],
    source: 'linktr.ee/amz.amazonas + sign-up page',
  },
  {
    venue: 'amazonas',
    title: 'Make Your Own Charms',
    type: 'workshop',
    startDate: '2026-11-07',
    startTime: '16:00',
    endTime: '18:00',
    price: '€69',
    description:
      'Jewellery workshop with After Hours at Amazonas Market: make five charms using bronze metal clay, enamel colour and semi-precious beads.',
    imageUrl:
      'https://ugc.production.linktr.ee/a2962044-d248-4d06-ae2d-21c829ecf23f_motion-photo-7659414819783442307.webp',
    ticketsUrl: 'https://afterhoursexperiences.com/products/charms-making?variant=61333591327054',
    tags: ['jewellery'],
    source: 'linktr.ee/amz.amazonas + sign-up page',
  },
  {
    venue: 'amazonas',
    title: 'Cyanotype on Paper Workshop',
    type: 'workshop',
    startDate: '2026-11-07',
    startTime: '16:00',
    endTime: '18:00',
    price: '€55.50',
    description:
      'Learn cyanotype step by step at Amazonas Market, from preparing the paper to exposing and developing prints of plants and objects. Take your prints home.',
    imageUrl:
      'https://ugc.production.linktr.ee/ce043b14-9a4a-425e-8638-e4d2fd08deb2_Capture-decran-2026-10-30-a-10.43.58.png',
    ticketsUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSdMuenEh4HhuXfYME2q1M2sMnjmQjk3RXUyXZLywun_IbFxVg/viewform',
    tags: ['cyanotype', 'photography'],
    source: 'linktr.ee/amz.amazonas + sign-up page',
  },
  {
    venue: 'amazonas',
    title: 'Portrait Session',
    type: 'workshop',
    startDate: '2026-11-07',
    startTime: '18:00',
    endTime: '20:00',
    price: '€10',
    description:
      'Lx Atelier joins Amazonas Market for a two-hour portrait drawing session with a life model.',
    imageUrl:
      'https://ugc.production.linktr.ee/c7930c8d-e301-4b6f-a3e6-e30e51fa636c_images--2-.jpeg',
    ticketsUrl: 'https://www.lxatelier.pt/lifedrawing',
    tags: ['drawing', 'portrait'],
    source: 'linktr.ee/amz.amazonas + sign-up page',
  },
  {
    venue: 'amazonas',
    title: 'Cyanotype Workshop',
    type: 'workshop',
    startDate: '2026-11-08',
    startTime: '12:00',
    endTime: '14:00',
    price: '€25',
    description:
      'Cyanotype workshop with photographer Sofia Konstantinidou at Amazonas Market. Bring favourite flat objects to print. Materials included; limited to 12 people.',
    imageUrl:
      'https://ugc.production.linktr.ee/616002a0-af26-46a5-8c5a-1d0ce4396767_wmo2-G5Alt3AIGDzWBgzF07N9h9k4VbKdAS8HOpaS-8.jpeg',
    ticketsUrl: 'https://forms.gle/zaYSJRBBxmqoPacz9',
    tags: ['cyanotype', 'photography'],
    source: 'linktr.ee/amz.amazonas + sign-up page',
  },
  {
    venue: 'amazonas',
    title: 'Watercolour & Bookbinding Workshop',
    type: 'workshop',
    startDate: '2026-11-08',
    startTime: '12:00',
    endTime: '14:30',
    price: '€25',
    description:
      'Meraki workshop at Amazonas Market: paint in watercolour from a floral arrangement, then bind two notebooks with your drawings. From age 10, no experience needed. Materials and a snack included.',
    imageUrl:
      'https://ugc.production.linktr.ee/5ef3d414-02ed-4f51-80fb-30225da9b474_Capture-decran-2026-11-01-a-21.02.24.png',
    ticketsUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSfQKGu7rRw5PR4W8ntJIdlT0ARe7L2TFBFl3Gq8ZFmeo2oA7g/viewform?usp=header',
    tags: ['watercolour', 'bookbinding'],
    source: 'linktr.ee/amz.amazonas + sign-up page',
  },
  {
    venue: 'amazonas',
    title: 'Create Your 2027 Mood Board',
    type: 'workshop',
    startDate: '2026-11-08',
    startTime: '12:30',
    endTime: '14:00',
    price: '€25',
    description:
      'The Ritual Collective at Amazonas Market: turn your intentions for 2027 into images, colours and words on a mood board.',
    imageUrl:
      'https://ugc.production.linktr.ee/65772690-60f5-4ccd-8a60-698314d38b51_d2f2cf22-7972-47c4-be50-6c39cb2a770d.avif',
    ticketsUrl: 'https://luma.com/zo9cv6by',
    tags: ['collage'],
    source: 'linktr.ee/amz.amazonas + sign-up page',
  },
  {
    venue: 'amazonas',
    title: 'Phytography Workshop',
    type: 'workshop',
    startDate: '2026-11-08',
    startTime: '12:30',
    endTime: '14:00',
    price: '€16',
    description:
      'Hands-on botanical photography workshop with Imagerie at Amazonas Market, using plant chemicals to develop images on analogue materials. In Portuguese; English speakers welcome.',
    imageUrl:
      'https://ugc.production.linktr.ee/2b82f6c5-d654-4ff3-864f-a1d30824df60_fitografia-imagerie-02-HlX4mBqsh1jqHkoo.jpeg',
    ticketsUrl: 'https://imageriecasadeimagens.com/phytography-workshop-at-amazonas-market#info',
    tags: ['photography'],
    source: 'linktr.ee/amz.amazonas + sign-up page',
  },
  {
    venue: 'amazonas',
    title: 'Phytography Workshop',
    type: 'workshop',
    startDate: '2026-11-08',
    startTime: '14:30',
    endTime: '16:00',
    price: '€16',
    description:
      'Hands-on botanical photography workshop with Imagerie at Amazonas Market, using plant chemicals to develop images on analogue materials. In Portuguese; English speakers welcome.',
    imageUrl:
      'https://ugc.production.linktr.ee/2b82f6c5-d654-4ff3-864f-a1d30824df60_fitografia-imagerie-02-HlX4mBqsh1jqHkoo.jpeg',
    ticketsUrl: 'https://imageriecasadeimagens.com/phytography-workshop-at-amazonas-market#info',
    tags: ['photography'],
    source: 'linktr.ee/amz.amazonas + sign-up page',
  },
  {
    venue: 'amazonas',
    title: 'Life Drawing Session',
    type: 'workshop',
    startDate: '2026-11-08',
    startTime: '15:00',
    endTime: '17:30',
    price: '€15',
    description:
      'Life drawing at Amazonas Art Weekend with three live models, in short and long poses of 2 to 20 minutes. All levels welcome.',
    imageUrl:
      'https://ugc.production.linktr.ee/bf4c8bd7-b6fa-4eda-aa01-41351bd7fe16_Capture-decran-2026-10-17-a-19.40.59.png',
    ticketsUrl: 'https://forms.gle/axscv9WUc3gfBwdC9',
    tags: ['drawing', 'life-drawing'],
    source: 'linktr.ee/amz.amazonas + sign-up page',
  },
  {
    venue: 'amazonas',
    title: 'Meditative Ink Art',
    type: 'workshop',
    startDate: '2026-11-08',
    startTime: '18:00',
    endTime: '20:00',
    price: '€25',
    description:
      'Workshop with Qian Shi at Amazonas Market combining breathwork, guided meditation and intuitive ink painting.',
    imageUrl:
      'https://ugc.production.linktr.ee/4bfb6af3-8b7e-43ec-a645-d7e8442316cb_d3d82e62-84a1-4510-b1e0-02280aa9a250.avif',
    ticketsUrl: 'https://luma.com/pqduqxak',
    tags: ['painting', 'ink'],
    source: 'linktr.ee/amz.amazonas + sign-up page',
  },
  // Hours left out: the organiser's form says "11pm–8pm", an obvious typo.
  {
    venue: 'amazonas',
    title: 'Amazonas Christmas Market',
    type: 'fair',
    startDate: '2026-12-12',
    endDate: '2026-12-13',
    description:
      'Christmas edition of the Amazonas market: all of 8 Marvila becomes a Christmas village with lights, decorations, music and festive food, plus gifts from independent brands and makers, workshops for kids and adults, and a visit from Santa Claus.',
    imageUrl:
      'https://ugc.production.linktr.ee/4b19e2c8-bd25-4fd1-aa00-8071ee06acb0_JS1-8135.jpeg',
    tags: ['market', 'christmas', 'design'],
    source: 'Amazonas pre-registration form (linktr.ee/amz.amazonas)',
  },
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
];

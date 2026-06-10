import { EventType } from '@/types';

// Maps the raw scraper `type` to SEO-friendly, searchable labels and URL slugs.
// The DB stores `gallery`; users search for "exhibitions" — so the public
// surface uses the plural label and slug, while the type stays the join key.

export interface EventTypeMeta {
  type: EventType;
  slug: string; // URL segment, e.g. 'exhibitions'
  label: string; // singular, e.g. 'Exhibition'
  plural: string; // e.g. 'Exhibitions'
  blurb: string; // intro copy + meta description for the landing page
}

export const EVENT_TYPES: EventTypeMeta[] = [
  {
    type: 'gallery',
    slug: 'exhibitions',
    label: 'Exhibition',
    plural: 'Exhibitions',
    blurb: 'Gallery and museum exhibitions across Europe.',
  },
  {
    type: 'fair',
    slug: 'art-fairs',
    label: 'Art Fair',
    plural: 'Art Fairs',
    blurb: 'Art fairs and large-scale showcases across Europe.',
  },
  {
    type: 'workshop',
    slug: 'workshops',
    label: 'Workshop',
    plural: 'Workshops',
    blurb: 'Hands-on art workshops, classes, and short courses across Europe.',
  },
  {
    type: 'performance',
    slug: 'performances',
    label: 'Performance',
    plural: 'Performances',
    blurb: 'Live art performances and performative events across Europe.',
  },
  {
    type: 'auction',
    slug: 'auctions',
    label: 'Auction',
    plural: 'Auctions',
    blurb: 'Art auctions and sales across Europe.',
  },
];

const BY_SLUG = new Map(EVENT_TYPES.map((t) => [t.slug, t]));
const BY_TYPE = new Map(EVENT_TYPES.map((t) => [t.type, t]));

export function typeBySlug(slug: string): EventTypeMeta | undefined {
  return BY_SLUG.get(slug);
}

/** Like typeBySlug but throws — for the fixed type routes, whose slugs are known. */
export function requireTypeBySlug(slug: string): EventTypeMeta {
  const meta = BY_SLUG.get(slug);
  if (!meta) throw new Error(`Unknown event type slug: ${slug}`);
  return meta;
}

export function typeMeta(type: EventType): EventTypeMeta {
  return BY_TYPE.get(type) ?? EVENT_TYPES[0];
}

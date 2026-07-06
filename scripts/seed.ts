import { createHash } from 'crypto';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { events, type NewEvent } from '../src/db/schema';
import { sql } from 'drizzle-orm';

process.loadEnvFile('.env.local');

const client = neon(process.env.DATABASE_URL!);
const db = drizzle(client);

// Utility: generate a stable deduplication ID from source URL + title + start date
function makeId(sourceUrl: string, title: string, startDate: string): string {
  return createHash('sha256')
    .update(`${sourceUrl}::${title}::${startDate}`)
    .digest('hex')
    .slice(0, 32);
}

// ---------------------------------------------------------------------------
// Seeded from: pinkdolphinlisbon.com — 2026-05-31
// ---------------------------------------------------------------------------
const seedEvents: NewEvent[] = [

  // ── Pink Dolphin Lisbon · Workshops & Events ────────────────────────────

  {
    id: makeId('https://pinkdolphinlisbon.com/products/sardine-scenes-collage-workshop', 'Sardine Scenes Collage Workshop', '2025-05-23'),
    title: 'Sardine Scenes Collage Workshop',
    type: 'workshop',
    startDate: '2025-05-23',
    startTime: '14:00',
    endTime: '16:00',
    venue: 'Pink Dolphin',
    city: 'Lisbon',
    country: 'Portugal',
    address: 'Rua Poço dos Negros 37, Lisbon',
    description: 'Hands-on creative collage session inspired by Lisbon\'s sardine culture.',
    price: '€40',
    sourceUrl: 'https://pinkdolphinlisbon.com/products/sardine-scenes-collage-workshop',
    sourceName: 'Pink Dolphin Lisbon',
    tags: ['workshop', 'collage', 'lisbon'],
  },

  {
    id: makeId('https://pinkdolphinlisbon.com/products/creative-chaos-painting-workshop', 'Creative Chaos Painting Workshop', '2025-04-16'),
    title: 'Creative Chaos Painting Workshop',
    type: 'workshop',
    startDate: '2025-04-16',
    startTime: '19:00',
    endTime: '21:00',
    venue: 'Pink Dolphin',
    city: 'Lisbon',
    country: 'Portugal',
    address: 'Rua Poço dos Negros 37, Lisbon',
    description: 'An expressive painting workshop embracing spontaneity and creative freedom.',
    price: '€40',
    sourceUrl: 'https://pinkdolphinlisbon.com/products/creative-chaos-painting-workshop',
    sourceName: 'Pink Dolphin Lisbon',
    tags: ['workshop', 'painting', 'lisbon'],
  },

  {
    id: makeId('https://pinkdolphinlisbon.com/products/macrame-planter-propagation-workshop-march-19-21', 'Macrame Planter & Propagation Workshop', '2025-03-21'),
    title: 'Macrame Planter & Propagation Workshop',
    type: 'workshop',
    startDate: '2025-03-21',
    startTime: '14:00',
    endTime: '16:00',
    venue: 'Pink Dolphin',
    city: 'Lisbon',
    country: 'Portugal',
    address: 'Rua Poço dos Negros 37, Lisbon',
    description: 'Plant-focused crafting workshop combining macrame planter-making with plant propagation.',
    price: '€40',
    sourceUrl: 'https://pinkdolphinlisbon.com/products/macrame-planter-propagation-workshop-march-19-21',
    sourceName: 'Pink Dolphin Lisbon',
    tags: ['workshop', 'craft', 'macrame', 'lisbon'],
  },

  {
    id: makeId('https://pinkdolphinlisbon.com/pages/eventsandcreativeworkshops#witchy-night', 'Witchy Night – Halloween Celebration', '2025-10-30'),
    title: 'Witchy Night – Halloween Celebration',
    type: 'gallery',
    startDate: '2025-10-30',
    startTime: '19:00',
    endTime: '21:30',
    venue: 'Pink Dolphin',
    city: 'Lisbon',
    country: 'Portugal',
    address: 'Rua Poço dos Negros 37, Lisbon',
    description: 'Natural wines, a free Victorian Tarot Cards workshop, and a flash tattoo artist for Halloween.',
    price: 'Free',
    sourceUrl: 'https://pinkdolphinlisbon.com/pages/eventsandcreativeworkshops',
    sourceName: 'Pink Dolphin Lisbon',
    tags: ['event', 'halloween', 'free', 'lisbon'],
  },

  {
    id: makeId('https://pinkdolphinlisbon.com/pages/eventsandcreativeworkshops#pratos-picantes', 'Pratos Picantes – Ceramic Art Exhibition', '2025-09-18'),
    title: 'Pratos Picantes – Ceramic Art Exhibition',
    type: 'gallery',
    startDate: '2025-09-18',
    startTime: '19:00',
    endTime: '21:30',
    venue: 'Pink Dolphin',
    city: 'Lisbon',
    country: 'Portugal',
    address: 'Rua Poço dos Negros 37, Lisbon',
    description: 'Opening of Raquel Terenas\' provocative ceramic collection — a playfully subversive exploration of intimacy and pleasure.',
    price: 'Free',
    sourceUrl: 'https://pinkdolphinlisbon.com/pages/eventsandcreativeworkshops',
    sourceName: 'Pink Dolphin Lisbon',
    tags: ['exhibition', 'ceramics', 'opening', 'free', 'lisbon'],
  },

];

async function seed() {
  if (seedEvents.length === 0) {
    console.log('No events to seed — add entries to seedEvents and re-run.');
    process.exit(0);
  }

  console.log(`Seeding ${seedEvents.length} event(s)...`);

  await db
    .insert(events)
    .values(seedEvents)
    .onConflictDoUpdate({
      target: events.id,
      set: {
        title: sql`excluded.title`,
        type: sql`excluded.type`,
        startDate: sql`excluded.start_date`,
        endDate: sql`excluded.end_date`,
        startTime: sql`excluded.start_time`,
        endTime: sql`excluded.end_time`,
        venue: sql`excluded.venue`,
        city: sql`excluded.city`,
        country: sql`excluded.country`,
        address: sql`excluded.address`,
        description: sql`excluded.description`,
        imageUrl: sql`excluded.image_url`,
        ticketsUrl: sql`excluded.tickets_url`,
        price: sql`excluded.price`,
        tags: sql`excluded.tags`,
        sourceUrl: sql`excluded.source_url`,
        sourceName: sql`excluded.source_name`,
        externalId: sql`excluded.external_id`,
        scrapedAt: sql`now()`,
      },
    });

  console.log('Done.');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

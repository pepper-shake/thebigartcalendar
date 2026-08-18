import type { NewEvent } from '../src/db/schema';
import { makeId, upsertEvents } from './lib/upsert';

process.loadEnvFile('.env.local');

// ---------------------------------------------------------------------------
// One-off manual add: Ajuda Lab (Mercado da Ajuda, Lisbon).
//
// Ajuda Lab runs art/craft workshops "on request" — the website publishes NO
// dated schedule a scraper can read (checked the /workshops page, the detail
// page, and the registration form). The concrete session dates are announced
// on their Instagram instead. Until that IG source is onboarded (the ig_*
// pipeline), these two sessions are entered by hand from dates the user
// supplied. Re-running this script is safe: upsert is keyed on the stable id.
// ---------------------------------------------------------------------------

const SOURCE_URL = 'https://ajudalab.pt/workshop-de-modelacao-em-cera-para-joalharia/';
const ORGANISER_URL = 'https://ajudalab.pt/';

const common = {
  type: 'workshop' as const,
  title: 'Modelação em Cera para Joalharia',
  startTime: '15:00',
  endTime: '18:00', // 3-hour session per the workshop description
  venue: 'Ajuda Lab',
  venueUrl: ORGANISER_URL,
  city: 'Lisbon',
  country: 'Portugal',
  address: 'Mercado da Ajuda, Lisbon',
  organiserName: 'Ajuda Lab',
  organiserUrl: ORGANISER_URL,
  description:
    'A 3-hour lost-wax jewellery workshop: sculpt a wax model and turn it into a personalised ring, pendant or earrings (casting billed separately by weight/metal). Max 6 people.',
  imageUrl: null,
  ticketsUrl: 'https://ajudalab.pt/inscricao-no-workshop/',
  price: '€35',
  tags: ['workshop', 'jewellery', 'wax-casting', 'lisbon'],
  sourceUrl: SOURCE_URL,
  sourceName: 'Ajuda Lab',
  externalId: null,
};

const dates = ['2026-08-30', '2026-09-13'];

const seedEvents: NewEvent[] = dates.map((startDate) => ({
  id: makeId(SOURCE_URL, common.title, startDate),
  startDate,
  endDate: null,
  ...common,
}));

async function main() {
  await upsertEvents(seedEvents);
  console.log(`[Ajuda Lab] upserted ${seedEvents.length} session(s): ${dates.join(', ')}`);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});

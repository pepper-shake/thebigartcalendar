import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';
import { submitToIndexNow } from './lib/indexnow';
import { eventSlug, citySlug } from '../src/lib/slug';
import { typeMeta } from '../src/lib/eventTypes';
import { PORTUGAL_ONLY_MODE, VISIBLE_COUNTRIES } from '../src/config/feature-flags';
import type { ArtEvent, EventType } from '../src/types';
import { run as fableLisbon } from './parsers/fable-lisbon';
import { run as oficinaMescla } from './parsers/oficina-mescla';
import { run as bryonStudios } from './parsers/bryon-studios';
import { run as nacreCreative } from './parsers/nacre-creative';
import { run as laBiennale } from './parsers/la-biennale';
import { run as pinkDolphin } from './parsers/pink-dolphin';
import { run as dviTaures } from './parsers/dvi-taures';
import { run as collageClub } from './parsers/collage-club';
import { run as discoWheel } from './parsers/disco-wheel';
import { run as ajudaLab } from './parsers/ajuda-lab';
import { run as galeria1758 } from './parsers/galeria-1758';

// Load .env.local for local development. In CI, env vars are injected via secrets.
// We parse manually so we can overwrite empty-string vars (process.loadEnvFile skips them).
try {
  for (const line of readFileSync('.env.local', 'utf-8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    // Strip surrounding quotes (dotenv-style). Our hand-rolled parser otherwise
    // passes literal quotes through, which breaks quoted values like a
    // "postgres://…" DATABASE_URL (neon() then rejects it as an invalid URL).
    if (
      val.length >= 2 &&
      ((val[0] === '"' && val.at(-1) === '"') || (val[0] === "'" && val.at(-1) === "'"))
    ) {
      val = val.slice(1, -1);
    }
    if (key) process.env[key] = val;
  }
} catch {
  // .env.local absent — running in CI with injected env vars
}

const parsers = [
  { name: 'Fable', fn: fableLisbon },
  { name: 'Oficina Mescla', fn: oficinaMescla },
  { name: 'Bryon Studios', fn: bryonStudios },
  { name: 'Nacre Creative', fn: nacreCreative },
  { name: 'La Biennale', fn: laBiennale },
  { name: 'Pink Dolphin', fn: pinkDolphin },
  { name: '2 Taurės', fn: dviTaures },
  { name: 'Collage Club', fn: collageClub },
  { name: 'Disco Wheel', fn: discoWheel },
  { name: 'Ajuda Lab', fn: ajudaLab },
  { name: 'Galeria 1758', fn: galeria1758 },
];

interface NewRow {
  id: string;
  title: string;
  city: string | null;
  country: string | null;
  type: string;
}

// Public pages that became live because of rows added in this run: the new
// events, plus the hubs that list them (home, their city, their type).
function pagesFor(rows: NewRow[]): string[] {
  const visible = VISIBLE_COUNTRIES.map((c) => c.toLowerCase());
  const shown = rows.filter((r) => !PORTUGAL_ONLY_MODE || visible.includes((r.country ?? '').toLowerCase()));
  if (shown.length === 0) return [];
  const paths = new Set<string>(['/']);
  for (const r of shown) {
    paths.add(`/events/${eventSlug({ id: r.id, title: r.title, city: r.city ?? '' } as ArtEvent)}`);
    if (r.city) paths.add(`/cities/${citySlug(r.city)}`);
    paths.add(`/${typeMeta(r.type as EventType).slug}`);
  }
  return [...paths];
}

async function main() {
  console.log(`Scrape started at ${new Date().toISOString()}`);

  // Snapshot existing ids so new events can be announced to IndexNow afterwards.
  const sql = neon(process.env.DATABASE_URL!);
  const before = new Set((await sql`select id from events`).map((r) => r.id as string));

  for (const { name, fn } of parsers) {
    console.log(`\n--- ${name} ---`);
    try {
      await fn();
    } catch (err) {
      // Log and continue — one failed site should not block the others
      console.error(`[${name}] Error:`, err instanceof Error ? err.message : err);
    }
  }

  const added = (await sql`
    select id, title, city, country, type from events
    where status = 'published' and coalesce(end_date, start_date) >= current_date
  `).filter((r) => !before.has(r.id as string)) as NewRow[];
  console.log(`\n${added.length} new upcoming event(s) this run`);
  await submitToIndexNow(pagesFor(added));

  console.log(`\nScrape finished at ${new Date().toISOString()}`);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});

import { sql } from 'drizzle-orm';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { places } from '../../src/db/schema';
import { PLACES } from './places';

process.loadEnvFile('.env.local');

// Upsert every entry in places.ts into the `places` table. Idempotent: re-run
// after editing places.ts. Entries removed from the file are NOT deleted from
// the DB — set `status: 'hidden'` instead (no destructive ops without sign-off).

async function main() {
  const url = (process.env.DATABASE_URL ?? '').replace(/^["']|["']$/g, '');
  const db = drizzle(neon(url));

  const slugs = new Set<string>();
  for (const p of PLACES) {
    if (slugs.has(p.slug)) throw new Error(`Duplicate slug: ${p.slug}`);
    slugs.add(p.slug);
  }

  for (const p of PLACES) {
    const row = {
      aliases: null, category: null, description: null, imageUrl: null, address: null,
      city: null, country: null, lat: null, lng: null, websiteUrl: null,
      instagramUrl: null, openingHours: null, status: 'published',
      ...p,
    };
    await db
      .insert(places)
      .values(row)
      .onConflictDoUpdate({ target: places.id, set: { ...row, id: undefined, updatedAt: sql`now()` } });
  }
  console.log(`[places] upserted ${PLACES.length} place(s)`);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});

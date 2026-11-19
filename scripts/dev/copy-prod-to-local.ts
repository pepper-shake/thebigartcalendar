import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { events, organiserDefaults } from '../../src/db/schema';

// Dev helper: copy published data READ-ONLY from the prod Neon DB (DATABASE_URL
// in .env.local) into the local database (LOCAL_DATABASE_URL, default the
// `npm run db:local` PGlite server). Replaces the local copies of the tables.

const LOCAL = process.env.LOCAL_DATABASE_URL ?? 'postgresql://postgres@localhost:5432/postgres';
const prodLine = readFileSync('.env.local', 'utf-8').split('\n').find((l) => l.startsWith('DATABASE_URL='));
const PROD = (prodLine ?? '').slice('DATABASE_URL='.length).trim().replace(/^["']|["']$/g, '');

async function main() {
  if (!/@(localhost|127\.0\.0\.1)[:/]/.test(LOCAL)) throw new Error('Refusing: target is not localhost');
  const prod = drizzleNeon(neon(PROD));
  const pool = new Pool({ connectionString: LOCAL, max: 1 });
  const local = drizzlePg(pool);

  const ev = await prod.select().from(events);
  const od = await prod.select().from(organiserDefaults);

  await local.delete(events);
  await local.delete(organiserDefaults);
  for (let i = 0; i < ev.length; i += 100) await local.insert(events).values(ev.slice(i, i + 100));
  if (od.length) await local.insert(organiserDefaults).values(od);

  console.log(`[copy] ${ev.length} events, ${od.length} organiser defaults → local`);
  await pool.end();
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});

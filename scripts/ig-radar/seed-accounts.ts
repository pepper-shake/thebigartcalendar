// Seed / update the list of Instagram accounts the radar monitors.
//
// Edit ACCOUNTS below, then run `npm run radar:seed`. Idempotent: re-running
// updates handle/name/city but preserves each account's cursor + health so a
// re-seed doesn't force a full re-fetch.
//
// Env: DATABASE_URL.

try {
  process.loadEnvFile('.env.local');
} catch {
  // absent in CI
}

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { sql } from 'drizzle-orm';
import { igAccounts, type NewIgAccount } from '../../src/db/schema-instagram';
import { normalizeHandle } from './store';

// ── Edit this list ──────────────────────────────────────────────────────────
// handle: the Instagram username (without '@'). defaultCity: fallback when a
// post doesn't state its city.
const ACCOUNTS: { handle: string; displayName?: string; defaultCity?: string }[] = [
  { handle: 'arthome.lisbon', displayName: 'Art Home Lisbon', defaultCity: 'Lisbon' },
];
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  if (ACCOUNTS.length === 0) {
    console.log('ACCOUNTS is empty — add handles in scripts/ig-radar/seed-accounts.ts first.');
    return;
  }

  // Connect after env is loaded (see the loadEnvFile note above).
  const db = drizzle(neon(process.env.DATABASE_URL!));

  const rows: NewIgAccount[] = ACCOUNTS.map((a) => ({
    id: normalizeHandle(a.handle),
    handle: normalizeHandle(a.handle),
    displayName: a.displayName ?? null,
    defaultCity: a.defaultCity ?? null,
  }));

  await db
    .insert(igAccounts)
    .values(rows)
    .onConflictDoUpdate({
      target: igAccounts.id,
      // Update descriptive fields only — never touch cursor / status / failureCount.
      set: {
        handle: sql`excluded.handle`,
        displayName: sql`excluded.display_name`,
        defaultCity: sql`excluded.default_city`,
      },
    });

  console.log(`Seeded ${rows.length} account(s).`);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});

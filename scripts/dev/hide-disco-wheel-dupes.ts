import { readFileSync } from 'fs';
import { Pool } from 'pg';

// One-off cleanup: Disco Wheel sometimes republishes the same workshop slot as a
// new Shopify product (…/thursday-workshop-250 → …-264). The parser's id hashes
// the product URL, so the slot gets a second row and the old one lingers (the
// scraper never removes rows). This hides every older copy of a slot, keeping
// the most recently scraped row (the one still live in the shop).
//
// Safe by design: DRY RUN unless `--apply`; only sets status='hidden' (reversible
// — set it back to 'published'); never deletes; touches Disco Wheel rows only.
//
//   npx tsx scripts/dev/hide-disco-wheel-dupes.ts            # local DB, dry run
//   npx tsx scripts/dev/hide-disco-wheel-dupes.ts --prod     # prod (.env.local), dry run
//   npx tsx scripts/dev/hide-disco-wheel-dupes.ts --prod --apply

const args = new Set(process.argv.slice(2));
const APPLY = args.has('--apply');

function prodUrl(): string {
  const line = readFileSync('.env.local', 'utf-8').split('\n').find((l) => l.startsWith('DATABASE_URL='));
  return (line ?? '').slice('DATABASE_URL='.length).trim().replace(/^["']|["']$/g, '');
}
const DB_URL = args.has('--prod')
  ? prodUrl()
  : (process.env.LOCAL_DATABASE_URL ?? 'postgresql://postgres@localhost:5432/postgres');

// Rows to hide: every published Disco Wheel row that isn't the latest-scraped
// one for its (date, start time) slot.
const FIND_SUPERSEDED = `
  select id, start_date::text as date, start_time, source_url, price, scraped_at
  from (
    select *, row_number() over (
      partition by start_date, start_time
      order by scraped_at desc, id
    ) as rn
    from events
    where source_name = 'Disco Wheel' and status = 'published'
  ) t
  where rn > 1
  order by start_date, start_time`;

async function main() {
  const target = new URL(DB_URL).host;
  const pool = new Pool({ connectionString: DB_URL, max: 1 });
  try {
    const { rows } = await pool.query(FIND_SUPERSEDED);
    console.log(`[dupes] ${target}: ${rows.length} superseded Disco Wheel row(s)`);
    for (const r of rows) {
      console.log(`  ${r.date} ${r.start_time}  ${r.price}  ${r.source_url}  (id ${r.id.slice(0, 8)})`);
    }
    if (!APPLY) {
      console.log('[dupes] dry run — re-run with --apply to hide them');
      return;
    }
    if (rows.length === 0) return;
    const res = await pool.query(
      `update events set status = 'hidden', curated_at = now() where id = any($1::text[])`,
      [rows.map((r) => r.id)],
    );
    console.log(`[dupes] hid ${res.rowCount} row(s). Undo: set status='published' for those ids.`);
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});

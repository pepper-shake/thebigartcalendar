// ig-radar — Phase 1: Watch.
//
// Pulls recent posts for every active account via Apify and stores the new ones
// in `ig_posts`. Idempotent: re-running never duplicates (posts insert
// ON CONFLICT DO NOTHING; the per-account cursor skips already-seen posts).
//
// This phase only CAPTURES. Filtering (Phase 2) and extraction (Phase 3) run
// separately over the stored posts, so we never re-scrape to re-process.
//
// Env: DATABASE_URL, APIFY_TOKEN.

// Load .env.local for local dev; in CI the env is injected. (Mirrors run-all.ts.)
try {
  process.loadEnvFile('.env.local');
} catch {
  // absent in CI — vars come from the environment
}

import { fetchRecentPosts, type ApifyPost } from './apify';
import {
  getActiveAccounts,
  toRow,
  insertPosts,
  markChecked,
  markFailed,
} from './store';

async function main() {
  console.log(`ig-radar started at ${new Date().toISOString()}`);

  const accounts = await getActiveAccounts();
  if (accounts.length === 0) {
    console.log('No active accounts. Seed them with `npm run radar:seed`.');
    return;
  }
  console.log(`Checking ${accounts.length} account(s)…`);

  // One actor run for all handles, then fan the results back out per account.
  let posts: ApifyPost[];
  try {
    posts = await fetchRecentPosts({ handles: accounts.map((a) => a.handle) });
  } catch (err) {
    // A whole-run failure counts as a strike against every account we asked for.
    console.error('Fetch failed:', err instanceof Error ? err.message : err);
    for (const a of accounts) await markFailed(a.id);
    process.exitCode = 1;
    return;
  }

  // Group returned posts by owner handle (normalized) for per-account handling.
  const byHandle = new Map<string, ApifyPost[]>();
  for (const p of posts) {
    const key = (p.ownerUsername ?? '').toLowerCase();
    if (!key) continue;
    (byHandle.get(key) ?? byHandle.set(key, []).get(key)!).push(p);
  }

  let totalNew = 0;
  for (const account of accounts) {
    const owned = byHandle.get(account.handle.toLowerCase()) ?? [];

    const rows = owned
      .map((p) => toRow(p, account.id, account.cursor))
      .filter((r): r is NonNullable<typeof r> => r !== null);

    try {
      await insertPosts(rows);
      // Advance the cursor to the newest post we saw this run (if any).
      const newest = owned
        .map((p) => p.timestamp)
        .filter((t): t is string => !!t)
        .sort()
        .at(-1) ?? null;
      await markChecked(account.id, newest);
      totalNew += rows.length;
      console.log(`  @${account.handle}: ${rows.length} new post(s)`);
    } catch (err) {
      console.error(`  @${account.handle}: store failed —`, err instanceof Error ? err.message : err);
      await markFailed(account.id);
    }
  }

  console.log(`ig-radar finished: ${totalNew} new post(s) at ${new Date().toISOString()}`);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});

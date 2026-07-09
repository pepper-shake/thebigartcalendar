// ig-radar — Phase 3 runner: extract event facts from gated posts.
//
// Usage: `npm run radar:extract [limit]`  (e.g. `npm run radar:extract 2`)
// Processes posts the gate marked as events (is_event = true) that haven't been
// extracted yet, and writes structured candidates to `event_candidates`.
// Idempotent: `processed_at` guards against re-extraction.
//
// Env: DATABASE_URL, ANTHROPIC_API_KEY.

try {
  process.loadEnvFile('.env.local');
} catch {
  // absent in CI
}

import { extractCandidates } from './extract';
import { getPostsToExtract, insertCandidates, markProcessed } from './store';

async function main() {
  const limit = process.argv[2] ? Number(process.argv[2]) : undefined;
  const posts = await getPostsToExtract(limit);

  if (posts.length === 0) {
    console.log('No event posts awaiting extraction.');
    return;
  }
  console.log(`Extracting from ${posts.length} post(s)…\n`);

  let total = 0;
  for (const post of posts) {
    const candidates = await extractCandidates({
      postId: post.id,
      caption: post.caption ?? '',
      publishedAt: post.publishedAt,
      defaultCity: post.defaultCity,
      defaultCountry: null, // inferred from city by the model
      organizerName: post.organizerName,
    });

    await insertCandidates(candidates);
    await markProcessed(post.id);
    total += candidates.length;

    console.log(`Post ${post.publishedAt?.toISOString().slice(0, 10)} → ${candidates.length} event(s):`);
    for (const c of candidates) {
      const when = [c.startDate, c.startTime].filter(Boolean).join(' ') || 'no date';
      console.log(`  • ${c.title}  [${when}] ${c.city ?? '?'} ${c.price ?? ''}`.trimEnd());
      console.log(`    ${c.description ?? ''}`);
      console.log(`    tags: ${(c.tags ?? []).join(', ') || '—'}  (conf ${c.confidence ?? '?'})`);
    }
    console.log('');
  }

  console.log(`Done: ${total} candidate event(s) from ${posts.length} post(s).`);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});

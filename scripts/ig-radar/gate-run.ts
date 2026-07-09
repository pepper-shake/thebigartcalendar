// ig-radar — Phase 2 runner: gate ungated posts.
//
// Usage: `npm run radar:gate [limit]`  (e.g. `npm run radar:gate 3`)
// Runs the cheap classifier over posts whose is_event is still null and records
// the decision. Idempotent: once a post is gated it's skipped next time.
//
// Env: DATABASE_URL, ANTHROPIC_API_KEY.

try {
  process.loadEnvFile('.env.local');
} catch {
  // absent in CI
}

import { gatePost } from './gate';
import { getUngatedPosts, setIsEvent } from './store';

async function main() {
  const limit = process.argv[2] ? Number(process.argv[2]) : undefined;
  const posts = await getUngatedPosts(limit);

  if (posts.length === 0) {
    console.log('No ungated posts.');
    return;
  }
  console.log(`Gating ${posts.length} post(s)…\n`);

  let events = 0;
  for (const post of posts) {
    const result = await gatePost({
      caption: post.caption ?? '',
      publishedAt: post.publishedAt,
      accountName: post.accountId,
    });
    await setIsEvent(post.id, result.isEvent);
    if (result.isEvent) events++;

    const mark = result.isEvent ? '✅ EVENT' : '⬜ skip ';
    const preview = (post.caption ?? '').replace(/\s+/g, ' ').slice(0, 60);
    console.log(
      `${mark} (${result.confidence.toFixed(2)}) ${post.publishedAt?.toISOString().slice(0, 10)} ${post.type}` +
      `\n   ${preview}` +
      `\n   → ${result.reason}${result.typeGuess ? ` [${result.typeGuess}]` : ''}\n`,
    );
  }

  console.log(`Done: ${events}/${posts.length} classified as events.`);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});

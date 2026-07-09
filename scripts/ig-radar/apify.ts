// Thin client for Apify's Instagram scraper actor.
//
// We use the run-sync endpoint (start a run, block until it finishes, return the
// dataset). Simple and fine for a modest number of accounts per radar run. Note
// Apify caps run-sync at ~300s server-side; if the account list grows large,
// switch to async runs + polling (see docs/exec-plans/active/ig-radar.md).
//
// Requires APIFY_TOKEN in the environment.

const ACTOR = 'apify~instagram-scraper';
const ENDPOINT = `https://api.apify.com/v2/acts/${ACTOR}/run-sync-get-dataset-items`;

/** A single post as returned by the actor (only the fields we consume). */
export interface ApifyPost {
  id: string;
  shortCode?: string;
  type?: string;             // 'Image' | 'Video' | 'Sidecar'
  caption?: string;
  url?: string;              // permalink
  timestamp?: string;        // ISO 8601
  ownerUsername?: string;
  displayUrl?: string;       // primary media URL (used only for the dedup hash)
}

export interface FetchPostsOptions {
  /** Instagram handles (without '@'), e.g. ["studioaqua", "clayhouse"]. */
  handles: string[];
  /** Recent posts to pull per profile. */
  resultsLimit?: number;
  /** ISO date; the actor skips posts older than this. */
  newerThan?: string;
}

/**
 * Pull recent posts for the given handles in a single actor run.
 * Throws on a non-OK response so the caller can mark accounts as failing.
 */
export async function fetchRecentPosts(opts: FetchPostsOptions): Promise<ApifyPost[]> {
  const token = process.env.APIFY_TOKEN;
  if (!token) throw new Error('APIFY_TOKEN is not set');
  if (opts.handles.length === 0) return [];

  const input: Record<string, unknown> = {
    directUrls: opts.handles.map((h) => `https://www.instagram.com/${h}/`),
    resultsType: 'posts',
    resultsLimit: opts.resultsLimit ?? 12,
    addParentData: false,
  };
  if (opts.newerThan) input.onlyPostsNewerThan = opts.newerThan;

  const res = await fetch(`${ENDPOINT}?token=${token}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Apify run failed: HTTP ${res.status} ${detail.slice(0, 200)}`);
  }

  return (await res.json()) as ApifyPost[];
}

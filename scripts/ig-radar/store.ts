import { createHash } from 'crypto';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq, and, sql, isNull, desc } from 'drizzle-orm';
import {
  igAccounts,
  igPosts,
  eventCandidates,
  type IgAccount,
  type NewIgPost,
  type NewEventCandidate,
} from '../../src/db/schema-instagram';
import type { ApifyPost } from './apify';

// Connect lazily (memoized), not at import time: env is loaded in the entry
// script's body, which runs AFTER these imports are evaluated. Mirrors the
// lazy connection in scripts/lib/upsert.ts.
let _db: ReturnType<typeof drizzle> | null = null;
function db() {
  if (!_db) _db = drizzle(neon(process.env.DATABASE_URL!));
  return _db;
}

/** Normalize a handle to the account id form: lowercase, no leading '@'. */
export function normalizeHandle(handle: string): string {
  return handle.trim().replace(/^@/, '').toLowerCase();
}

/** Map Apify's media type to our coarse post type. */
function mapType(t?: string): NewIgPost['type'] {
  switch (t) {
    case 'Sidecar': return 'carousel';
    case 'Video': return 'reel';
    default: return 'post';
  }
}

/** All accounts the radar should check this run. */
export async function getActiveAccounts(): Promise<IgAccount[]> {
  return db().select().from(igAccounts).where(eq(igAccounts.status, 'active'));
}

/**
 * Convert an Apify post to a row. Returns null if it lacks the fields we need
 * or is not newer than the account's cursor (delta guard).
 */
export function toRow(
  post: ApifyPost,
  accountId: string,
  cursor: string | null,
): NewIgPost | null {
  if (!post.id || !post.url || !post.timestamp) return null;
  if (cursor && post.timestamp <= cursor) return null;

  const contentHash = createHash('sha256')
    .update(`${post.caption ?? ''}::${post.displayUrl ?? ''}`)
    .digest('hex')
    .slice(0, 32);

  return {
    id: post.id,
    accountId,
    shortCode: post.shortCode ?? null,
    type: mapType(post.type),
    permalink: post.url,
    caption: post.caption ?? null,
    publishedAt: new Date(post.timestamp),
    contentHash,
  };
}

/** Posts not yet run through the gate (Phase 2), newest first. */
export async function getUngatedPosts(limit?: number) {
  const q = db()
    .select()
    .from(igPosts)
    .where(isNull(igPosts.isEvent))
    .orderBy(desc(igPosts.publishedAt));
  return limit ? q.limit(limit) : q;
}

/** Record the gate decision for a post. */
export async function setIsEvent(postId: string, isEvent: boolean): Promise<void> {
  await db().update(igPosts).set({ isEvent }).where(eq(igPosts.id, postId));
}

/**
 * Event posts awaiting extraction (Phase 3): gated true, not yet processed.
 * Joined with the account so the extractor has organizer/city fallbacks.
 */
export async function getPostsToExtract(limit?: number) {
  const q = db()
    .select({
      id: igPosts.id,
      caption: igPosts.caption,
      publishedAt: igPosts.publishedAt,
      defaultCity: igAccounts.defaultCity,
      organizerName: igAccounts.displayName,
    })
    .from(igPosts)
    .innerJoin(igAccounts, eq(igPosts.accountId, igAccounts.id))
    .where(and(eq(igPosts.isEvent, true), isNull(igPosts.processedAt)))
    .orderBy(desc(igPosts.publishedAt));
  return limit ? q.limit(limit) : q;
}

/** Persist extracted candidates for a post. */
export async function insertCandidates(rows: NewEventCandidate[]): Promise<void> {
  if (rows.length === 0) return;
  await db().insert(eventCandidates).values(rows);
}

/** Mark a post as extracted so it isn't reprocessed. */
export async function markProcessed(postId: string): Promise<void> {
  await db().update(igPosts).set({ processedAt: new Date() }).where(eq(igPosts.id, postId));
}

/** Insert new posts; existing ids are left untouched (raw rows are immutable). */
export async function insertPosts(rows: NewIgPost[]): Promise<void> {
  if (rows.length === 0) return;
  await db().insert(igPosts).values(rows).onConflictDoNothing({ target: igPosts.id });
}

/** Record a successful check: advance the cursor and reset failure state. */
export async function markChecked(accountId: string, newCursor: string | null): Promise<void> {
  await db()
    .update(igAccounts)
    .set({
      lastCheckedAt: new Date(),
      failureCount: 0,
      ...(newCursor ? { cursor: newCursor } : {}),
    })
    .where(eq(igAccounts.id, accountId));
}

/** Record a failed check: bump the counter and flag the account after 3 strikes. */
export async function markFailed(accountId: string): Promise<void> {
  await db()
    .update(igAccounts)
    .set({
      lastCheckedAt: new Date(),
      failureCount: sql`${igAccounts.failureCount} + 1`,
      status: sql`case when ${igAccounts.failureCount} + 1 >= 3 then 'failing' else ${igAccounts.status} end`,
    })
    .where(eq(igAccounts.id, accountId));
}

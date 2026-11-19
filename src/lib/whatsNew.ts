import type { ArtEvent } from '@/types';
import type { BlogPost } from '@/lib/blogPosts';

export const WHATS_NEW_COUNT = 6;

export type WhatsNewItem = { kind: 'event'; event: ArtEvent } | { kind: 'post'; post: BlogPost };

/**
 * "What's new?" on the homepage: upcoming events mixed with blog posts.
 * The newest post leads, then events and posts alternate at a ratio of about
 * three events per post (slots 0 and 4 are posts while there are any).
 * Events start soonest first, need an image, skip repeats of the same title,
 * and leave out events already in Editor's choice (other dates of the same
 * title too).
 */
export function selectWhatsNew(
  current: ArtEvent[],
  posts: BlogPost[],
  exclude: ArtEvent[],
  today: string,
): WhatsNewItem[] {
  const newestPosts = [...posts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  const titles = new Set(exclude.map((e) => e.title));
  const events: ArtEvent[] = [];
  for (const e of current) {
    if (events.length >= WHATS_NEW_COUNT) break;
    if (!e.image || e.date < today || titles.has(e.title)) continue;
    titles.add(e.title);
    events.push(e);
  }

  const items: WhatsNewItem[] = [];
  let p = 0;
  let ev = 0;
  for (let slot = 0; slot < WHATS_NEW_COUNT; slot++) {
    const wantPost = slot % 4 === 0;
    if ((wantPost || ev >= events.length) && p < newestPosts.length) {
      items.push({ kind: 'post', post: newestPosts[p++] });
    } else if (ev < events.length) {
      items.push({ kind: 'event', event: events[ev++] });
    }
  }
  return items;
}

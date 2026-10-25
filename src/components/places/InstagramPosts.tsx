'use client';

import { useState, useSyncExternalStore } from 'react';
import type { InstagramPost } from '@/lib/place-instagram-posts';

// Horizontal row of official Instagram embeds on a place page.
//
// Instagram's embed iframe sets Meta cookies, so nothing loads from Instagram
// until the visitor clicks "Show posts" (click-to-load, the usual EU pattern).
// The click is remembered in localStorage, so later place pages load directly.
// Before that, the server-rendered fallback is plain links to each post.

const KEY = 'bac-instagram-embeds';
const CHANGE_EVENT = 'bac-instagram-embeds-change';

function readEnabled(): boolean {
  try {
    return localStorage.getItem(KEY) === 'on';
  } catch {
    return false;
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
}

// Photo-only crop: the iframe is cross-origin, so we can't style inside it.
// Instead it sits in a clipping window that hides Instagram's header (account
// row) and footer (likes, comments), leaving just the media. Tuned for 4:5
// posts/reels (Instagram's default ratio); square posts show a sliver of footer.
// If Instagram changes its embed layout, retune these two numbers.
const EMBED_WIDTH = 326; // Instagram's minimum embed width
const HEADER_HEIGHT = 58; // account row + audio line, plus a little margin
const MEDIA_HEIGHT = 400; // 4:5 media is 326 × 408; trimmed so no footer shows

function Embed({ post, index }: { post: InstagramPost; index: number }) {
  return (
    <a
      href={post.permalink}
      target="_blank"
      rel="noopener noreferrer"
      className="relative block shrink-0 snap-start overflow-hidden bg-white"
      style={{ width: EMBED_WIDTH, height: MEDIA_HEIGHT }}
      aria-label={`Instagram post ${index + 1} (opens Instagram)`}
    >
      <iframe
        src={post.embedUrl}
        title={`Instagram post ${index + 1}`}
        width={EMBED_WIDTH}
        height={HEADER_HEIGHT + MEDIA_HEIGHT + 300}
        scrolling="no"
        tabIndex={-1}
        className="pointer-events-none absolute left-0 border-0"
        style={{ top: -HEADER_HEIGHT }}
      />
    </a>
  );
}

export default function InstagramPosts({ posts, handle }: { posts: InstagramPost[]; handle: string | null }) {
  const enabled = useSyncExternalStore(subscribe, readEnabled, () => false);

  function enable() {
    try {
      localStorage.setItem(KEY, 'on');
    } catch {
      // Storage blocked: fall through, the event still flips this page view.
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }

  const [forced, setForced] = useState(false);
  const show = enabled || forced;

  return (
    <section className="mt-10">
      <h2
        className="mb-4 text-ink"
        style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 28, lineHeight: '32px' }}
      >
        On Instagram{handle ? <span className="text-ink/60"> · @{handle}</span> : null}
      </h2>
      {show ? (
        <div className="-mx-6 flex snap-x gap-4 overflow-x-auto px-6 pb-2 lg:mx-0 lg:px-0">
          {posts.map((p, i) => (
            <Embed key={p.embedUrl} post={p} index={i} />
          ))}
        </div>
      ) : (
        <div
          className="flex flex-col items-start gap-4 p-5"
          style={{ backgroundColor: 'rgba(251,250,246,0.7)', fontFamily: 'var(--font-serif)', fontSize: 16 }}
        >
          <p className="text-ink/80">
            {posts.length} recent {posts.length === 1 ? 'post' : 'posts'} from this place. Showing them loads
            content (and cookies) from Instagram.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                enable();
                setForced(true);
              }}
              className="inline-flex h-11 items-center bg-ink px-4 text-white hover:opacity-80 transition-opacity"
              style={{ fontSize: 18 }}
            >
              Show posts
            </button>
            {posts.map((p, i) => (
              <a
                key={p.permalink}
                href={p.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center px-3 text-ink hover:underline underline-offset-2"
              >
                Post {i + 1} ↗
              </a>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

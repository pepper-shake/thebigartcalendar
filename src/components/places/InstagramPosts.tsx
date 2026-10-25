'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
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

const EMBED_WIDTH = 326; // Instagram's minimum embed width
const DEFAULT_HEIGHT = 560;

function Embed({ post, index }: { post: InstagramPost; index: number }) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(DEFAULT_HEIGHT);

  // The embed reports its content height via postMessage ({type: 'MEASURE'}).
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.origin !== 'https://www.instagram.com' || e.source !== ref.current?.contentWindow) return;
      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        const h = data?.type === 'MEASURE' ? Number(data.details?.height) : NaN;
        if (h > 0) setHeight(h);
      } catch {
        // Not a message we understand.
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  return (
    <iframe
      ref={ref}
      src={post.embedUrl}
      title={`Instagram post ${index + 1}`}
      width={EMBED_WIDTH}
      height={height}
      scrolling="no"
      className="shrink-0 snap-start border-0 bg-white"
    />
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

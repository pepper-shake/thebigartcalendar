'use client';

import { useEffect, useRef, useState } from 'react';
import type { InstagramPost } from '@/lib/place-instagram-posts';

// "On IG" row of official Instagram embeds on a place page, below the place
// panel (Figma "Place page", node 310:1933).
//
// Embeds load straight away (operator's call, 2026-10-25): Instagram's iframe
// sets Meta cookies without asking first, which is an EU-consent risk we
// accept for now. Gate it behind the cookie banner if that changes.

// Photo-only crop: the iframe is cross-origin, so we can't style inside it.
// Instead it sits in a clipping window that hides Instagram's header (account
// row) and footer (likes, comments), leaving just the media. The embed is
// responsive between 326 and 540px wide with 4:5 media (Instagram's default
// ratio; square posts show a sliver of footer), so we render it at the card's
// width (clamped) and CSS-scale it to fit exactly. If Instagram changes its
// embed layout, retune these numbers.
const EMBED_MIN = 326;
const EMBED_MAX = 540;
const HEADER_CROP = 60; // account row + audio line (~56px), plus a little margin
const FOOTER_TRIM = 8; // shave the bottom so no footer border peeks through

// Card styling from the Figma "Place page" design (node 310:1933): cream card,
// 24px padding, three across on desktop.
const CARD_BG = '#fbfaf6';

function Embed({ post, index }: { post: InstagramPost; index: number }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const render = Math.min(EMBED_MAX, Math.max(EMBED_MIN, width));
  const scale = width ? width / render : 1;
  const visible = render * 1.25 - FOOTER_TRIM; // in iframe pixels

  return (
    <a
      ref={ref}
      href={post.permalink}
      target="_blank"
      rel="noopener noreferrer"
      className="relative block w-full overflow-hidden"
      style={width ? { height: visible * scale } : { aspectRatio: '4 / 5' }}
      aria-label={`Instagram post ${index + 1} (opens Instagram)`}
    >
      {width > 0 && (
        <iframe
          src={post.embedUrl}
          title={`Instagram post ${index + 1}`}
          width={render}
          height={HEADER_CROP + visible + 300}
          scrolling="no"
          tabIndex={-1}
          className="pointer-events-none absolute left-0 origin-top-left border-0"
          style={{ top: -HEADER_CROP * scale, transform: `scale(${scale})` }}
        />
      )}
    </a>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="w-[85%] shrink-0 snap-start p-6 sm:w-[calc((100%-16px)/2)] lg:w-[calc((100%-32px)/3)]"
      style={{ backgroundColor: CARD_BG }}
    >
      {children}
    </div>
  );
}

export default function InstagramPosts({ posts, handle }: { posts: InstagramPost[]; handle: string | null }) {
  return (
    <section className="mt-12">
      <h2
        className="text-ink"
        style={{
          fontFamily: 'var(--font-serif)',
          fontWeight: 300,
          fontSize: 28,
          lineHeight: '32px',
          letterSpacing: '-0.02em',
        }}
      >
        On IG{handle ? ` @${handle}` : ''}
      </h2>
      <div className="scrollbar-hide -mx-6 mt-8 flex snap-x gap-4 overflow-x-auto px-6 lg:mx-0 lg:px-0">
        {posts.map((p, i) => (
          <Card key={p.permalink}>
            <Embed post={p} index={i} />
          </Card>
        ))}
      </div>
    </section>
  );
}

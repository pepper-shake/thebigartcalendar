'use client';

import { useEffect } from 'react';
import { trackEvent } from '@/lib/analytics';

// Read depth on a blog post: sends blog_read_25 / _50 / _75 and
// blog_read_finish once each, measured against the top of the site footer
// (the post ends where the footer starts).
const MILESTONES = [
  { at: 0.25, name: 'blog_read_25' },
  { at: 0.5, name: 'blog_read_50' },
  { at: 0.75, name: 'blog_read_75' },
  { at: 0.98, name: 'blog_read_finish' },
];

export default function BlogReadTracker({ slug }: { slug: string }) {
  useEffect(() => {
    const sent = new Set<string>();
    let frame = 0;

    const check = () => {
      frame = 0;
      const footer = document.querySelector('footer');
      const end = footer
        ? footer.getBoundingClientRect().top + window.scrollY
        : document.documentElement.scrollHeight;
      const depth = (window.scrollY + window.innerHeight) / end;
      for (const m of MILESTONES) {
        if (depth >= m.at && !sent.has(m.name)) {
          sent.add(m.name);
          trackEvent(m.name, { post: slug });
        }
      }
      if (sent.size === MILESTONES.length) window.removeEventListener('scroll', onScroll);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [slug]);

  return null;
}

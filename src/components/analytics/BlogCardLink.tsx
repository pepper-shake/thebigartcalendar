'use client';

import { trackEvent } from '@/lib/analytics';

// A /blog card link that reports blog_card_click (the "opened from the blog
// page" step; the post's own page view also counts visits from elsewhere).
export default function BlogCardLink({
  slug,
  href,
  className,
  also,
  children,
}: {
  slug: string;
  href: string;
  className?: string;
  /** A second event to send with blog_card_click, e.g. whats_new_click on the homepage. */
  also?: { event: string; params: Record<string, string | number> };
  children: React.ReactNode;
}) {
  return (
    // Posts are standalone landings, opened in their own tab.
    <a
      href={href}
      target="_blank"
      rel="noopener"
      className={className}
      onClick={() => {
        trackEvent('blog_card_click', { post: slug });
        if (also) trackEvent(also.event, also.params);
      }}
    >
      {children}
    </a>
  );
}

'use client';

import { trackEvent } from '@/lib/analytics';

// A /blog card link that reports blog_card_click (the "opened from the blog
// page" step; the post's own page view also counts visits from elsewhere).
export default function BlogCardLink({
  slug,
  href,
  className,
  children,
}: {
  slug: string;
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    // Posts are standalone landings, opened in their own tab.
    <a
      href={href}
      target="_blank"
      rel="noopener"
      className={className}
      onClick={() => trackEvent('blog_card_click', { post: slug })}
    >
      {children}
    </a>
  );
}

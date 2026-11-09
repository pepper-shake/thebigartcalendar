'use client';

import Link from 'next/link';
import { trackEvent } from '@/lib/analytics';

// An internal link that reports a custom event on click (e.g. the homepage's
// editor_choice_click / whats_new_click). See docs/references/analytics.md.
export default function TrackedLink({
  href,
  event,
  params,
  className,
  children,
}: {
  href: string;
  event: string;
  params: Record<string, string | number>;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} prefetch={false} className={className} onClick={() => trackEvent(event, params)}>
      {children}
    </Link>
  );
}

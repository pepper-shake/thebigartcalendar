'use client';

import { useState } from 'react';
import { SITE_DEFAULT_IMAGE } from '@/lib/organiser-images';

// Renders an event image that self-heals against dead/broken URLs: it walks the
// fallback ladder (candidates) in order, advancing to the next candidate on any
// load error, ending at the site placeholder. Fixes the case where a scraped
// image_url is non-null but 404s (e.g. a source deletes/renames its image).
export function EventImage({
  candidates,
  alt,
  className,
  loading,
}: {
  candidates: string[];
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
}) {
  const list = candidates.length ? candidates : [SITE_DEFAULT_IMAGE];
  const [idx, setIdx] = useState(0);
  const src = list[Math.min(idx, list.length - 1)];
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={loading}
      className={className}
      onError={() => setIdx((i) => (i < list.length - 1 ? i + 1 : i))}
    />
  );
}

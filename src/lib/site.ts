// Single source of truth for the site's public origin and identity.
// SITE_URL drives metadataBase, canonical URLs, sitemap, and JSON-LD.
// Override per-environment with NEXT_PUBLIC_SITE_URL (set in Vercel + .env.local).

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://thebigartcalendar.com'
).replace(/\/+$/, '');

export const SITE_NAME = 'The Big Art Calendar';

export const SITE_DESCRIPTION =
  'Discover art events across Europe — exhibitions, art fairs, workshops, performances, and auctions. Updated daily, free to browse.';

/** Build an absolute URL for a site-relative path. */
export function absoluteUrl(path = '/'): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

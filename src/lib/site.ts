// Single source of truth for the site's public origin and identity.
// SITE_URL drives metadataBase, canonical URLs, sitemap, and JSON-LD.
// Override per-environment with NEXT_PUBLIC_SITE_URL (set in Vercel + .env.local).

import { PORTUGAL_ONLY_MODE } from '@/config/feature-flags';

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://thebigartcalendar.com'
).replace(/\/+$/, '');

export const SITE_NAME = 'The Big Art Calendar';

// Region wording for titles/descriptions/copy, tied to PORTUGAL_ONLY_MODE so the
// site's words match what it shows. Use these instead of writing "Europe".
export const REGION = PORTUGAL_ONLY_MODE ? 'Portugal' : 'Europe';
/** Adjective form: "Portuguese" / "European". */
export const REGION_ADJECTIVE = PORTUGAL_ONLY_MODE ? 'Portuguese' : 'European';
/** Site tagline, e.g. in the default <title>: "Art Events Across Portugal". */
export const SITE_TAGLINE = `Art Events Across ${REGION}`;

export const SITE_DESCRIPTION = `Discover art events across ${REGION} — exhibitions, art fairs, workshops, performances, and auctions. Updated daily, free to browse.`;

/** Build an absolute URL for a site-relative path. */
export function absoluteUrl(path = '/'): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

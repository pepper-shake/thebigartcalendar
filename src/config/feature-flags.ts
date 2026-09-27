// Feature flags. Flip a value here and redeploy — nothing else needs to change.

/**
 * PORTUGAL_ONLY_MODE — temporarily limit the whole public site to Portugal.
 *
 * When true, events and places outside `VISIBLE_COUNTRIES` are filtered out
 * at the data layer (src/db/queries.ts), so the calendar, city filter, city
 * and type hubs, event pages, /places, and the sitemap all see only Portugal —
 * no per-component checks. The underlying data is untouched: the scraper keeps
 * collecting international events, and setting this to false shows everything
 * again. See docs/product/portugal-only-mode.md.
 */
export const PORTUGAL_ONLY_MODE = true;

/** Countries visible while PORTUGAL_ONLY_MODE is on (matched case-insensitively). */
export const VISIBLE_COUNTRIES = ['Portugal'];

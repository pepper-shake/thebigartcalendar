// IndexNow: tell Bing (which also feeds ChatGPT search), Yandex, Seznam, etc.
// about new/changed pages immediately instead of waiting for a crawl.
// https://www.indexnow.org/documentation
//
// The key is public by design: search engines verify ownership by fetching
// https://<host>/<key>.txt, served from public/<key>.txt. Rotating it = new
// key + new file.

const HOST = 'thebigartcalendar.com';
const ORIGIN = `https://${HOST}`;
export const INDEXNOW_KEY = '357aab468a63b416821b746c5ae0f00f';

/** Only ping for writes to the production DB (not the local PGlite copy). */
export function isProductionDb(): boolean {
  return /neon\.tech/.test(process.env.DATABASE_URL ?? '');
}

/** Submit site-relative paths (e.g. "/events/foo") to IndexNow. Never throws —
 *  a failed ping must not fail the scrape. */
export async function submitToIndexNow(paths: string[]): Promise<void> {
  const urlList = [...new Set(paths)].map((p) => `${ORIGIN}${p}`);
  if (urlList.length === 0) return;
  if (!isProductionDb()) {
    console.log(`[IndexNow] skipped (not the production DB): ${urlList.length} URL(s)`);
    return;
  }
  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: HOST,
        key: INDEXNOW_KEY,
        keyLocation: `${ORIGIN}/${INDEXNOW_KEY}.txt`,
        urlList: urlList.slice(0, 10000),
      }),
    });
    // 200 = accepted, 202 = accepted, key validation pending.
    console.log(`[IndexNow] submitted ${urlList.length} URL(s): HTTP ${res.status}`);
  } catch (err) {
    console.error('[IndexNow] ping failed:', err instanceof Error ? err.message : err);
  }
}

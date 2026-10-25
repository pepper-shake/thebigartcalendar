// Hand-picked Instagram posts shown on a place page (/places/<slug>), keyed by
// place `id`. Paste post or reel links from the place's own account; order is
// display order. Shown via Instagram's official embed, so the photos stay on
// Instagram with attribution — we never copy them. See docs/product/places.md.

export const PLACE_INSTAGRAM_POSTS: Record<string, string[]> = {
  'muda-ceramica': [
    'https://www.instagram.com/reel/DeaJa5pIoYz/',
    'https://www.instagram.com/reel/Dd6VvI7I6ql/',
    'https://www.instagram.com/reel/Ddzq3EPs_ea/',
    'https://www.instagram.com/reel/DdynbwuIay6/',
  ],
};

export interface InstagramPost {
  permalink: string;
  embedUrl: string;
}

const POST_RE = /instagram\.com\/(?:[\w.]+\/)?(p|reel|tv)\/([\w-]+)/;

/** The place's posts as permalink + embed URL; unparseable links are skipped. */
export function placeInstagramPosts(placeId: string): InstagramPost[] {
  return (PLACE_INSTAGRAM_POSTS[placeId] ?? []).flatMap((url) => {
    const m = POST_RE.exec(url);
    if (!m) return [];
    const [, kind, code] = m;
    return [{
      permalink: `https://www.instagram.com/${kind}/${code}/`,
      embedUrl: `https://www.instagram.com/${kind}/${code}/embed/`,
    }];
  });
}

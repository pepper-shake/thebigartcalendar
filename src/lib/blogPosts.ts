// Blog posts. Each post is a hand-built, standalone landing page under
// /blog/<slug> (its own route folder); this list feeds the /blog index, the
// sitemap and each post's metadata. The planned `posts` table (decision #0004)
// will replace it once posts are authored in the admin.

export type BlogPost = {
  slug: string;
  title: string;
  /** Short lead-in shown above the title on the landing ("Our Guide to"). */
  kicker?: string;
  /** Search/social title; defaults to `${kicker} ${title}`. Used as-is (no site-name suffix). */
  metaTitle?: string;
  description: string;
  /** Main keyword first, then supporting ones (meta keywords + JSON-LD). */
  keywords?: string[];
  /** ISO date (YYYY-MM-DD). */
  publishedAt: string;
  /** Site-relative share image, 1200×630 (Open Graph, X card, JSON-LD, sitemap). */
  image: string;
  imageAlt: string;
  /** Site-relative card image on the /blog index (a designed collage, 405:310). */
  cover: string;
  coverAlt: string;
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'online-stores-for-creative-christmas-gifts',
    kicker: 'Our Guide to',
    title: 'Online stores for creative Christmas gifts',
    metaTitle: 'Our Guide to Online Stores for Creative Christmas Gifts',
    description:
      'Six small online shops I love for unique Christmas gifts: handmade slippers, colourful hats, happy towels, artist prints, beautiful stationery and jewellery.',
    keywords: [
      'creative Christmas gifts online',
      'unique Christmas gifts',
      'handmade gifts',
      'gifts for friends',
      'Secret Santa ideas',
      'small online shops',
    ],
    publishedAt: '2026-10-27',
    // The landing's first screen: the title on velvet with gold stars.
    image: '/blog/online-stores-for-creative-christmas-gifts/share.jpg',
    imageAlt: 'Our Guide to Online stores for creative Christmas gifts, in red italic type on dark red velvet with gold stars',
    cover: '/blog/online-stores-for-creative-christmas-gifts/card-cover.jpg',
    coverAlt: 'A green envelope on red velvet with a mushroom ornament, a mug and stars: "The gift is the feeling"',
  },
];

export function getBlogPost(slug: string): BlogPost {
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) throw new Error(`Unknown blog post: ${slug}`);
  return post;
}

/** One-line card title: "Our guide to online stores for creative Christmas gifts". */
export function blogPostCardTitle(post: BlogPost): string {
  if (!post.kicker) return post.title;
  const kicker = post.kicker.toLowerCase();
  return `${kicker[0].toUpperCase()}${kicker.slice(1)} ${post.title[0].toLowerCase()}${post.title.slice(1)}`;
}

/** The title for search results and link previews. */
export function blogPostMetaTitle(post: BlogPost): string {
  return post.metaTitle ?? (post.kicker ? `${post.kicker} ${post.title}` : post.title);
}

export const blogPostPath = (slug: string) => `/blog/${slug}`;

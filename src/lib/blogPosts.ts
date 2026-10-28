// Blog posts. Each post is a hand-built, standalone landing page under
// /blog/<slug> (its own route folder); this list feeds the /blog index, the
// sitemap and each post's metadata. The planned `posts` table (decision #0004)
// will replace it once posts are authored in the admin.

export type BlogPost = {
  slug: string;
  title: string;
  /** Short lead-in shown above the title on the landing ("Our Guide to"). */
  kicker?: string;
  description: string;
  /** ISO date (YYYY-MM-DD). */
  publishedAt: string;
  /** Site-relative share image (Open Graph, JSON-LD, sitemap). */
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
    description:
      'Where to buy creative Christmas gifts online: independent shops for ornaments, stationery, jewellery and homeware, from Amsterdam to London.',
    publishedAt: '2026-10-27',
    image: '/blog/online-stores-for-creative-christmas-gifts/intro-photo.jpg',
    imageAlt: 'Wrapped Christmas presents under a decorated tree',
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

export const blogPostPath = (slug: string) => `/blog/${slug}`;

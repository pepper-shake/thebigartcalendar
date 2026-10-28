import type { Metadata } from 'next';
import Image from 'next/image';
import { REGION_ADJECTIVE } from '@/lib/site';
import { BLOG_POSTS, blogPostCardTitle, blogPostPath } from '@/lib/blogPosts';
import PageShell from '@/components/seo/PageShell';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
export const metadata: Metadata = {
  title: 'Blog',
  description: `Writing about art events, the ${REGION_ADJECTIVE} art scene, and how to get the most out of The Big Art Calendar.`,
};

// Figma "Blog" (Calendar 287:4760): breadcrumbs, then a grid of white cards
// (title above a 405:310 cover), three across on desktop.
export default function BlogPage() {
  const posts = [...BLOG_POSTS].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  return (
    <PageShell size="full">
      <Breadcrumbs
        items={[
          { name: 'Calendar', href: '/' },
          { name: 'Blog', href: '/blog' },
        ]}
      />
      {/* The design has no visible heading; keep one for crawlers and screen readers. */}
      <h1 className="sr-only">Blog</h1>

      {posts.length === 0 ? (
        <p
          className="text-ink/40"
          style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 18, lineHeight: '28px' }}
        >
          No posts yet — check back soon.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <li key={post.slug}>
              {/* Posts are standalone landings, opened in their own tab. */}
              <a
                href={blogPostPath(post.slug)}
                target="_blank"
                rel="noopener"
                className="group flex h-full flex-col gap-4 bg-white p-6 text-ink"
              >
                <h2
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontWeight: 300,
                    fontSize: 34,
                    lineHeight: '36px',
                    letterSpacing: '-0.68px',
                  }}
                >
                  {blogPostCardTitle(post)}
                </h2>
                <div className="relative mt-auto aspect-[405/310] overflow-hidden">
                  <Image
                    src={post.cover}
                    alt={post.coverAlt}
                    fill
                    sizes="(min-width: 1024px) 405px, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.015]"
                  />
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  );
}

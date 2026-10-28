import type { Metadata } from 'next';
import Image from 'next/image';
import { REGION_ADJECTIVE } from '@/lib/site';
import { BLOG_POSTS, blogPostPath } from '@/lib/blogPosts';
import SiteFooter from '@/components/layout/SiteFooter';
export const metadata: Metadata = {
  title: 'Blog',
  description: `Writing about art events, the ${REGION_ADJECTIVE} art scene, and how to get the most out of The Big Art Calendar.`,
};

const dateFormat = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

export default function BlogPage() {
  const posts = [...BLOG_POSTS].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  return (
    <div className="min-h-full flex flex-col" style={{ backgroundColor: 'var(--page)' }}>
      <main className="flex-1 px-6 py-16 max-w-2xl mx-auto w-full">

        <h1
          className="text-ink lowercase mb-12"
          style={{
            fontFamily: 'var(--font-serif)',
            fontWeight: 300,
            fontSize: 'clamp(56px, 8vw, 82px)',
            lineHeight: 0.95,
            letterSpacing: '-2px',
          }}
        >
          Blog
        </h1>

        {posts.length === 0 ? (
          <p
            className="text-ink/40"
            style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 18, lineHeight: '28px' }}
          >
            No posts yet — check back soon.
          </p>
        ) : (
          <ul className="flex flex-col gap-12">
            {posts.map((post) => (
              <li key={post.slug}>
                {/* Posts are standalone landings, opened in their own tab. */}
                <a href={blogPostPath(post.slug)} target="_blank" rel="noopener" className="group block text-ink">
                  <div className="relative aspect-[3/2] overflow-hidden">
                    <Image
                      src={post.image}
                      alt={post.imageAlt}
                      fill
                      sizes="(max-width: 720px) 100vw, 672px"
                      className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.015]"
                    />
                  </div>
                  <p
                    className="mt-4 text-ink/60"
                    style={{ fontFamily: 'var(--font-meta)', fontSize: 14, lineHeight: '20px' }}
                  >
                    {dateFormat.format(new Date(post.publishedAt))}
                  </p>
                  <h2
                    className="mt-1"
                    style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 36, lineHeight: '40px', letterSpacing: '-0.5px' }}
                  >
                    {post.kicker && <span className="italic">{post.kicker} </span>}
                    {post.title}
                  </h2>
                  <p
                    className="mt-3 text-ink/70"
                    style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 18, lineHeight: '28px' }}
                  >
                    {post.description}
                  </p>
                </a>
              </li>
            ))}
          </ul>
        )}

      </main>
      <SiteFooter />
    </div>
  );
}

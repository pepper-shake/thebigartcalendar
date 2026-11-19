import type { Metadata } from 'next';
import Image from 'next/image';
import { REGION_ADJECTIVE } from '@/lib/site';
import { BLOG_POSTS, blogPostCardTitle, blogPostPath } from '@/lib/blogPosts';
import BlogCardLink from '@/components/analytics/BlogCardLink';
import NewsletterSignup from '@/components/home/NewsletterSignup';
import SiteFooter from '@/components/layout/SiteFooter';
import home from '@/components/home/Home.module.css';
import wah from '@/components/where-art-happens/WhereArtHappens.module.css';
import s from '@/components/blog/BlogIndex.module.css';

export const metadata: Metadata = {
  title: 'Blog',
  description: `Writing about art events, the ${REGION_ADJECTIVE} art scene, and how to get the most out of The Big Art Calendar.`,
};

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** "November · 2026" */
function monthYear(iso: string): string {
  const [y, m] = iso.split('-').map(Number);
  return `${MONTHS[m - 1]} · ${y}`;
}

// Figma "Blog" (Calendar 409:2165): title + intro on cream, an olive band of
// post cards (the first one large), then the newsletter and the footer.
export default function BlogPage() {
  // Oldest first, as in the design: the first post is the large feature.
  const posts = [...BLOG_POSTS].sort((a, b) => a.publishedAt.localeCompare(b.publishedAt));
  return (
    <div className={`${home.home} ${wah.page} min-h-full flex flex-col`} style={{ backgroundColor: 'var(--page)' }}>
      <main className="flex-1">
        <section className={s.intro}>
          <div className={`${wah.wrap} ${wah.split}`}>
            <h1 className={wah.title}>Blog</h1>
            <div className={wah.copy}>
              <p>
                For creative people who want to find art events near them and connect with others. Open calls, our
                picks of events worth going to, and honest thoughts on creative life, written with care
              </p>
            </div>
          </div>
        </section>

        <section aria-label="Posts" className={s.posts}>
          <div className={wah.wrap}>
            {posts.length === 0 ? (
              <p className={s.title}>No posts yet — check back soon.</p>
            ) : (
              <ul className={s.grid}>
                {posts.map((post, i) => {
                  const feature = i === 0;
                  return (
                    <li key={post.slug} className={feature ? s.feature : undefined}>
                      <BlogCardLink slug={post.slug} href={blogPostPath(post.slug)} className={s.card}>
                        <div className={s.cover}>
                          <Image
                            src={post.cover}
                            alt={post.coverAlt}
                            fill
                            sizes={
                              feature
                                ? '(min-width: 1024px) 43vw, 100vw'
                                : '(min-width: 1024px) 22vw, (min-width: 640px) 50vw, 100vw'
                            }
                            preload={feature}
                          />
                        </div>
                        <div className={s.text}>
                          <p className={s.date}>
                            <time dateTime={post.publishedAt}>{monthYear(post.publishedAt)}</time>
                          </p>
                          <h2 className={s.title}>{blogPostCardTitle(post)}</h2>
                          {feature && <p className={s.excerpt}>{post.excerpt ?? post.description}</p>}
                        </div>
                      </BlogCardLink>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>

        <NewsletterSignup source="blog" />
      </main>
      <SiteFooter flush />
    </div>
  );
}

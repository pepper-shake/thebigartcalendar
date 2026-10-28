import type { Metadata } from 'next';
import GiftGuide from '@/components/blog/gift-guide/GiftGuide';
import SiteFooter from '@/components/layout/SiteFooter';
import JsonLd from '@/components/seo/JsonLd';
import BlogReadTracker from '@/components/analytics/BlogReadTracker';
import { blogPostPath, getBlogPost } from '@/lib/blogPosts';
import { blogPostJsonLd } from '@/lib/jsonld';
import { absoluteUrl } from '@/lib/site';

const post = getBlogPost('online-stores-for-creative-christmas-gifts');

export const metadata: Metadata = {
  title: post.title,
  description: post.description,
  alternates: { canonical: absoluteUrl(blogPostPath(post.slug)) },
  openGraph: {
    type: 'article',
    title: post.title,
    description: post.description,
    url: absoluteUrl(blogPostPath(post.slug)),
    publishedTime: post.publishedAt,
    images: [{ url: post.image, alt: post.imageAlt }],
  },
  twitter: { card: 'summary_large_image', title: post.title, description: post.description, images: [post.image] },
};

// A standalone landing: RootHeader hides itself under /blog/<slug>; the
// guide carries its own wordmark.
export default function GiftGuidePage() {
  return (
    <>
      <GiftGuide post={post} />
      <SiteFooter flush />
      <JsonLd data={blogPostJsonLd(post)} />
      <BlogReadTracker slug={post.slug} />
    </>
  );
}

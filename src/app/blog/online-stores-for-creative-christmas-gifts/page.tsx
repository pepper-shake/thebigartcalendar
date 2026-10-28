import type { Metadata } from 'next';
import GiftGuide from '@/components/blog/gift-guide/GiftGuide';
import SiteFooter from '@/components/layout/SiteFooter';
import JsonLd from '@/components/seo/JsonLd';
import BlogReadTracker from '@/components/analytics/BlogReadTracker';
import { blogPostMetaTitle, blogPostPath, getBlogPost } from '@/lib/blogPosts';
import { blogPostJsonLd } from '@/lib/jsonld';
import { absoluteUrl } from '@/lib/site';

const post = getBlogPost('online-stores-for-creative-christmas-gifts');
const title = blogPostMetaTitle(post);
const image = { url: post.image, width: 1200, height: 630, alt: post.imageAlt };

export const metadata: Metadata = {
  // As written for search, without the site-name suffix.
  title: { absolute: title },
  description: post.description,
  keywords: post.keywords,
  alternates: { canonical: absoluteUrl(blogPostPath(post.slug)) },
  openGraph: {
    type: 'article',
    title,
    description: post.description,
    url: absoluteUrl(blogPostPath(post.slug)),
    publishedTime: post.publishedAt,
    images: [image],
  },
  twitter: { card: 'summary_large_image', title, description: post.description, images: [image] },
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

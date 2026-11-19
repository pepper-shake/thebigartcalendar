import type { Metadata } from 'next';
import MnaaReopening, { MNAA_URL } from '@/components/blog/mnaa-reopening/MnaaReopening';
import SiteFooter from '@/components/layout/SiteFooter';
import JsonLd from '@/components/seo/JsonLd';
import BlogReadTracker from '@/components/analytics/BlogReadTracker';
import { blogPostMetaTitle, blogPostPath, getBlogPost } from '@/lib/blogPosts';
import { blogPostJsonLd } from '@/lib/jsonld';
import { absoluteUrl } from '@/lib/site';

const post = getBlogPost('museu-nacional-de-arte-antiga-reopens-with-free-entry');
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

// The reopening weekend itself, so it can show up as an event in search.
const reopeningJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Event',
  name: 'Museu Nacional de Arte Antiga reopening weekend',
  startDate: '2026-11-21T15:00:00+00:00',
  endDate: '2026-11-22T18:00:00+00:00',
  eventStatus: 'https://schema.org/EventScheduled',
  eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
  isAccessibleForFree: true,
  description:
    'The museum reopens after restoration with new temporary exhibitions, concerts, guided tours and workshops. Free entry from 21 November to 1 December.',
  image: [absoluteUrl(post.image)],
  url: MNAA_URL,
  location: {
    '@type': 'Museum',
    name: 'Museu Nacional de Arte Antiga',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Rua das Janelas Verdes',
      addressLocality: 'Lisbon',
      addressCountry: 'PT',
    },
  },
  organizer: { '@type': 'Organization', name: 'Museu Nacional de Arte Antiga', url: MNAA_URL },
};

// A plain article (`layout: 'article'`): the normal site header stays.
export default function MnaaReopeningPage() {
  return (
    <div className="min-h-full flex flex-col" style={{ backgroundColor: 'var(--page)' }}>
      <main className="flex-1 w-full">
        <MnaaReopening post={post} />
      </main>
      <SiteFooter />
      <JsonLd data={blogPostJsonLd(post)} />
      <JsonLd data={reopeningJsonLd} />
      <BlogReadTracker slug={post.slug} />
    </div>
  );
}

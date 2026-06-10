import type { MetadataRoute } from 'next';
import { getCurrentEvents, listCities } from '@/lib/events';
import { eventSlug } from '@/lib/slug';
import { EVENT_TYPES } from '@/lib/eventTypes';
import { absoluteUrl } from '@/lib/site';

// Regenerated per request so new scraped events appear without a redeploy.
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [events, cities] = await Promise.all([getCurrentEvents(), listCities()]);
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl('/'), lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: absoluteUrl('/cities'), lastModified: now, changeFrequency: 'daily', priority: 0.6 },
    { url: absoluteUrl('/about'), lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: absoluteUrl('/blog'), lastModified: now, changeFrequency: 'weekly', priority: 0.5 },
    { url: absoluteUrl('/contact'), lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];

  const typePages: MetadataRoute.Sitemap = EVENT_TYPES.map((t) => ({
    url: absoluteUrl(`/${t.slug}`),
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.7,
  }));

  const cityPages: MetadataRoute.Sitemap = cities.map((c) => ({
    url: absoluteUrl(`/cities/${c.slug}`),
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.6,
  }));

  const eventPages: MetadataRoute.Sitemap = events.map((e) => ({
    url: absoluteUrl(`/events/${eventSlug(e)}`),
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
    images: e.image ? [e.image] : undefined,
  }));

  return [...staticPages, ...typePages, ...cityPages, ...eventPages];
}

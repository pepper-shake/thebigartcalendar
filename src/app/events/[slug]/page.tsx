import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PageShell from '@/components/seo/PageShell';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import EventDetail from '@/components/seo/EventDetail';
import JsonLd from '@/components/seo/JsonLd';
import { getEventBySlug } from '@/lib/events';
import { eventJsonLd } from '@/lib/jsonld';
import { typeMeta } from '@/lib/eventTypes';
import { absoluteUrl, SITE_NAME } from '@/lib/site';
import { formatDateRange } from '@/lib/format';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return { title: 'Event not found' };

  const description = event.description
    ? event.description.replace(/\s+/g, ' ').trim().slice(0, 155)
    : `${typeMeta(event.type).label} in ${event.city || 'Europe'} — ${formatDateRange(event)}.`;
  const url = absoluteUrl(`/events/${slug}`);

  return {
    title: event.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      title: event.title,
      description,
      url,
      siteName: SITE_NAME,
      images: event.image ? [{ url: event.image }] : undefined,
    },
  };
}

export default async function EventPage({ params }: Params) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  const meta = typeMeta(event.type);

  return (
    <PageShell>
      <Breadcrumbs
        items={[
          { name: 'Calendar', href: '/' },
          { name: meta.plural, href: `/${meta.slug}` },
          { name: event.title, href: `/events/${slug}` },
        ]}
      />
      <EventDetail event={event} />
      <JsonLd data={eventJsonLd(event)} />
    </PageShell>
  );
}

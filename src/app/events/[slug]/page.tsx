import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PageShell from '@/components/seo/PageShell';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import EventDetail from '@/components/seo/EventDetail';
import { Band, EventRow, PAGE_INNER } from '@/components/layout/Band';
import JsonLd from '@/components/seo/JsonLd';
import { getEventBySlug, getCurrentEvents } from '@/lib/events';
import { eventJsonLd } from '@/lib/jsonld';
import { typeMeta } from '@/lib/eventTypes';
import { absoluteUrl, REGION, SITE_NAME } from '@/lib/site';
import { formatDateRange } from '@/lib/format';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return { title: 'Event not found' };

  const description = event.description
    ? event.description.replace(/\s+/g, ' ').trim().slice(0, 155)
    : `${typeMeta(event.type).label} in ${event.city || REGION} — ${formatDateRange(event)}.`;
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

  // Other upcoming events in the same city, for the "More events in …" band
  // (Figma 421:4930 shows one row of three).
  const related = event.city
    ? (await getCurrentEvents())
        .filter((e) => e.id !== event.id && e.city === event.city)
        .slice(0, 3)
    : [];

  // Figma "Event page" (421:4920), laid out like the place page: breadcrumb
  // 42px under the header, the cream event panel 16px below it, then the
  // "More events in …" band (cream, oxblood heading, the calendar's sand cards).
  return (
    <PageShell size="bleed">
      <div className={`${PAGE_INNER} pt-8 lg:pt-[48px] pb-4`}>
        <Breadcrumbs
          items={[
            { name: 'Calendar', href: '/calendar' },
            { name: meta.plural, href: `/${meta.slug}` },
            { name: event.title, href: `/events/${slug}` },
          ]}
          colors={{ trail: '#909090', current: '#5A1F2E' }}
          className="mb-6 lg:mb-[22px]"
        />
        <EventDetail event={event} />
      </div>

      {related.length > 0 && (
        <Band title={`More events in ${event.city}`} bg="var(--page)" fg="#5A1F2E">
          <EventRow events={related} />
        </Band>
      )}

      <JsonLd data={eventJsonLd(event)} />
    </PageShell>
  );
}

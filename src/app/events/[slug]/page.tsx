import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PageShell from '@/components/seo/PageShell';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import EventDetail from '@/components/seo/EventDetail';
import EventCard from '@/components/events/EventCard';
import JsonLd from '@/components/seo/JsonLd';
import { getEventBySlug, getCurrentEvents } from '@/lib/events';
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

  // Other upcoming events in the same city, for the "More events in …" strip.
  const related = event.city
    ? (await getCurrentEvents())
        .filter((e) => e.id !== event.id && e.city === event.city)
        .slice(0, 4)
    : [];

  return (
    <PageShell size="full">
      <Breadcrumbs
        items={[
          { name: 'Calendar', href: '/' },
          { name: meta.plural, href: `/${meta.slug}` },
          { name: event.title, href: `/events/${slug}` },
        ]}
      />
      <EventDetail event={event} />

      {related.length > 0 && (
        <section className="mt-12">
          <h2
            className="text-black"
            style={{
              fontFamily: 'var(--font-host-grotesk)',
              fontWeight: 600,
              fontSize: 28,
              lineHeight: '32px',
              letterSpacing: '-0.02em',
            }}
          >
            More events in {event.city}
          </h2>
          {/* Mobile: horizontal scroll strip (cards peek the next one).
              Desktop: 4-up grid, matching the Figma "More events" row. */}
          <div className="mt-8 flex gap-6 overflow-x-auto pb-2 [scrollbar-width:none] lg:grid lg:grid-cols-4 lg:gap-x-6 lg:gap-y-8 lg:overflow-visible lg:pb-0">
            {related.map((e) => (
              <div key={e.id} className="w-[300px] shrink-0 lg:w-auto">
                <EventCard event={e} />
              </div>
            ))}
          </div>
        </section>
      )}

      <JsonLd data={eventJsonLd(event)} />
    </PageShell>
  );
}

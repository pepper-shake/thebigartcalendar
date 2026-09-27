import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PageShell from '@/components/seo/PageShell';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import JsonLd from '@/components/seo/JsonLd';
import EventCard from '@/components/events/EventCard';
import PlaceDetail from '@/components/places/PlaceDetail';
import { getPlaceBySlug, categoryLabel } from '@/lib/places';
import { placeJsonLd } from '@/lib/jsonld';
import { absoluteUrl, SITE_NAME } from '@/lib/site';
import { type ArtEvent } from '@/types';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const found = await getPlaceBySlug(slug);
  if (!found) return { title: 'Place not found' };
  const { place, upcoming } = found;

  const where = [place.city, place.country].filter(Boolean).join(', ');
  const title = where ? `${place.name}, ${place.city ?? place.country}` : place.name;
  const description = place.description
    ? place.description.replace(/\s+/g, ' ').trim().slice(0, 155)
    : `${categoryLabel(place.category)}${where ? ` in ${where}` : ''}${
        upcoming.length ? ` — ${upcoming.length} upcoming art event${upcoming.length === 1 ? '' : 's'}` : ''
      } on ${SITE_NAME}.`;
  const url = absoluteUrl(`/places/${slug}`);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      images: place.imageUrl ? [{ url: place.imageUrl }] : undefined,
    },
  };
}

function EventSection({ title, events }: { title: string; events: ArtEvent[] }) {
  if (events.length === 0) return null;
  return (
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
        {title}
      </h2>
      {/* Past events render grayscale + unlinked inside EventCard. */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-y-8">
        {events.map((e) => (
          <EventCard key={e.id} event={e} />
        ))}
      </div>
    </section>
  );
}

export default async function PlacePage({ params }: Params) {
  const { slug } = await params;
  const found = await getPlaceBySlug(slug);
  if (!found) notFound();
  const { place, upcoming, past } = found;

  return (
    <PageShell size="full">
      <Breadcrumbs
        items={[
          { name: 'Calendar', href: '/' },
          { name: 'Places', href: '/places' },
          { name: place.name, href: `/places/${slug}` },
        ]}
      />
      <PlaceDetail place={place} />
      <EventSection title={`Upcoming at ${place.name}`} events={upcoming} />
      <EventSection title="Past events" events={past.slice(0, 8)} />
      <JsonLd data={placeJsonLd(place, upcoming)} />
    </PageShell>
  );
}

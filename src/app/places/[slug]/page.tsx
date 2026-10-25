import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PageShell from '@/components/seo/PageShell';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import JsonLd from '@/components/seo/JsonLd';
import EventCard from '@/components/events/EventCard';
import PlaceDetail from '@/components/places/PlaceDetail';
import InstagramPosts from '@/components/places/InstagramPosts';
import { placeInstagramPosts } from '@/lib/place-instagram-posts';
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

// Figma "Place page" (310:1933): the place panel on the page background, then
// full-width colour bands — "Upcoming events" (sage, tomato heading) and the
// place's Instagram posts (wine, pink heading). Content is centred at
// the calendar's 1440px with 42px gutters on desktop.
const INNER = 'mx-auto w-full max-w-[1440px] px-6 lg:px-[42px]';

// Band colours are fixed from Figma, the same on every place page.
const UPCOMING_BAND = { bg: '#D4D5C7', fg: '#EB4A38' }; // sage / tomato (310:1974)
const INSTAGRAM_BAND = { bg: '#5A1F2E', fg: '#ED87AF' }; // wine / pink (310:2023)

// Per-place tweaks to the "Upcoming events" band, keyed by slug (operator's
// call, 2026-10-25). Disco Wheel runs dozens of identical workshop dates, all
// with the same studio photo as the panel above: show the next 6, text-only.
// Every other place shows all upcoming events with photos.
const UPCOMING_OVERRIDES: Record<string, { textOnly?: boolean; max?: number }> = {
  'disco-wheel': { textOnly: true, max: 6 },
};

function Band({
  title,
  bg,
  fg,
  children,
}: {
  title: React.ReactNode;
  bg: string;
  fg: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ backgroundColor: bg }}>
      <div className={`${INNER} flex flex-col gap-8 py-12 lg:py-[70px]`}>
        <h2
          className="text-[28px] leading-[32px] lg:text-[36px] lg:leading-[36px]"
          style={{ color: fg, fontFamily: 'var(--font-serif)', fontWeight: 300, letterSpacing: '-0.01em' }}
        >
          {title}
        </h2>
        {children}
      </div>
    </section>
  );
}

/** Mobile: horizontal scroll strip (cards peek the next one). Desktop: 3-up grid. */
function EventRow({ events, hideImages = false }: { events: ArtEvent[]; hideImages?: boolean }) {
  return (
    <div className="-mx-6 flex gap-4 overflow-x-auto px-6 pb-2 [scrollbar-width:none] lg:mx-0 lg:grid lg:grid-cols-3 lg:overflow-visible lg:px-0 lg:pb-0">
      {events.map((e) => (
        <div key={e.id} className="w-[300px] shrink-0 lg:w-auto">
          <EventCard event={e} hideImage={hideImages} />
        </div>
      ))}
    </div>
  );
}

export default async function PlacePage({ params }: Params) {
  const { slug } = await params;
  const found = await getPlaceBySlug(slug);
  if (!found) notFound();
  const { place, upcoming } = found;
  const igPosts = placeInstagramPosts(place.id);
  const igTitle = `${place.name} on Instagram`;
  const upcomingOverride = UPCOMING_OVERRIDES[slug] ?? {};

  return (
    <PageShell size="bleed">
      <div className={`${INNER} pt-8 pb-12 lg:pb-[62px]`}>
        <Breadcrumbs
          items={[
            { name: 'Calendar', href: '/' },
            { name: 'Places', href: '/places' },
            { name: place.name, href: `/places/${slug}` },
          ]}
        />
        <PlaceDetail place={place} />
      </div>

      {upcoming.length > 0 && (
        <Band title="Upcoming events" {...UPCOMING_BAND}>
          <EventRow
            events={upcomingOverride.max ? upcoming.slice(0, upcomingOverride.max) : upcoming}
            hideImages={upcomingOverride.textOnly}
          />
        </Band>
      )}

      {igPosts.length > 0 && (
        <Band
          title={
            place.instagramUrl ? (
              <a href={place.instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:underline underline-offset-4">
                {igTitle}
              </a>
            ) : (
              igTitle
            )
          }
          {...INSTAGRAM_BAND}
        >
          <InstagramPosts posts={igPosts} />
        </Band>
      )}

      <JsonLd data={placeJsonLd(place, upcoming)} />
    </PageShell>
  );
}

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PageShell from '@/components/seo/PageShell';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import JsonLd from '@/components/seo/JsonLd';
import { Band, EventRow, PAGE_INNER } from '@/components/layout/Band';
import PlaceDetail from '@/components/places/PlaceDetail';
import InstagramPosts from '@/components/places/InstagramPosts';
import { placeInstagramPosts } from '@/lib/place-instagram-posts';
import { getPlaceBySlug, categoryLabel } from '@/lib/places';
import { placeJsonLd } from '@/lib/jsonld';
import { absoluteUrl, SITE_NAME } from '@/lib/site';

export const revalidate = 3600;

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

// Figma "Place page" (416:3836): breadcrumb and the place panel on the page
// background, then full-width bands — "Upcoming events" (cream, oxblood
// heading, the calendar's sand cards) and the place's Instagram posts
// (oxblood, blush heading).

// Band colours are fixed from Figma, the same on every place page.
const UPCOMING_BAND = { bg: 'var(--page)', fg: '#5A1F2E' }; // cream / oxblood (416:3848)
const INSTAGRAM_BAND = { bg: '#5A1F2E', fg: '#E4B6D1' }; // oxblood / blush (416:3841)

// Per-place tweaks to the "Upcoming events" band, keyed by slug (operator's
// call, 2026-10-25). Disco Wheel runs dozens of identical workshop dates, all
// with the same studio photo as the panel above: show the next 6, text-only.
// Every other place shows all upcoming events with photos.
const UPCOMING_OVERRIDES: Record<string, { textOnly?: boolean; max?: number }> = {
  'disco-wheel': { textOnly: true, max: 6 },
};

export default async function PlacePage({ params }: Params) {
  const { slug } = await params;
  const found = await getPlaceBySlug(slug);
  if (!found) notFound();
  const { place, upcoming } = found;
  const igPosts = placeInstagramPosts(place.id);
  const igTitle = `${place.name} in IG`;
  const upcomingOverride = UPCOMING_OVERRIDES[slug] ?? {};

  return (
    <PageShell size="bleed">
      {/* Figma: breadcrumb 42px under the header bar, the panel 16px below it. */}
      {/* With no band below, the panel keeps a band's worth of space above the footer. */}
      <div className={`${PAGE_INNER} pt-8 lg:pt-[48px] ${upcoming.length || igPosts.length ? 'pb-4' : 'pb-12 lg:pb-[50px]'}`}>
        <Breadcrumbs
          items={[
            { name: 'Calendar', href: '/calendar' },
            { name: 'Places', href: '/places' },
            { name: place.name, href: `/places/${slug}` },
          ]}
          colors={{ trail: '#909090', current: '#5A1F2E' }}
          className="mb-6 lg:mb-[22px]"
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

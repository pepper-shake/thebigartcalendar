import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PageShell from '@/components/seo/PageShell';
import PageHeading from '@/components/seo/PageHeading';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import EventList from '@/components/seo/EventList';
import JsonLd from '@/components/seo/JsonLd';
import { getEventsByCitySlug } from '@/lib/events';
import { itemListJsonLd } from '@/lib/jsonld';
import { absoluteUrl, SITE_NAME } from '@/lib/site';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ city: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { city: slug } = await params;
  const { city, events } = await getEventsByCitySlug(slug);
  if (!city) return { title: 'City not found' };

  const title = `Art events in ${city}`;
  const description = `${events.length} upcoming art event${
    events.length === 1 ? '' : 's'
  } in ${city} — exhibitions, fairs, workshops, and more on ${SITE_NAME}.`;
  const url = absoluteUrl(`/cities/${slug}`);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: SITE_NAME },
  };
}

export default async function CityPage({ params }: Params) {
  const { city: slug } = await params;
  const { city, events } = await getEventsByCitySlug(slug);
  if (!city) notFound();

  return (
    <PageShell wide>
      <Breadcrumbs
        items={[
          { name: 'Calendar', href: '/' },
          { name: 'Cities', href: '/cities' },
          { name: city, href: `/cities/${slug}` },
        ]}
      />
      <PageHeading sub={`Upcoming art events in ${city}.`}>Art events in {city}</PageHeading>
      <EventList events={events} />
      {events.length > 0 && <JsonLd data={itemListJsonLd(events)} />}
    </PageShell>
  );
}

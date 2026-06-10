import PageShell from '@/components/seo/PageShell';
import PageHeading from '@/components/seo/PageHeading';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import EventList from '@/components/seo/EventList';
import JsonLd from '@/components/seo/JsonLd';
import { getEventsByType } from '@/lib/events';
import { itemListJsonLd } from '@/lib/jsonld';
import { EventTypeMeta } from '@/lib/eventTypes';

// Shared body for the five type landing pages (/exhibitions, /workshops, …).
export default async function TypeLandingPage({ meta }: { meta: EventTypeMeta }) {
  const events = await getEventsByType(meta.type);

  return (
    <PageShell wide>
      <Breadcrumbs
        items={[
          { name: 'Calendar', href: '/' },
          { name: meta.plural, href: `/${meta.slug}` },
        ]}
      />
      <PageHeading sub={meta.blurb}>{meta.plural}</PageHeading>
      <EventList events={events} />
      {events.length > 0 && <JsonLd data={itemListJsonLd(events)} />}
    </PageShell>
  );
}

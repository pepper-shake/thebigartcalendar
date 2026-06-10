import { ArtEvent } from '@/types';
import { absoluteUrl, SITE_NAME, SITE_URL } from '@/lib/site';
import { eventSlug } from '@/lib/slug';

// schema.org JSON-LD builders. These power Google's event rich results and
// help LLM crawlers understand the content. Rendered via <JsonLd>.

// Most specific schema.org Event subtype per scraper type (falls back to Event).
const SCHEMA_TYPE: Record<string, string> = {
  gallery: 'ExhibitionEvent',
  fair: 'VisualArtsEvent',
  workshop: 'EducationEvent',
  performance: 'VisualArtsEvent',
  auction: 'Event',
};

function startDateTime(e: ArtEvent): string {
  return e.startTime ? `${e.date}T${e.startTime}` : e.date;
}

function endDateTime(e: ArtEvent): string | undefined {
  if (e.endDate && e.endTime) return `${e.endDate}T${e.endTime}`;
  if (e.endDate) return e.endDate;
  if (e.endTime) return `${e.date}T${e.endTime}`;
  return undefined;
}

function priceToOffer(price?: string): Record<string, unknown> {
  if (!price) return {};
  const trimmed = price.trim();
  if (/free/i.test(trimmed)) return { price: '0', priceCurrency: 'EUR' };
  const num = trimmed.replace(/[^0-9.]/g, '');
  if (!num) return {};
  const currency = trimmed.includes('£')
    ? 'GBP'
    : trimmed.includes('$')
      ? 'USD'
      : 'EUR';
  return { price: num, priceCurrency: currency };
}

export function eventJsonLd(event: ArtEvent): Record<string, unknown> {
  const url = absoluteUrl(`/events/${eventSlug(event)}`);
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': SCHEMA_TYPE[event.type] ?? 'Event',
    name: event.title,
    startDate: startDateTime(event),
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    url,
  };

  const end = endDateTime(event);
  if (end) data.endDate = end;
  if (event.description) data.description = event.description;
  if (event.image) data.image = [event.image];

  if (event.venue || event.city || event.address) {
    data.location = {
      '@type': 'Place',
      name: event.venue || event.city,
      address: {
        '@type': 'PostalAddress',
        streetAddress: event.address || undefined,
        addressLocality: event.city || undefined,
        addressCountry: event.country || undefined,
      },
    };
  }

  if (event.price || event.ticketsUrl) {
    data.offers = {
      '@type': 'Offer',
      url: event.ticketsUrl || url,
      availability: 'https://schema.org/InStock',
      ...priceToOffer(event.price),
    };
  }

  return data;
}

export function breadcrumbJsonLd(
  items: { name: string; url: string }[],
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

export function itemListJsonLd(events: ArtEvent[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: events.map((e, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: absoluteUrl(`/events/${eventSlug(e)}`),
      name: e.title,
    })),
  };
}

export function websiteJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
  };
}

export function organizationJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
  };
}

import type { ArtEvent } from '@/types';
import { getCurrentEvents, todayISO } from '@/lib/events';
import { selectEditorChoice } from '@/lib/editorPicks';
import { listPlaces, categoryLabel } from '@/lib/places';
import { EVENT_TYPES } from '@/lib/eventTypes';
import { formatDateShort } from '@/lib/format';
import { eventSlug } from '@/lib/slug';
import { SITE_DEFAULT_IMAGE } from '@/lib/organiser-images';

// Preview cards for the header's drop-down panels (Figma "Header" 415:2859):
// three per panel, built on the server in the root layout and passed to the
// client header as plain data. See docs/design/style.md → Layout.

export interface MenuCard {
  href: string;
  title: string;
  /** Small chip above the title: event type or place category. */
  chip?: string;
  /** Right of the chip: "3 upcoming events" on space cards. */
  aside?: string;
  /** Spaces and shops: a photo under the title. */
  image?: string;
  /** Grey meta lines under the title. */
  lines: string[];
}

export interface HeaderMenu {
  calendar: MenuCard[];
  thisMonth: MenuCard[];
  spaces: MenuCard[];
  shops: MenuCard[];
}

export const EMPTY_MENU: HeaderMenu = { calendar: [], thisMonth: [], spaces: [], shops: [] };

const COUNT = 3;

function placeLine(city?: string | null, country?: string | null): string {
  return [city, country].filter(Boolean).join(', ');
}

function eventCard(e: ArtEvent): MenuCard {
  return {
    href: `/events/${eventSlug(e)}`,
    title: e.title,
    chip: EVENT_TYPES.find((t) => t.type === e.type)?.label,
    lines: [
      placeLine(e.city, e.country) || 'Virtual',
      `${formatDateShort(e.date)}${e.startTime ? ` · ${e.startTime}` : ''}`,
    ],
  };
}

/** The next events to start (one date per title), the month's editor's picks,
 *  the busiest art places with a photo, and art shops (with a photo). */
export async function getHeaderMenu(): Promise<HeaderMenu> {
  const today = todayISO();
  const [current, places] = await Promise.all([getCurrentEvents(), listPlaces()]);

  const seen = new Set<string>();
  const upcoming = current
    .filter((e) => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date) || (a.startTime ?? '').localeCompare(b.startTime ?? ''))
    .filter((e) => !seen.has(e.title) && !!seen.add(e.title))
    .slice(0, COUNT);

  const busiest = [...places].sort(
    (a, b) => b.upcomingCount - a.upcomingCount || a.place.name.localeCompare(b.place.name),
  );
  const spaces = busiest.filter((p) => p.place.category !== 'shop' && p.place.imageUrl).slice(0, COUNT);
  // Shops with a photo first (Figma 415:3292); any without fall back to the site image.
  const shops = busiest
    .filter((p) => p.place.category === 'shop')
    .sort((a, b) => Number(!!b.place.imageUrl) - Number(!!a.place.imageUrl))
    .slice(0, COUNT);

  return {
    calendar: upcoming.map(eventCard),
    thisMonth: selectEditorChoice(current, today).events.slice(0, COUNT).map(eventCard),
    spaces: spaces.map(({ place, upcomingCount }) => ({
      href: `/places/${place.slug}`,
      title: place.name,
      chip: categoryLabel(place.category),
      aside: upcomingCount > 0 ? `${upcomingCount} upcoming event${upcomingCount === 1 ? '' : 's'}` : undefined,
      image: place.imageUrl ?? undefined,
      lines: [placeLine(place.city, place.country)].filter(Boolean),
    })),
    shops: shops.map(({ place }) => ({
      href: `/places/${place.slug}`,
      title: place.name,
      image: place.imageUrl ?? SITE_DEFAULT_IMAGE,
      lines: [placeLine(place.city, place.country)].filter(Boolean),
    })),
  };
}

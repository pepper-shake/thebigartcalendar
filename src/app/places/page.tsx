import type { Metadata } from 'next';
import Link from 'next/link';
import PageShell from '@/components/seo/PageShell';
import PageHeading from '@/components/seo/PageHeading';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import PlaceCard from '@/components/places/PlaceCard';
import { listPlaces, categoryLabel } from '@/lib/places';
import { citySlug } from '@/lib/slug';
import { absoluteUrl, SITE_NAME } from '@/lib/site';

export const dynamic = 'force-dynamic';

type Props = { searchParams: Promise<{ [key: string]: string | string[] | undefined }> };

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { city, category } = await searchParams;
  return {
    title: 'Art places across Europe',
    description: `Galleries, studios, museums and workshop spaces across Europe on ${SITE_NAME} — with their upcoming art events.`,
    // Filtered views are the same list narrowed down; keep one canonical URL.
    alternates: { canonical: absoluteUrl('/places') },
    robots: one(city) || one(category) ? { index: false, follow: true } : undefined,
  };
}

// Filter chip: a plain server-rendered link that sets/clears one query param.
function Chip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`rounded-full px-4 py-2 transition-colors ${
        active ? 'bg-black text-white' : 'bg-black/5 text-black hover:bg-black/10'
      }`}
      style={{ fontFamily: 'var(--font-oxygen)', fontSize: 15 }}
    >
      {children}
    </Link>
  );
}

export default async function PlacesPage({ searchParams }: Props) {
  const sp = await searchParams;
  const city = one(sp.city);
  const category = one(sp.category);

  // Chips are built from the unfiltered list so every option stays reachable.
  const all = await listPlaces();
  const shown = await listPlaces({ city, category });

  const cities = [...new Map(all.filter((s) => s.place.city).map((s) => [citySlug(s.place.city!), s.place.city!])).entries()].sort(
    (a, b) => a[1].localeCompare(b[1]),
  );
  const categories = [...new Set(all.map((s) => s.place.category ?? 'other'))].sort();

  const href = (next: { city?: string; category?: string }) => {
    const q = new URLSearchParams();
    if (next.city) q.set('city', next.city);
    if (next.category) q.set('category', next.category);
    const s = q.toString();
    return s ? `/places?${s}` : '/places';
  };

  return (
    <PageShell wide>
      <Breadcrumbs
        items={[
          { name: 'Calendar', href: '/' },
          { name: 'Places', href: '/places' },
        ]}
      />
      <PageHeading sub="Galleries, studios, museums and workshop spaces — go straight to the place.">
        Art places
      </PageHeading>

      {all.length > 0 && (
        <div className="mb-10 flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            <Chip href={href({ category })} active={!city}>
              All cities
            </Chip>
            {cities.map(([slug, name]) => (
              <Chip key={slug} href={href({ city: slug, category })} active={city === slug}>
                {name}
              </Chip>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Chip href={href({ city })} active={!category}>
              All kinds
            </Chip>
            {categories.map((c) => (
              <Chip key={c} href={href({ city, category: c })} active={category === c}>
                {categoryLabel(c)}
              </Chip>
            ))}
          </div>
        </div>
      )}

      {shown.length === 0 ? (
        <p
          className="text-black/40"
          style={{ fontFamily: 'var(--font-oxygen)', fontWeight: 300, fontSize: 18 }}
        >
          No places here yet — check back soon.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((s) => (
            <li key={s.place.id}>
              <PlaceCard place={s.place} upcomingCount={s.upcomingCount} />
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  );
}

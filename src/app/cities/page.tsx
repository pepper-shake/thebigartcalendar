import type { Metadata } from 'next';
import Link from 'next/link';
import PageShell from '@/components/seo/PageShell';
import PageHeading from '@/components/seo/PageHeading';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import { listCities } from '@/lib/events';
import { absoluteUrl, SITE_NAME } from '@/lib/site';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Art events by city',
  description: `Browse art events across European cities on ${SITE_NAME} — exhibitions, fairs, workshops, performances, and auctions near you.`,
  alternates: { canonical: absoluteUrl('/cities') },
};

export default async function CitiesPage() {
  const cities = await listCities();

  return (
    <PageShell wide>
      <Breadcrumbs
        items={[
          { name: 'Calendar', href: '/' },
          { name: 'Cities', href: '/cities' },
        ]}
      />
      <PageHeading sub="Find art events in cities across Europe.">Browse by city</PageHeading>

      {cities.length === 0 ? (
        <p
          className="text-black/40"
          style={{ fontFamily: 'var(--font-oxygen)', fontWeight: 300, fontSize: 18 }}
        >
          No cities with upcoming events yet — check back soon.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {cities.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/cities/${c.slug}`}
                className="flex items-baseline justify-between gap-2 rounded-xl bg-black/5 px-4 py-3 hover:bg-black/10 transition-colors"
              >
                <span
                  className="text-black"
                  style={{ fontFamily: 'var(--font-host-grotesk)', fontWeight: 600, fontSize: 18 }}
                >
                  {c.name}
                </span>
                <span
                  className="text-black/40"
                  style={{ fontFamily: 'var(--font-oxygen)', fontSize: 14 }}
                >
                  {c.count}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </PageShell>
  );
}

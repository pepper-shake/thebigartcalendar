import type { Metadata } from 'next';
import TypeLandingPage from '@/components/seo/TypeLandingPage';
import { requireTypeBySlug } from '@/lib/eventTypes';
import { absoluteUrl, SITE_NAME } from '@/lib/site';

export const dynamic = 'force-dynamic';

const meta = requireTypeBySlug('art-fairs');

export const metadata: Metadata = {
  title: `${meta.plural} in Europe`,
  description: `${meta.blurb} Browse upcoming ${meta.plural.toLowerCase()} on ${SITE_NAME}.`,
  alternates: { canonical: absoluteUrl(`/${meta.slug}`) },
  openGraph: {
    title: `${meta.plural} in Europe`,
    description: meta.blurb,
    url: absoluteUrl(`/${meta.slug}`),
    siteName: SITE_NAME,
  },
};

export default function Page() {
  return <TypeLandingPage meta={meta} />;
}

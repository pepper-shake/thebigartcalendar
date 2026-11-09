import type { Metadata } from 'next';
import Link from 'next/link';
import { getCurrentEvents, listActiveTypes, todayISO } from '@/lib/events';
import { selectEditorChoice } from '@/lib/editorPicks';
import { selectWhatsNew } from '@/lib/whatsNew';
import { BLOG_POSTS } from '@/lib/blogPosts';
import { itemListJsonLd } from '@/lib/jsonld';
import EditorChoice from '@/components/home/EditorChoice';
import NewsletterSignup from '@/components/home/NewsletterSignup';
import WhatsNew from '@/components/home/WhatsNew';
import s from '@/components/home/Home.module.css';
import JsonLd from '@/components/seo/JsonLd';
import SiteFooter from '@/components/layout/SiteFooter';
import { SITE_NAME, SITE_DESCRIPTION, SITE_TAGLINE, absoluteUrl } from '@/lib/site';

// Regenerated at most every 10 minutes instead of on every visit: the homepage
// gets the most traffic, and per-request DB reads are what eat Neon's compute
// allowance. New scrapes and curation edits still show up within 10 minutes.
export const revalidate = 600;

export const metadata: Metadata = {
  title: { absolute: `${SITE_NAME} — ${SITE_TAGLINE}` },
  description: SITE_DESCRIPTION,
  alternates: { canonical: absoluteUrl('/') },
  openGraph: { url: absoluteUrl('/') },
};

export default async function HomePage() {
  const today = todayISO();
  const [current, activeTypes] = await Promise.all([getCurrentEvents(), listActiveTypes()]);
  const { events, curated } = selectEditorChoice(current, today);
  const whatsNew = selectWhatsNew(current, BLOG_POSTS, events, today);

  return (
    <div className={`${s.home} min-h-full flex flex-col`} style={{ backgroundColor: 'var(--page)' }}>
      <main className="flex-1">
        {/* Figma "Home page": the intro line is the page's h1, light italic serif. */}
        <div className={`${s.wrap} ${s.hero}`}>
          <h1 className="text-ink">
            Hey, we&rsquo;re Big Art Calendar! We promote art and culture by sharing inspiring upcoming creative
            workshops.
          </h1>
        </div>

        <EditorChoice events={events} curated={curated} month={Number(today.slice(5, 7))} activeTypes={activeTypes} />

        <div className={s.wrap}>
          <Link href="/calendar" className={`${s.more} text-ink`}>
            See the full calendar →
          </Link>
        </div>

        <NewsletterSignup />

        <WhatsNew items={whatsNew} />
      </main>
      <SiteFooter flush />
      {events.length > 0 && <JsonLd data={itemListJsonLd(events)} />}
    </div>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { EventImage } from '@/components/events/EventImage';
import { REGION } from '@/lib/site';
import type { HeaderMenu, MenuCard } from '@/lib/headerMenu';

// The site header on every page except blog landings (Figma "Header" component
// 415:2859): a fixed cream bar with oxblood text — one-line wordmark, Geist
// links and the "Where art happens" button. Hovering or focusing Calendar,
// This month, Spaces or Shops (from xl) drops a panel under the bar: a short
// blurb, a "See all" link and three preview cards (data from the root layout,
// src/lib/headerMenu.ts). On the homepage (`overHero`) the header starts as
// an oxblood gradient with cream text over the hero photo (Figma 417:4438) and turns into the bar once
// the page scrolls or a panel opens; everywhere else it is the bar from the
// start, with a spacer holding its place. Styles: `.site-header` in globals.css.

type PanelKey = keyof HeaderMenu;

const LINKS: { label: string; href: string; panel?: PanelKey }[] = [
  { label: 'Calendar', href: '/calendar', panel: 'calendar' },
  // The homepage's editor's choice band for the current month.
  { label: 'This month', href: '/#this-month', panel: 'thisMonth' },
  { label: 'Spaces', href: '/places', panel: 'spaces' },
  { label: 'Shops', href: '/places?category=shop', panel: 'shops' },
  { label: 'Blog', href: '/blog' },
  { label: 'About', href: '/about' },
];

const PANELS: Record<PanelKey, { label: string; blurb: string; more: string; moreHref: string }> = {
  calendar: {
    label: 'Upcoming events',
    blurb: `Browse every upcoming art event in ${REGION} by date: exhibitions, openings, workshops, art fairs, talks and performances in Lisbon, Porto and beyond.`,
    more: 'See all events',
    moreHref: '/calendar',
  },
  thisMonth: {
    label: 'This month’s picks',
    blurb: `The best art events in ${REGION} this month, hand-picked by our editors: must-see exhibitions, openings and workshops worth planning your weekend around.`,
    more: 'See all events',
    moreHref: '/calendar',
  },
  spaces: {
    label: 'Art spaces',
    blurb: `Find galleries, artist studios, cafés and shops across ${REGION} that host art workshops, meetups and creative events, and see what’s coming up at each one.`,
    more: 'See all spaces',
    moreHref: '/places',
  },
  shops: {
    label: 'Art shops',
    blurb: `Discover creative shops in ${REGION} for beautiful sketchbooks and notebooks, art supplies, ceramics, and handmade pieces by local artists and makers.`,
    more: 'See all shops',
    moreHref: '/places?category=shop',
  },
};

// Scrolled this far, the homepage header gets its cream bar.
const THRESHOLD = 8;

function Card({ card }: { card: MenuCard }) {
  return (
    <Link href={card.href} className="site-header-card">
      {(card.chip || card.aside) && (
        <div className="site-header-card-type">
          {card.chip && <span className="site-header-card-chip">{card.chip}</span>}
          {card.aside && <span>{card.aside}</span>}
        </div>
      )}
      <p className="site-header-card-title">{card.title}</p>
      {card.image && (
        <EventImage candidates={[card.image]} alt="" loading="lazy" className="site-header-card-img" />
      )}
      {card.lines.length > 0 && (
        <div className="site-header-card-meta">
          {card.lines.map((l) => (
            <p key={l}>{l}</p>
          ))}
        </div>
      )}
    </Link>
  );
}

export default function SiteHeader({
  onOpenMenu,
  overHero = false,
  pathname,
  menu,
}: {
  onOpenMenu: () => void;
  overHero?: boolean;
  pathname: string;
  menu: HeaderMenu;
}) {
  const ref = useRef<HTMLElement>(null);
  // The open panel belongs to the page it was opened on, so navigating closes it.
  const [open, setOpen] = useState<{ key: PanelKey; path: string } | null>(null);
  const active = open && open.path === pathname ? open.key : null;
  const show = (key?: PanelKey) => setOpen(key ? { key, path: pathname } : null);

  // Written straight to the element, so scrolling never re-renders React.
  useEffect(() => {
    const header = ref.current;
    if (!header || !overHero) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      header.toggleAttribute('data-scrolled', window.scrollY > THRESHOLD);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update(); // a restored scroll position starts scrolled
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
    };
  }, [overHero]);

  return (
    <>
      <header
        ref={ref}
        className="site-header"
        data-scrolled={overHero ? undefined : ''}
        data-open={active ? '' : undefined}
        onMouseLeave={() => show()}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) show();
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') show();
        }}
      >
        <div className="site-header-row">
          <Link href="/" className="site-header-logo lowercase" onMouseEnter={() => show()}>
            the big art calendar.
          </Link>

          <nav aria-label="Main" className="site-header-nav hidden xl:flex">
            <ul>
              {LINKS.map((l) => (
                <li key={l.href} onMouseEnter={() => show(l.panel)}>
                  <Link
                    href={l.href}
                    onFocus={() => show(l.panel)}
                    data-active={l.panel && l.panel === active ? '' : undefined}
                    aria-controls={l.panel ? `header-panel-${l.panel}` : undefined}
                    aria-expanded={l.panel ? l.panel === active : undefined}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <Link
            href="/where-art-happens"
            aria-current={pathname === '/where-art-happens' ? 'page' : undefined}
            className="site-header-cta hidden xl:flex"
            onMouseEnter={() => show()}
          >
            Where art happens
          </Link>

          {/* Below xl the links don't fit: the "+" (tablet) / "Menu" (phone)
              button opens the full menu. */}
          <button
            onClick={onOpenMenu}
            aria-label="Open menu"
            className="ml-auto hidden md:flex xl:hidden items-center justify-center size-[54px] -mr-3"
          >
            <Plus className="size-8" strokeWidth={1.25} />
          </button>
          <button
            onClick={onOpenMenu}
            className="ml-auto md:hidden"
            style={{ fontFamily: 'var(--font-meta)', fontWeight: 300, fontSize: 18, lineHeight: '23px' }}
          >
            Menu
          </button>
        </div>

        {/* Panels stay in the HTML (hidden until opened), so their links are
            crawlable from every page. */}
        {(Object.keys(PANELS) as PanelKey[]).map((key) => {
          const p = PANELS[key];
          return (
            <section
              key={key}
              id={`header-panel-${key}`}
              aria-label={p.label}
              className="site-header-panel"
              hidden={active !== key}
            >
              <div className="site-header-panel-intro">
                <p>{p.blurb}</p>
                <Link href={p.moreHref} className="site-header-panel-more">
                  {p.more} →
                </Link>
              </div>
              <div className="site-header-panel-cards">
                {menu[key].map((card) => (
                  <Card key={card.href} card={card} />
                ))}
              </div>
            </section>
          );
        })}
      </header>
      {!overHero && <div aria-hidden className="site-header-spacer" />}
    </>
  );
}

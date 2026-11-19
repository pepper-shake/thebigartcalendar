'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';

// The site header on every page except blog landings (Figma "Calendar"
// 387:2619, "Home page" 387:2803 / 411:2361, "where art happens" 411:2479): a
// fixed cream bar with oxblood text — one-line wordmark, Geist links and the
// "Where art happens" button. On the homepage (`overHero`) it starts
// transparent with cream text over the hero photo and turns into the bar once
// the page scrolls; everywhere else it is the bar from the start, with a spacer
// holding its place. Styles: `.site-header` in globals.css.
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const noSubscribe = () => () => {};

function links(month: number) {
  return [
    { label: 'Art calendar', href: '/calendar' },
    // The homepage's editor's choice band for the current month.
    { label: `${MONTHS[month - 1]} events`, href: '/#this-month' },
    { label: 'Places', href: '/places' },
    { label: 'Shops', href: '/places?category=shop' },
    { label: 'Blog', href: '/blog' },
    { label: 'About', href: '/about' },
  ];
}

// Scrolled this far, the header gets its cream bar.
const THRESHOLD = 8;

export default function SiteHeader({
  onOpenMenu,
  overHero = false,
  pathname,
  month: serverMonth,
}: {
  onOpenMenu: () => void;
  overHero?: boolean;
  pathname: string;
  /** 1–12, from the server render; corrected to the visitor's clock on mount,
   *  since static pages can be built in an earlier month. */
  month: number;
}) {
  const ref = useRef<HTMLElement>(null);
  // The server's month while hydrating, then the visitor's.
  const month = useSyncExternalStore(
    noSubscribe,
    () => new Date().getMonth() + 1,
    () => serverMonth,
  );

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
      <header ref={ref} className="site-header" data-scrolled={overHero ? undefined : ''}>
        <Link href="/" className="site-header-logo lowercase">
          the big art calendar.
        </Link>

        <nav aria-label="Main" className="site-header-nav hidden xl:flex">
          <ul>
            {links(month).map((l) => (
              <li key={l.href}>
                <Link href={l.href}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <Link
          href="/where-art-happens"
          aria-current={pathname === '/where-art-happens' ? 'page' : undefined}
          className="site-header-cta hidden xl:flex"
        >
          Where art happens
        </Link>

        {/* Below xl the links don't fit: the "+" (tablet) / "Menu" (phone)
            button opens the full menu, as on the other pages. */}
        <button
          onClick={onOpenMenu}
          aria-label="Open menu"
          className="ml-auto hidden md:flex xl:hidden items-center justify-center size-[54px] -mr-3 hover:opacity-60 transition-opacity"
        >
          <Plus className="size-8" strokeWidth={1.25} />
        </button>
        <button
          onClick={onOpenMenu}
          className="ml-auto md:hidden hover:opacity-60 transition-opacity"
          style={{ fontFamily: 'var(--font-meta)', fontWeight: 300, fontSize: 18, lineHeight: '23px' }}
        >
          Menu
        </button>
      </header>
      {!overHero && <div aria-hidden className="site-header-spacer" />}
    </>
  );
}

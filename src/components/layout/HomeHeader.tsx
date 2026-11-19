'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';

// Figma "Home page" 387:2803 (at the top) → "Home page scroll" 411:2361: the
// homepage header lies over the hero photo in cream, then turns into a cream
// bar with oxblood text once the page scrolls. Pages without a hero ("Where
// art happens", 411:2479) pass `solid`: the bar from the start, plus a spacer
// for the fixed header. Styles: `.home-header` in globals.css.
const LINKS = [
  { label: 'Art calendar', href: '/calendar' },
  { label: 'This month’s events', href: '/#this-month' },
  { label: 'Places', href: '/places' },
  { label: 'Shops', href: '/places?category=shop' },
  { label: 'Blog', href: '/blog' },
  { label: 'About', href: '/about' },
];

// Scrolled this far, the header gets its cream bar.
const THRESHOLD = 8;

export default function HomeHeader({
  onOpenMenu,
  solid = false,
  pathname,
}: {
  onOpenMenu: () => void;
  solid?: boolean;
  pathname: string;
}) {
  const ref = useRef<HTMLElement>(null);

  // Written straight to the element, so scrolling never re-renders React.
  useEffect(() => {
    const header = ref.current;
    if (!header || solid) return;
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
  }, [solid]);

  return (
    <>
      <header ref={ref} className="home-header" data-scrolled={solid ? '' : undefined}>
        <Link href="/" className="home-header-logo lowercase">
          the big art calendar.
        </Link>

        <nav aria-label="Main" className="home-header-nav hidden xl:flex">
          <ul>
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <Link
          href="/where-art-happens"
          aria-current={pathname === '/where-art-happens' ? 'page' : undefined}
          className="home-header-cta hidden xl:flex"
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
      {solid && <div aria-hidden className="home-header-spacer" />}
    </>
  );
}

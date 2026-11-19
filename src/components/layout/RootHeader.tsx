'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import MenuPanel from './MenuPanel';
import SiteHeader from './SiteHeader';
import { isBlogLandingPath } from '@/lib/blogPosts';

export default function RootHeader({ hiddenHrefs = [], month }: { hiddenHrefs?: string[]; month: number }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  // Blog landings are standalone pages with their own wordmark; they keep only
  // the menu button (cream, top-right, scrolling away with the page): the "+"
  // from 768px (Figma "Application/plus" 355:2860), "Menu" on phones.
  if (isBlogLandingPath(pathname)) {
    return (
      <>
        <button
          onClick={() => setIsMenuOpen(true)}
          aria-label="Open menu"
          className="absolute z-30 right-3 top-3.5 hidden md:flex items-center justify-center size-[54px] hover:opacity-60 transition-opacity"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- 54px vector icon */}
          <img src="/blog/menu-plus.svg" alt="" width={54} height={54} />
        </button>
        {/* Phones (Figma "Mob" 370:3952): a cream "Menu" label, Geist Light 18. */}
        <button
          onClick={() => setIsMenuOpen(true)}
          className="absolute z-30 right-6 top-6 md:hidden text-[#f2efe4] hover:opacity-60 transition-opacity"
          style={{ fontFamily: 'var(--font-meta)', fontWeight: 300, fontSize: 18, lineHeight: '23px' }}
        >
          Menu
        </button>
        <MenuPanel isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} hiddenHrefs={hiddenHrefs} />
      </>
    );
  }

  // Every other page: the site header (SiteHeader), over the hero photo on
  // the homepage, a cream bar everywhere else.
  return (
    <>
      <SiteHeader onOpenMenu={() => setIsMenuOpen(true)} overHero={pathname === '/'} pathname={pathname} month={month} />
      <MenuPanel isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} hiddenHrefs={hiddenHrefs} />
    </>
  );
}

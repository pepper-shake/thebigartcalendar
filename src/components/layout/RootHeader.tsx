'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plus } from 'lucide-react';
import MenuPanel from './MenuPanel';

// Collapse once the content has scrolled this far.
const COLLAPSE_AT = 8;
// After collapsing, ignore "back at the top" for the length of the animation:
// shrinking the header gives the content more room, which can clamp its
// scrollTop to 0 and would otherwise re-expand the header straight away.
const LOCK_MS = 400;

/** The element whose vertical scroll an event inside `node` would move. */
function scrollerFor(node: EventTarget | null): Element {
  for (let el = node instanceof Element ? node : null; el; el = el.parentElement) {
    const { overflowY } = getComputedStyle(el);
    if ((overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight) return el;
  }
  return document.scrollingElement ?? document.documentElement;
}

/**
 * True once the visitor scrolls the page content down; false again when they
 * come back to the top. Follows both real scrolling (any vertical scroll
 * container, or the window on SEO pages) and the scroll gesture itself
 * (wheel / swipe), so it also works when everything fits on screen and there
 * is nothing to scroll — e.g. a day with a single row of cards.
 */
function useContentScrolled(): boolean {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // A new page starts at the top, so start expanded. (Adjusting state during
  // render on a prop change, instead of in an effect.)
  const [prevPath, setPrevPath] = useState(pathname);
  if (pathname !== prevPath) {
    setPrevPath(pathname);
    setScrolled(false);
  }

  useEffect(() => {
    let lockUntil = 0;
    let touchY: number | null = null;
    const collapse = () => {
      lockUntil = performance.now() + LOCK_MS;
      setScrolled(true);
    };
    const expandIfAtTop = (target: EventTarget | null) => {
      if (performance.now() >= lockUntil && scrollerFor(target).scrollTop <= 0) setScrolled(false);
    };

    const onScroll = (e: Event) => {
      const el = e.target === document ? document.scrollingElement : (e.target as Element | null);
      // Horizontal-only scrollers (month/day strips) don't count.
      if (!el || el.scrollHeight <= el.clientHeight) return;
      if (el.scrollTop > COLLAPSE_AT) collapse();
      else if (el.scrollTop <= 0) expandIfAtTop(el);
    };
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return; // sideways strip scroll
      if (e.deltaY > 0) collapse();
      else expandIfAtTop(e.target);
    };
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0]?.clientY ?? null;
    };
    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0]?.clientY;
      if (touchY === null || y === undefined) return;
      const dy = touchY - y; // > 0: finger moves up = content scrolls down
      if (dy > 12) collapse();
      else if (dy < -12) expandIfAtTop(e.target);
    };

    const opts = { capture: true, passive: true } as const;
    document.addEventListener('scroll', onScroll, opts);
    document.addEventListener('wheel', onWheel, opts);
    document.addEventListener('touchstart', onTouchStart, opts);
    document.addEventListener('touchmove', onTouchMove, opts);
    return () => {
      document.removeEventListener('scroll', onScroll, opts);
      document.removeEventListener('wheel', onWheel, opts);
      document.removeEventListener('touchstart', onTouchStart, opts);
      document.removeEventListener('touchmove', onTouchMove, opts);
    };
  }, []);

  return scrolled;
}

export default function RootHeader({ hiddenHrefs = [] }: { hiddenHrefs?: string[] }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const compact = useContentScrolled();

  return (
    <>
      {/* Wordmark shrinks between its two Figma states, staying on two
          lines — see .site-header in globals.css. */}
      <div className="site-header" data-compact={compact || undefined}>
        <Link href="/" className="site-logo text-ink lowercase">
          the big
          <br />
          art calendar.
        </Link>

        <button
          onClick={() => setIsMenuOpen(true)}
          aria-label="Open menu"
          className="absolute right-4 top-3 flex items-center justify-center size-[54px] text-ink hover:opacity-60 transition-opacity"
        >
          <Plus className="size-8" strokeWidth={1.25} />
        </button>
      </div>

      <MenuPanel isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} hiddenHrefs={hiddenHrefs} />
    </>
  );
}

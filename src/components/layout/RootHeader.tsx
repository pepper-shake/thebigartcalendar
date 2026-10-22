'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plus } from 'lucide-react';
import MenuPanel from './MenuPanel';

// Scroll distance over which the header goes from rest (0) to collapsed (1).
// Roughly what the header gives back, so the wordmark shrinks about 1:1 with
// the content moving under it.
const RANGE_DESKTOP = 120;
const RANGE_MOBILE = 72;

/** The element whose vertical scroll an event inside `node` would move. */
function scrollerFor(node: EventTarget | null): Element {
  for (let el = node instanceof Element ? node : null; el; el = el.parentElement) {
    const { overflowY } = getComputedStyle(el);
    if ((overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight) return el;
  }
  return document.scrollingElement ?? document.documentElement;
}

/**
 * Drives the header's `--collapse` (0–1) from the page's scroll position —
 * any vertical scroll container (the calendar's card list) or the window (SEO
 * pages). Written straight to the element's style each animation frame, so the
 * wordmark resizes continuously with the scroll and React doesn't re-render.
 * When nothing can scroll (every card fits on screen), a wheel/swipe snaps it
 * fully open or closed instead, with a short CSS ease (`data-snapping`).
 */
function useScrollCollapse(ref: React.RefObject<HTMLDivElement | null>) {
  const pathname = usePathname();

  useEffect(() => {
    const header = ref.current;
    if (!header) return;
    let frame = 0;
    let pending: number | null = null;
    let touchY: number | null = null;

    const write = (p: number, snap: boolean) => {
      if (snap) header.setAttribute('data-snapping', '');
      else header.removeAttribute('data-snapping');
      header.style.setProperty('--collapse', String(p));
    };
    const range = () => (window.innerWidth < 768 ? RANGE_MOBILE : RANGE_DESKTOP);
    const fromScroll = (el: Element) => {
      pending = Math.min(1, Math.max(0, el.scrollTop / range()));
      if (!frame) {
        frame = requestAnimationFrame(() => {
          frame = 0;
          if (pending !== null) write(pending, false);
        });
      }
    };
    const canScroll = (el: Element) => el.scrollHeight > el.clientHeight + 1;

    const onScroll = (e: Event) => {
      const el = e.target === document ? document.scrollingElement : (e.target as Element | null);
      // Horizontal-only scrollers (month/day strips) don't count.
      if (!el || !canScroll(el)) return;
      fromScroll(el);
    };
    const snapIfStatic = (target: EventTarget | null, down: boolean) => {
      const el = scrollerFor(target);
      if (canScroll(el)) return; // real scrolling drives it
      write(down ? 1 : 0, true);
    };
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return; // sideways strip scroll
      snapIfStatic(e.target, e.deltaY > 0);
    };
    const onTouchStart = (e: TouchEvent) => {
      touchY = e.touches[0]?.clientY ?? null;
    };
    const onTouchMove = (e: TouchEvent) => {
      const y = e.touches[0]?.clientY;
      if (touchY === null || y === undefined || Math.abs(touchY - y) < 12) return;
      snapIfStatic(e.target, touchY > y);
    };

    write(0, false); // a new page starts at the top
    const opts = { capture: true, passive: true } as const;
    document.addEventListener('scroll', onScroll, opts);
    document.addEventListener('wheel', onWheel, opts);
    document.addEventListener('touchstart', onTouchStart, opts);
    document.addEventListener('touchmove', onTouchMove, opts);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('scroll', onScroll, opts);
      document.removeEventListener('wheel', onWheel, opts);
      document.removeEventListener('touchstart', onTouchStart, opts);
      document.removeEventListener('touchmove', onTouchMove, opts);
    };
  }, [ref, pathname]);
}

export default function RootHeader({ hiddenHrefs = [] }: { hiddenHrefs?: string[] }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  useScrollCollapse(headerRef);

  return (
    <>
      {/* The wordmark shrinks continuously with the scroll, staying on two
          lines (desktop and mobile) — see .site-header in globals.css. */}
      <div ref={headerRef} className="site-header">
        <Link href="/" className="site-logo text-ink lowercase">
          the big
          <br />
          art calendar.
        </Link>

        {/* Desktop: "+" icon. Mobile (Figma 296:5212): a plain "Menu" label. */}
        <button
          onClick={() => setIsMenuOpen(true)}
          aria-label="Open menu"
          className="absolute right-4 top-3 hidden md:flex items-center justify-center size-[54px] text-ink hover:opacity-60 transition-opacity"
        >
          <Plus className="size-8" strokeWidth={1.25} />
        </button>
        <button
          onClick={() => setIsMenuOpen(true)}
          className="absolute right-6 top-6 md:hidden text-ink hover:opacity-60 transition-opacity"
          style={{ fontFamily: 'var(--font-meta)', fontWeight: 300, fontSize: 18, lineHeight: '23px' }}
        >
          Menu
        </button>
      </div>

      <MenuPanel isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} hiddenHrefs={hiddenHrefs} />
    </>
  );
}

'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Minus } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const NAV_LINKS = [
  { label: 'Calendar',     href: '/' },
  { label: 'Exhibitions',  href: '/exhibitions' },
  { label: 'Art Fairs',    href: '/art-fairs' },
  { label: 'Workshops',    href: '/workshops' },
  { label: 'Performances', href: '/performances' },
  { label: 'Auctions',     href: '/auctions' },
  { label: 'Cities',       href: '/cities' },
  { label: 'About',        href: '/about' },
  { label: 'Blog',         href: '/blog' },
  { label: 'Contact',      href: '/contact' },
];

const linkStyle = {
  fontFamily: 'var(--font-host-grotesk)',
  fontWeight: 800,
  fontSize: 32,
  lineHeight: '32px',
  letterSpacing: '-0.64px',
} as const;

export default function MenuPanel({ isOpen, onClose }: Props) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop — covers the rest of the screen, click to close */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 z-40 transition-opacity duration-300"
        style={{ opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? 'auto' : 'none' }}
      />

    <nav
      aria-label="Site navigation"
      aria-hidden={!isOpen}
      className={[
        'fixed top-0 right-0 h-screen bg-white z-50',
        'w-full md:w-[348px]',
        'flex flex-col items-end',
        'pl-8 pr-4 py-4',
        'transition-transform duration-300 ease-in-out',
        isOpen ? 'translate-x-0' : 'translate-x-full',
      ].join(' ')}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        aria-label="Close menu"
        className="flex items-center justify-center size-[54px] text-black hover:opacity-60 transition-opacity shrink-0"
      >
        <Minus className="size-7" strokeWidth={2} />
      </button>

      {/* Nav links */}
      <div
        className="flex flex-col items-end mt-8 w-full flex-1 min-h-0 overflow-y-auto"
        style={{ gap: 17 }}
      >
        {NAV_LINKS.map(({ label, href }) => (
          <Link
            key={label}
            href={href}
            onClick={onClose}
            tabIndex={isOpen ? undefined : -1}
            className="text-black hover:opacity-50 transition-opacity"
            style={linkStyle}
          >
            {label}
          </Link>
        ))}
      </div>
    </nav>
    </>
  );
}

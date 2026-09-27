'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import MenuPanel from './MenuPanel';

export default function RootHeader({ hiddenHrefs = [] }: { hiddenHrefs?: string[] }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <div className="flex-none flex items-start justify-between px-6 pt-[2vh] pb-[1vh]">
        <div className="mt-1 w-[54px]" />

        <Link
          href="/"
          className="text-center text-black lowercase"
          style={{
            fontFamily: 'var(--font-host-grotesk)',
            fontWeight: 800,
            fontSize: 'clamp(42px, 6.5vh, 82px)',
            lineHeight: 'clamp(38px, 6vh, 76px)',
            letterSpacing: '-2px',
          }}
        >
          the big<br />art calendar.
        </Link>

        <button
          onClick={() => setIsMenuOpen(true)}
          aria-label="Open menu"
          className="flex items-center justify-center size-[54px] text-black hover:opacity-60 transition-opacity -mt-1 -mr-2"
        >
          <Plus className="size-7" strokeWidth={2} />
        </button>
      </div>

      <MenuPanel isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} hiddenHrefs={hiddenHrefs} />
    </>
  );
}

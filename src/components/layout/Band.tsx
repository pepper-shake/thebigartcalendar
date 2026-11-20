import EventCard from '@/components/events/EventCard';
import { type ArtEvent } from '@/types';

// Full-width colour bands under a detail panel (Figma "Place page" 416:3836,
// "Event page" 421:4920). Content spans the window inside the 42px page
// gutters (24px on phones), lining up with the header at any width.
export const PAGE_INNER = 'w-full px-6 md:px-[42px]';

export function Band({
  title,
  bg,
  fg,
  children,
}: {
  title: React.ReactNode;
  bg: string;
  fg: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ backgroundColor: bg }}>
      <div className={`${PAGE_INNER} flex flex-col gap-8 py-12 lg:py-[50px]`}>
        {/* Figma 416:3989: Newsreader 300, 42/48, -0.84px. */}
        <h2
          className="text-[28px] leading-[32px] lg:text-[42px] lg:leading-[48px]"
          style={{ color: fg, fontFamily: 'var(--font-serif)', fontWeight: 300, letterSpacing: '-0.02em' }}
        >
          {title}
        </h2>
        {children}
      </div>
    </section>
  );
}

/** Mobile: horizontal scroll strip (cards peek the next one). Desktop: 3-up grid of the calendar's sand cards. */
export function EventRow({ events, hideImages = false }: { events: ArtEvent[]; hideImages?: boolean }) {
  return (
    <div className="-mx-6 flex gap-4 overflow-x-auto px-6 pb-2 [scrollbar-width:none] lg:mx-0 lg:grid lg:grid-cols-3 lg:overflow-visible lg:px-0 lg:pb-0">
      {events.map((e) => (
        <div key={e.id} className="w-[300px] shrink-0 lg:w-auto">
          <EventCard event={e} hideImage={hideImages} variant="calendar" />
        </div>
      ))}
    </div>
  );
}

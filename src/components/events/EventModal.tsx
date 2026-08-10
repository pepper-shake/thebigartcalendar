'use client';

import { useEffect, useState, useCallback } from 'react';
import { Minus, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { ArtEvent } from '@/types';
import { eventTypeColors } from '@/components/calendar/EventTypeBadge';
import { getCardColor, tint, hexToRgba } from '@/lib/eventColor';
import { formatDateShort } from '@/lib/format';
import { eventSlug } from '@/lib/slug';
import ViewerLocalTime from '@/components/events/ViewerLocalTime';

interface Props {
  event: ArtEvent | null;
  events?: ArtEvent[]; // ordered list for prev/next navigation
  onClose: () => void;
  onNavigate?: (e: ArtEvent) => void;
}

const metaStyle: React.CSSProperties = {
  fontFamily: 'var(--font-host-grotesk)',
  fontWeight: 400,
  fontSize: 16,
  lineHeight: '18px',
};

function placeLabel(e: ArtEvent): string {
  const parts = [e.city, e.country].filter(Boolean);
  return parts.length ? parts.join(', ') : 'Virtual';
}

export default function EventModal({ event, events = [], onClose, onNavigate }: Props) {
  // Track by id so like/copied reset automatically when the shown event changes.
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const index = event ? events.findIndex((e) => e.id === event.id) : -1;
  const prev = index > 0 ? events[index - 1] : null;
  const next = index >= 0 && index < events.length - 1 ? events[index + 1] : null;

  const go = useCallback(
    (e: ArtEvent | null) => {
      if (e && onNavigate) onNavigate(e);
    },
    [onNavigate],
  );

  useEffect(() => {
    if (!event) return;
    const handler = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') onClose();
      else if (ev.key === 'ArrowLeft' && prev) go(prev);
      else if (ev.key === 'ArrowRight' && next) go(next);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [event, onClose, prev, next, go]);

  useEffect(() => {
    if (!event) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [event]);

  if (!event) return null;

  const copied = copiedId === event.id;
  const cardColor = getCardColor(event.id);
  const bgColor = tint(cardColor, 0.8);
  // Header fades to transparent so scrolling content shows through beneath it.
  const headerGradient = `linear-gradient(to bottom, ${bgColor} 60%, ${hexToRgba(bgColor, 0)} 100%)`;
  const typeLabel = eventTypeColors[event.type]?.label ?? event.type;

  const eventUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/events/${eventSlug(event)}`
      : `/events/${eventSlug(event)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(eventUrl);
      setCopiedId(event.id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  const openInNewTab = () => {
    window.open(eventUrl, '_blank', 'noopener,noreferrer');
  };

  // ── Shared building blocks (rendered in both desktop and mobile layouts) ──
  const renderImage = (aspect: string) => (
    <div className="relative w-full overflow-hidden rounded-[24px]" style={{ aspectRatio: aspect }}>
      {event.image ? (
        <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full" style={{ backgroundColor: '#FBFAF6' }} />
      )}
      <span
        className="absolute left-4 bottom-4 inline-block"
        style={{
          backgroundColor: cardColor,
          color: '#000',
          fontFamily: 'var(--font-host-grotesk)',
          fontWeight: 400,
          fontSize: 14,
          lineHeight: '14px',
          padding: '8px 16px',
          borderRadius: 42,
        }}
      >
        {typeLabel} event
      </span>
    </div>
  );

  const titleEl = (
    <h2
      className="text-black"
      style={{
        fontFamily: 'var(--font-host-grotesk)',
        fontWeight: 600,
        fontSize: 36,
        lineHeight: '42px',
        letterSpacing: '-0.02em',
      }}
    >
      {event.title}
    </h2>
  );

  const metaLines = (withDate: boolean) => (
    <div className="flex flex-col" style={{ gap: 18 }}>
      <p className="text-black" style={metaStyle}>
        {placeLabel(event)}
        {withDate ? ` · ${formatDateShort(event.date)}` : ''}
      </p>
      {event.startTime && (
        <p className="text-black" style={metaStyle}>
          {event.startTime}
          {event.city ? ` ${event.city}` : ''}
          <ViewerLocalTime event={event} />
        </p>
      )}
      {event.price && (
        <p className="text-black" style={metaStyle}>
          Price: {event.price}
        </p>
      )}
    </div>
  );

  const aboutEl = (
    <div>
      <h3
        className="text-black"
        style={{ fontFamily: 'var(--font-host-grotesk)', fontWeight: 600, fontSize: 24, lineHeight: '32px' }}
      >
        About
      </h3>
      <p
        className="text-black mt-4 whitespace-pre-line"
        style={{ fontFamily: 'var(--font-host-grotesk)', fontWeight: 400, fontSize: 16, lineHeight: '26px' }}
      >
        {event.description}
      </p>
    </div>
  );

  const tagsEl =
    event.tags && event.tags.length > 0 ? (
      <div className="flex flex-wrap" style={{ gap: 8 }}>
        {event.tags.map((t) => (
          <span
            key={t}
            style={{
              backgroundColor: 'rgba(251,250,246,0.7)',
              color: '#000',
              fontFamily: 'var(--font-host-grotesk)',
              fontWeight: 400,
              fontSize: 14,
              lineHeight: '22px',
              padding: '8px 16px',
              borderRadius: 42,
            }}
          >
            #{t}
          </span>
        ))}
      </div>
    ) : null;

  const content = (
    <div className="fixed inset-0 z-50 flex items-stretch md:items-center justify-center p-0 md:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />

      {/* Desktop: floating side arrows */}
      {prev && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            go(prev);
          }}
          aria-label="Previous event"
          className="hidden md:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 w-[52px] h-[52px] rounded-full bg-white shadow-md items-center justify-center transition-transform hover:scale-105"
        >
          <ArrowLeft className="w-6 h-6 text-black" />
        </button>
      )}
      {next && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            go(next);
          }}
          aria-label="Next event"
          className="hidden md:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 w-[52px] h-[52px] rounded-full bg-white shadow-md items-center justify-center transition-transform hover:scale-105"
        >
          <ArrowRight className="w-6 h-6 text-black" />
        </button>
      )}

      {/* Modal */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 w-full md:max-w-[1123px] h-full md:h-auto md:max-h-[calc(100vh-32px)] overflow-y-auto md:overflow-hidden rounded-none md:rounded-[32px] md:flex md:flex-col"
        style={{ backgroundColor: bgColor }}
      >
        <div className="p-6 md:p-[42px] md:flex md:flex-col md:flex-1 md:min-h-0">
          {/* Header: actions + close. Pinned on both web (flex-none) and mobile
              (sticky), with a background so content scrolls under it. */}
          <div
            className="sticky top-0 z-20 flex items-center justify-between -mx-6 px-6 -mt-6 pt-[62px] pb-8 md:relative md:z-10 md:flex-none md:-mx-[42px] md:px-[42px] md:mt-0 md:pt-0 md:pb-0"
            style={{ background: headerGradient }}
          >
            <div className="flex items-center gap-3">
              <IconButton label="Copy link" onClick={handleCopy}>
                {copied ? <Check className="w-6 h-6 text-black" /> : <CopyIcon />}
              </IconButton>
              <IconButton label="Open event page in a new tab" onClick={openInNewTab}>
                <RedirectIcon />
              </IconButton>
            </div>
            <button onClick={onClose} aria-label="Close" className="w-[54px] h-[54px] flex items-center justify-center">
              <Minus className="w-8 h-8 text-black" strokeWidth={2} />
            </button>
          </div>

          {/* Mobile: date + prev/next slider */}
          <div className="md:hidden flex items-center justify-between mt-6">
            <NavButton label="Previous event" disabled={!prev} onClick={() => go(prev)}>
              <ArrowLeft className="w-4 h-4 text-black" />
            </NavButton>
            <span className="text-black" style={metaStyle}>
              {formatDateShort(event.date)}
            </span>
            <NavButton label="Next event" disabled={!next} onClick={() => go(next)}>
              <ArrowRight className="w-4 h-4 text-black" />
            </NavButton>
          </div>

          {/* Desktop layout: About (scrolls) | image + meta + tags. Spacing per
              Figma 199:1991 — 32px header→body, ~19px between right-column blocks,
              455px left column with 432px text (23px inset), 16px column gap. */}
          <div className="hidden md:flex md:flex-1 md:min-h-0 md:gap-4 mt-8">
            <div
              key={event.id}
              className="md:w-[455px] md:shrink-0 md:min-h-0 md:overflow-y-auto md:pr-[23px]"
            >
              {aboutEl}
            </div>
            <div className="md:flex-1 md:min-w-0 md:min-h-0 md:overflow-y-auto">
              {renderImage('568 / 438')}
              <div className="mt-5">{titleEl}</div>
              <div className="mt-5">{metaLines(true)}</div>
              {tagsEl && <div className="mt-5">{tagsEl}</div>}
            </div>
          </div>

          {/* Mobile layout: single column (image, meta, About, tags) */}
          <div className="md:hidden mt-6">
            {renderImage('382 / 284')}
            <div className="mt-5">{titleEl}</div>
            <div className="mt-4">{metaLines(false)}</div>
            <div className="mt-6">{aboutEl}</div>
            {tagsEl && <div className="mt-6">{tagsEl}</div>}
          </div>
        </div>
      </div>
    </div>
  );

  return content;
}

function IconButton({
  children,
  onClick,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="flex items-center justify-center rounded-[4px] p-[10px] transition-colors hover:brightness-95"
      style={{ backgroundColor: 'rgba(251,250,246,0.7)' }}
    >
      {children}
    </button>
  );
}

// Icons inlined from Figma (node 205:2747 copy, 202:2219 redirect), preserving
// the exact paths and positioning.
function CopyIcon() {
  return (
    <span className="relative block w-6 h-6" aria-hidden>
      <span className="absolute" style={{ inset: '19.79% 36.46% 36.46% 19.79%' }}>
        <span className="absolute" style={{ inset: '-9.52%' }}>
          <svg viewBox="0 0 12.5 12.5" fill="none" preserveAspectRatio="none" className="block w-full h-full">
            <path
              d="M2.75 11.5C1.7835 11.5 1 10.7165 1 9.75V3C1 1.89543 1.89543 1 3 1H9.75C10.7165 1 11.5 1.7835 11.5 2.75"
              stroke="black"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </span>
      <span className="absolute" style={{ inset: '36.46% 19.79% 19.79% 36.46%' }}>
        <span className="absolute" style={{ inset: '-9.52%' }}>
          <svg viewBox="0 0 12.5 12.5" fill="none" preserveAspectRatio="none" className="block w-full h-full">
            <path
              d="M9.5 1H3C1.89543 1 1 1.89543 1 3V9.5C1 10.6046 1.89543 11.5 3 11.5H9.5C10.6046 11.5 11.5 10.6046 11.5 9.5V3C11.5 1.89543 10.6046 1 9.5 1Z"
              stroke="black"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </span>
    </span>
  );
}

function RedirectIcon() {
  return (
    <span className="relative block w-6 h-6" aria-hidden>
      <span className="absolute" style={{ inset: '19.79%' }}>
        <span className="absolute" style={{ inset: '-6.9%' }}>
          <svg viewBox="0 0 16.5 16.5" fill="none" preserveAspectRatio="none" className="block w-full h-full">
            <path
              d="M5.5 1H3C1.89543 1 1 1.89543 1 3V13.5C1 14.6046 1.89543 15.5 3 15.5H13.5C14.6046 15.5 15.5 14.6046 15.5 13.5V11"
              stroke="black"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </span>
      <span className="absolute" style={{ inset: '19.79% 19.79% 61.46% 61.46%' }}>
        <span className="absolute" style={{ inset: '-22.22%' }}>
          <svg viewBox="0 0 6.5 6.5" fill="none" preserveAspectRatio="none" className="block w-full h-full">
            <path d="M5.5 5.5V1H1" stroke="black" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </span>
      <span className="absolute" style={{ inset: '20.83% 20.83% 48.96% 48.96%' }}>
        <span className="absolute" style={{ inset: '-13.79%' }}>
          <svg viewBox="0 0 9.25 9.25" fill="none" preserveAspectRatio="none" className="block w-full h-full">
            <path d="M8.25 1L1 8.25" stroke="black" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </span>
    </span>
  );
}

function NavButton({
  children,
  onClick,
  label,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  disabled: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="w-10 h-10 rounded-full bg-white flex items-center justify-center transition-opacity disabled:opacity-30"
    >
      {children}
    </button>
  );
}

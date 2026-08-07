'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Heart, Copy, Share2, Minus, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { ArtEvent } from '@/types';
import { eventTypeColors } from '@/components/calendar/EventTypeBadge';
import { getCardColor, tint } from '@/lib/eventColor';
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
  const [likedId, setLikedId] = useState<string | null>(null);
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

  // ── Make the modal behave like a page ──
  // While open, reflect the event's own URL so it is shareable and the back
  // button closes it. Next 16 integrates pushState/replaceState with its router.
  const returnUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!event) return;
    const url = `/events/${eventSlug(event)}`;
    if (returnUrlRef.current === null) {
      // Opening: remember where we came from, add one history entry.
      returnUrlRef.current = window.location.pathname + window.location.search + window.location.hash;
      window.history.pushState(null, '', url);
    } else {
      // Navigating between events: update in place, no new entry.
      window.history.replaceState(null, '', url);
    }
  }, [event]);

  useEffect(() => {
    // Closing (via button/Esc/backdrop): restore the original URL.
    if (event || returnUrlRef.current === null) return;
    window.history.replaceState(null, '', returnUrlRef.current);
    returnUrlRef.current = null;
  }, [event]);

  useEffect(() => {
    if (!event) return;
    const onPop = () => {
      // Back/forward already changed the URL; just close without re-restoring.
      returnUrlRef.current = null;
      onClose();
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [event, onClose]);

  if (!event || typeof document === 'undefined') return null;

  const liked = likedId === event.id;
  const copied = copiedId === event.id;
  const cardColor = getCardColor(event.id);
  const bgColor = tint(cardColor, 0.8);
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

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: event.title, url: eventUrl });
      } catch {
        /* share cancelled */
      }
    } else {
      handleCopy();
    }
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
        className="relative z-10 w-full md:max-w-[1123px] h-full md:h-auto md:max-h-[90vh] overflow-y-auto rounded-none md:rounded-[32px]"
        style={{ backgroundColor: bgColor }}
      >
        <div className="p-6 md:p-[42px]">
          {/* Header: actions + close */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <IconButton label={liked ? 'Unlike' : 'Like'} onClick={() => setLikedId(liked ? null : event.id)}>
                <Heart
                  className="w-6 h-6"
                  style={{ fill: liked ? '#e0245e' : 'transparent', color: liked ? '#e0245e' : '#000' }}
                />
              </IconButton>
              <IconButton label="Copy link" onClick={handleCopy}>
                {copied ? <Check className="w-6 h-6 text-black" /> : <Copy className="w-6 h-6 text-black" />}
              </IconButton>
              <IconButton label="Share" onClick={handleShare}>
                <Share2 className="w-6 h-6 text-black" />
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

          {/* Desktop layout: two columns (About | image + meta + tags) */}
          <div className="hidden md:flex md:gap-4 mt-8">
            <div className="md:w-[455px] md:shrink-0">{aboutEl}</div>
            <div className="md:flex-1 md:min-w-0">
              {renderImage('568 / 438')}
              <div className="mt-5">{titleEl}</div>
              <div className="mt-4">{metaLines(true)}</div>
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

  return createPortal(content, document.body);
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
      className="w-11 h-11 rounded-full flex items-center justify-center transition-colors hover:brightness-95"
      style={{ backgroundColor: 'rgba(255,255,255,0.7)' }}
    >
      {children}
    </button>
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

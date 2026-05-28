'use client';

import { ArtEvent } from '@/types';

const CARD_COLORS = ['#E06927', '#EFCEEE', '#C8CC17', '#BFDBD8'];

/** Deterministic color from event id — same event always gets same color */
function getCardColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) & 0xffffffff;
  }
  return CARD_COLORS[Math.abs(hash) % CARD_COLORS.length];
}

interface Props {
  event: ArtEvent;
  onClick: (e: ArtEvent) => void;
}

export default function EventCard({ event, onClick }: Props) {
  const bgColor = getCardColor(event.id);

  return (
    <button
      onClick={() => onClick(event)}
      className="text-left flex-none"
      style={{ width: 346, height: 460 }}
    >
      <div
        className="w-full h-full flex flex-col"
        style={{
          backgroundColor: bgColor,
          borderRadius: 24,
          padding: 24,
          gap: 16,
        }}
      >
        {/* Title */}
        <h3
          className="text-black line-clamp-2 flex-none"
          style={{
            fontFamily: 'var(--font-host-grotesk)',
            fontWeight: 600,
            fontSize: 32,
            lineHeight: '36px',
            letterSpacing: '-0.02em',
          }}
        >
          {event.title}
        </h3>

        {/* Image */}
        <div
          className="flex-none overflow-hidden"
          style={{ height: 196, borderRadius: 12 }}
        >
          {event.image ? (
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-black/10" />
          )}
        </div>

        {/* Description */}
        <p
          className="flex-1 overflow-hidden text-black"
          style={{
            fontFamily: 'var(--font-oxygen)',
            fontWeight: 300,
            fontSize: 16,
            lineHeight: '24px',
            display: '-webkit-box',
            WebkitLineClamp: 4,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {event.description}
        </p>

        {/* Details link */}
        <span
          className="flex-none text-black underline-offset-2 hover:underline"
          style={{
            fontFamily: 'var(--font-host-grotesk)',
            fontWeight: 600,
            fontSize: 18,
            lineHeight: '24px',
          }}
        >
          Details
        </span>
      </div>
    </button>
  );
}

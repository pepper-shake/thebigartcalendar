'use client';

import Link from 'next/link';
import { ArtEvent } from '@/types';
import { EventTypeBadge } from '@/components/calendar/EventTypeBadge';
import { eventSlug } from '@/lib/slug';
import { useEffect } from 'react';

interface Props {
  event: ArtEvent | null;
  onClose: () => void;
}

export default function EventModal({ event, onClose }: Props) {
  useEffect(() => {
    if (!event) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [event, onClose]);

  if (!event) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white border border-zinc-200 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image header */}
        {event.image && (
          <div className="relative h-56 overflow-hidden rounded-t-2xl">
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-4 left-5 right-5">
              <div className="mb-2">
                <EventTypeBadge type={event.type} size="md" />
              </div>
              <h2 className="text-white text-2xl font-bold leading-tight">{event.title}</h2>
            </div>
          </div>
        )}

        {/* Body */}
        <div className="p-6 space-y-6">
          {!event.image && (
            <div>
              <div className="mb-2">
                <EventTypeBadge type={event.type} size="md" />
              </div>
              <h2 className="text-zinc-900 text-2xl font-bold">{event.title}</h2>
            </div>
          )}

          {/* Meta row */}
          <div className="grid grid-cols-2 gap-4">
            <MetaItem
              icon={
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              }
              label="Date"
              value={formatDate(event.date)}
            />
            <MetaItem
              icon={
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              }
              label="Time"
              value={`${event.startTime}${event.endTime ? ` – ${event.endTime}` : ''}`}
            />
            <MetaItem
              icon={
                <>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </>
              }
              label="Venue"
              value={event.venue}
            />
            <MetaItem
              icon={
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
              }
              label="Location"
              value={`${event.city}, ${event.country}`}
            />
          </div>

          {/* Description */}
          <div>
            <SectionTitle>About</SectionTitle>
            <p className="text-zinc-600 text-sm leading-relaxed">{event.description}</p>
          </div>

          {/* Participants */}
          {event.participants && event.participants.length > 0 && (
            <div>
              <SectionTitle>Participants</SectionTitle>
              <div className="flex flex-wrap gap-2">
                {event.participants.map((p) => (
                  <span
                    key={p}
                    className="text-xs text-zinc-700 bg-zinc-100 border border-zinc-200 rounded-full px-3 py-1"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Agenda */}
          {event.agenda && event.agenda.length > 0 && (
            <div>
              <SectionTitle>Programme</SectionTitle>
              <div className="space-y-2">
                {event.agenda.map((item, i) => (
                  <div key={i} className="flex gap-3 text-sm">
                    <span className="text-zinc-400 font-mono w-12 shrink-0 pt-px">{item.time}</span>
                    <span className="text-zinc-700">{item.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {event.tags.map((t) => (
                <span key={t} className="text-[11px] text-zinc-500 bg-zinc-100 rounded px-2 py-0.5">
                  #{t}
                </span>
              ))}
            </div>
          )}

          {/* Full event page link */}
          <div>
            <Link
              href={`/events/${eventSlug(event)}`}
              className="inline-flex items-center gap-1 text-sm font-medium text-zinc-700 underline underline-offset-2 hover:text-zinc-900"
            >
              View full event page →
            </Link>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
            <div className="text-zinc-500 text-sm">
              {event.price ? (
                <span className="font-semibold text-zinc-900">{event.price}</span>
              ) : (
                'Free entry'
              )}
              {event.address && (
                <span className="ml-2 text-zinc-400">· {event.address}</span>
              )}
            </div>
            {event.ticketsUrl && event.ticketsUrl !== '#' && (
              <a
                href={event.ticketsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium bg-zinc-900 text-white rounded-full px-4 py-1.5 hover:bg-zinc-700 transition-colors"
              >
                Get Tickets
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-sm text-white hover:bg-black/30 transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-2">
      {children}
    </h3>
  );
}

function MetaItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-2.5 items-start">
      <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0">
        <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {icon}
        </svg>
      </div>
      <div>
        <p className="text-zinc-400 text-xs">{label}</p>
        <p className="text-zinc-800 text-sm font-medium leading-tight">{value}</p>
      </div>
    </div>
  );
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import type { CardScheme } from '@/lib/eventColor';

// Two icon buttons shown in the event card header (Figma node 249:1566):
//  • Copy   — translucent cream square, black icon; copies this event's
//             canonical calendar URL to the clipboard.
//  • Source — solid black square, white icon; opens the event's original
//             source page in a new tab.
// Both: 44px square (24px icon + 10px padding), square corners, 12px gap.
// Colours follow the event's card scheme (Figma 287:4576): copy sits on the
// scheme's chip wash, source is a solid block of the scheme foreground.
// The icons are the exact Figma vectors (nodes 249:1570 / 249:1568), inlined at
// 24×24 with `currentColor` so the button's text color drives the icon color.

const buttonClass =
  'inline-flex items-center justify-center p-[10px] transition-opacity hover:opacity-70 focus:outline-none';

/** Figma "copy" icon (249:1570) — two overlapping rounded squares. */
function CopyIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path
        strokeWidth="2"
        transform="translate(3.75 3.75)"
        d="M2.75 11.5C1.7835 11.5 1 10.7165 1 9.75V3C1 1.89543 1.89543 1 3 1H9.75C10.7165 1 11.5 1.7835 11.5 2.75"
      />
      <path
        strokeWidth="2"
        transform="translate(7.75 7.75)"
        d="M9.5 1H3C1.89543 1 1 1.89543 1 3V9.5C1 10.6046 1.89543 11.5 3 11.5H9.5C10.6046 11.5 11.5 10.6046 11.5 9.5V3C11.5 1.89543 10.6046 1 9.5 1Z"
      />
    </svg>
  );
}

/** Figma "share" icon (249:1568) — a box with an arrow leaving its top-right. */
function ShareIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path
        strokeWidth="2"
        transform="translate(3.75 3.75)"
        d="M5.5 1H3C1.89543 1 1 1.89543 1 3V13.5C1 14.6046 1.89543 15.5 3 15.5H13.5C14.6046 15.5 15.5 14.6046 15.5 13.5V11"
      />
      <path strokeWidth="1.5" transform="translate(14 4)" d="M5.25 5.25V0.75H0.75" />
      <path strokeWidth="1.5" transform="translate(11 4.25)" d="M8 0.75L0.75 8" />
    </svg>
  );
}

export default function EventActions({
  eventUrl,
  sourceUrl,
  scheme,
}: {
  eventUrl: string;
  sourceUrl?: string;
  scheme: CardScheme;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(eventUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable (e.g. insecure context) — silently ignore.
    }
  };

  return (
    <div className="flex items-center gap-[12px] shrink-0">
      <button
        type="button"
        onClick={handleCopy}
        className={buttonClass}
        style={{ backgroundColor: scheme.chip, color: scheme.fg }}
        aria-label={copied ? 'Link copied' : 'Copy link to this event'}
        title={copied ? 'Link copied' : 'Copy link to this event'}
      >
        {copied ? <Check className="size-6" strokeWidth={2} /> : <CopyIcon />}
      </button>

      {sourceUrl && (
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClass}
          style={{ backgroundColor: scheme.fg, color: scheme.bg }}
          aria-label="Open original event source in a new tab"
          title="Open original event source"
        >
          <ShareIcon />
        </a>
      )}
    </div>
  );
}

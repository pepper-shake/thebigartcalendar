/**
 * Duotone card schemes (Figma "Calendar", cards 285:4018…285:4061; Style
 * Reference 1 §1): each card is exactly one background + one foreground. Title,
 * meta, chip text and icons all use `fg`; `chip` is the translucent wash behind
 * the type label (white on light cards, black on dark ones).
 */
export interface CardScheme {
  bg: string;
  fg: string;
  chip: string;
}

import type { ArtEvent } from '@/types';

const LIGHT_CHIP = 'rgba(255, 255, 255, 0.5)';
const DARK_CHIP = 'rgba(0, 0, 0, 0.2)';

/** Schemes events are hashed into. */
export const CARD_SCHEMES: CardScheme[] = [
  { bg: '#E4B6D1', fg: '#5A1F2D', chip: LIGHT_CHIP }, // blush / oxblood
  { bg: '#263322', fg: '#B0E2A0', chip: DARK_CHIP }, // forest / lime
  { bg: '#92B8DA', fg: '#5A1F2D', chip: LIGHT_CHIP }, // sky / oxblood
  { bg: '#FEEA8A', fg: '#427BB7', chip: LIGHT_CHIP }, // butter / cornflower
  { bg: '#AAA462', fg: '#FFE4AD', chip: DARK_CHIP }, // olive / cream
];

/**
 * Places whose events always use one scheme, keyed by /places slug (matched on
 * the event's venue or organiser). These schemes are reserved: they are not in
 * CARD_SCHEMES, so no other event can land on them.
 */
const PLACE_SCHEMES: Record<string, CardScheme> = {
  'disco-wheel': { bg: '#5A1F2E', fg: '#ED87AF', chip: DARK_CHIP }, // wine / pink
};

/**
 * Card scheme for an event: a place's pinned scheme if it has one, otherwise
 * picked deterministically by hashing the event id.
 */
export function getCardScheme(
  event: Pick<ArtEvent, 'id' | 'venuePlace' | 'organiserPlace'>,
): CardScheme {
  const pinned =
    PLACE_SCHEMES[event.venuePlace?.slug ?? ''] ?? PLACE_SCHEMES[event.organiserPlace?.slug ?? ''];
  if (pinned) return pinned;
  let hash = 0;
  for (let i = 0; i < event.id.length; i++) {
    hash = (hash * 31 + event.id.charCodeAt(i)) & 0xffffffff;
  }
  return CARD_SCHEMES[Math.abs(hash) % CARD_SCHEMES.length];
}

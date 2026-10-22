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

const LIGHT_CHIP = 'rgba(255, 255, 255, 0.5)';
const DARK_CHIP = 'rgba(0, 0, 0, 0.2)';

export const CARD_SCHEMES: CardScheme[] = [
  { bg: '#E4B6D1', fg: '#5A1F2D', chip: LIGHT_CHIP }, // blush / oxblood
  { bg: '#263322', fg: '#B0E2A0', chip: DARK_CHIP }, // forest / lime
  { bg: '#92B8DA', fg: '#5A1F2D', chip: LIGHT_CHIP }, // sky / oxblood
  { bg: '#5A1F2E', fg: '#ED87AF', chip: DARK_CHIP }, // wine / pink
  { bg: '#FEEA8A', fg: '#427BB7', chip: LIGHT_CHIP }, // butter / cornflower
  { bg: '#AAA462', fg: '#FFE4AD', chip: DARK_CHIP }, // olive / cream
];

/** Deterministic card scheme for an event, hashed from its id. */
export function getCardScheme(id: string): CardScheme {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) & 0xffffffff;
  }
  return CARD_SCHEMES[Math.abs(hash) % CARD_SCHEMES.length];
}

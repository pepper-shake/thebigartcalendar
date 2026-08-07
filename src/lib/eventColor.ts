// The four rotating accent colours used for event cards and their modal theme.
export const CARD_COLORS = ['#E06927', '#EFCEEE', '#C8CC17', '#BFDBD8'];

/** Deterministic accent colour for an event, hashed from its id. */
export function getCardColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) & 0xffffffff;
  }
  return CARD_COLORS[Math.abs(hash) % CARD_COLORS.length];
}

/** Mix a hex colour toward white. amount 0 = original, 1 = white. */
export function tint(hex: string, amount: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const mix = (c: number) => Math.round(c + (255 - c) * amount);
  return `#${[mix(r), mix(g), mix(b)].map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}

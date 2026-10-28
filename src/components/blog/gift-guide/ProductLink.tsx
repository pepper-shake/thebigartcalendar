import type { CSSProperties } from 'react';
import s from './GiftGuide.module.css';

const A = '/blog/online-stores-for-creative-christmas-gifts';
const ARROWS = { white: 'arrow', dark: 'arrow-dark', cream: 'arrow-cream' } as const;

export function Arrow({ tone = 'white' }: { tone?: keyof typeof ARROWS }) {
  // eslint-disable-next-line @next/next/no-img-element -- 24px static icon
  return <img src={`${A}/${ARROWS[tone]}.svg`} alt="" className={s.hintArrow} />;
}

/** "Link to product ↗" (Geist Light 22/38): black on the cards, cream (`light`) on dark paper. */
export function ProductLink({
  href,
  className,
  light = false,
  style,
}: {
  href: string;
  className: string;
  light?: boolean;
  style?: CSSProperties;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      className={`${s.hint} ${s.productLink} ${light ? s.productLinkLight : ''} ${s.piece} ${className}`}
      style={style}
    >
      Link to product
      <Arrow tone={light ? 'cream' : 'dark'} />
    </a>
  );
}

import Image from 'next/image';
import type { CSSProperties, ReactNode } from 'react';
import ScrollScene from '@/components/blog/ScrollScene';
import type { CollageData, Layer, Shop } from './shops';
import { ProductLink } from './ProductLink';
import s from './GiftGuide.module.css';

/** One Figma px inside the collage (`--cu`). */
const cu = (n: number) => `calc(${n} * var(--cu))`;

function Layers({ layers, className }: { layers: Layer[]; className?: string }) {
  return layers.map((l, i) => (
    <Image
      key={i}
      src={l.src}
      alt=""
      fill
      sizes="100vw"
      className={`${s.cover} ${className ?? ''}`}
      style={l.opacity === undefined ? undefined : { opacity: l.opacity }}
    />
  ));
}

/**
 * A template shop (see shops.ts): the zoom scene — framed photo → bigger frame
 * → full-bleed + logo; then, in its hold, the paper veil fades in with the
 * scroll — and the details scene pinned over it (copy, then the collage card
 * by card, then half a screen of rest before the next shop slides over).
 */
export default function ShopStory({ shop }: { shop: Shop }) {
  const { logo } = shop;
  const productUrl = shop.productUrl ?? shop.url;
  return (
    <>
      <ScrollScene
        length={2.4}
        hold={3.2}
        mobileHold={2}
        cover="desktop"
        className={s.zoom}
        style={{ background: shop.bg, ...(shop.mobileX === undefined ? {} : { '--mx': shop.mobileX, '--hmx': 1 }) } as CSSProperties}
        label={shop.name}
      >
        <Layers layers={shop.texture} />
        <div className={s.zoomBox}>
          <Image
            src={shop.photo.src}
            alt={shop.photo.alt}
            fill
            sizes="100vw"
            className={s.cover}
            style={{ objectPosition: shop.photo.position }}
          />
        </div>
        {logo &&
          (logo.mask ? (
            <span
              className={`${s.shopLogo} ${s.shopLogoMask}`}
              role="img"
              aria-label={logo.label}
              style={
                {
                  '--lw': logo.w, '--lh': logo.h, '--lcx': logo.cx, '--lcy': logo.cy,
                  maskImage: `url('${logo.src}')`,
                  WebkitMaskImage: `url('${logo.src}')`,
                } as CSSProperties
              }
            />
          ) : (
            <Image
              src={logo.src}
              alt={logo.label}
              width={logo.w * 2}
              height={logo.h * 2}
              sizes="(max-width: 767px) 80vw, 520px"
              className={s.shopLogo}
              style={{ '--lw': logo.w, '--lh': logo.h, '--lcx': logo.cx, '--lcy': logo.cy } as CSSProperties}
            />
          ))}
        {/* The details background: fades in with the scroll during the first
            hold screen, while the (transparent) details scene slides in. */}
        <div className={`${s.fill} ${s.zoomVeil}`}>
          <Layers layers={shop.veil} />
        </div>
      </ScrollScene>

      <ScrollScene
        length={1.7}
        hold={1.5}
        cover
        coverScreens={3.2}
        mobileCover={1}
        mode="pin-desktop"
        className={`${s.shop} ${s.staged} ${s.tShop}`}
        stageClassName={s.shopStage}
        style={
          {
            '--text-top': shop.textTop,
            '--collage-top': shop.collageTop,
            '--back': shop.backCard.color,
            '--bg': shop.bg,
            ...(shop.mobileX === undefined ? {} : { '--mx': shop.mobileX, '--hmx': 1 }),
          } as CSSProperties
        }
      >
        {/* Below 1024px nothing is pinned underneath: draw the background here. */}
        <div className={`${s.fill} ${s.stagedBg} ${s.belowDesktop}`}>
          <Image
            src={shop.photo.src}
            alt=""
            fill
            sizes="100vw"
            className={`${s.cover} ${s.stagedPhoto}`}
            style={{ objectPosition: shop.photo.position }}
          />
          <Layers layers={shop.veil} />
        </div>
        <ShopCopy shop={shop} />
        <Collage data={{ ...shop, href: productUrl }} />
      </ScrollScene>
    </>
  );
}

/**
 * The card collage: the tilted back card, torn grid paper, white product card,
 * star(s) and "Link to product". On phones it is a screen of its own on the
 * shop's paper texture (Figma "Mob": the desktop cards at 0.68, re-placed).
 */
export function Collage({ data, className }: { data: CollageData; className?: string }) {
  const pc = data.productCard;
  return (
    <div className={`${s.collage} ${s.tCollage} ${className ?? ''}`} style={{ '--back': data.backCard.color } as CSSProperties}>
      <div className={s.tCollageBg} aria-hidden>
        <Layers layers={data.texture} />
      </div>
      <div className={`${s.piece} ${s.tBack}`} style={{ '--d': 0 } as CSSProperties}>
        <div className={s.tBackInner}>
          <Image
            src={data.backCard.src}
            alt={data.backCard.alt}
            width={data.backCard.w}
            height={data.backCard.h}
            sizes="(max-width: 1023px) 40vw, 282px"
            style={data.backCard.fit ? { objectFit: data.backCard.fit } : undefined}
          />
        </div>
      </div>
      <Image
        src="/blog/online-stores-for-creative-christmas-gifts/torn-paper.webp"
        alt=""
        width={566}
        height={389}
        className={`${s.piece} ${s.tTorn}`}
        style={{ '--d': 0.06 } as CSSProperties}
      />
      <a
        href={data.href}
        target="_blank"
        rel="noopener"
        className={`${s.piece} ${s.whiteCard} ${s.tCard}`}
        style={{ '--d': 0.12 } as CSSProperties}
      >
        {pc.panel && (
          <span
            className={s.tPanel}
            style={{ left: cu(pc.panel.x), top: cu(pc.panel.y), width: cu(pc.panel.w), height: cu(pc.panel.h), background: pc.panel.color }}
          />
        )}
        <Image
          src={pc.img.src}
          alt={pc.img.alt}
          width={pc.img.iw}
          height={pc.img.ih}
          sizes="(max-width: 1023px) 50vw, 425px"
          className={s.tProduct}
          style={{ left: cu(pc.img.x), top: cu(pc.img.y), width: cu(pc.img.w), height: cu(pc.img.h) }}
        />
      </a>
      {data.stars.map((st, i) => (
        // eslint-disable-next-line @next/next/no-img-element -- vector star
        <img
          key={i}
          src={st.src}
          alt=""
          className={`${s.piece} ${s.tStar}`}
          style={{ '--sx': st.x, '--sy': st.y, width: cu(st.w), height: cu(st.h), '--d': 0.18 + i * 0.04, '--rise': '120px' } as CSSProperties}
        />
      ))}
      <ProductLink
        href={data.href}
        className={s.tLink}
        style={{ '--lx': data.link.x, '--ly': data.link.y, '--d': 0.22 } as CSSProperties}
      />
    </div>
  );
}

/** Heading, paragraphs and the "Perfect for" / "Shop" columns (Figma frame 7). */
export function ShopCopy({
  shop,
  className,
  before,
}: {
  shop: Pick<Shop, 'heading' | 'paragraphs' | 'perfectFor' | 'shopLabel' | 'url'>;
  className?: string;
  /** Shown above the heading (Choosing Keeping's logo on phones). */
  before?: ReactNode;
}) {
  return (
    <div className={`${s.shopCopy} ${s.tCopy} ${className ?? ''}`}>
      {before}
      <h2 className={s.tHeading}>{shop.heading}</h2>
      {shop.paragraphs.map((p, i) => (
        <p key={i} className={s.tBody}>
          {p}
        </p>
      ))}
      <div className={s.tMeta}>
        <div>
          <p className={s.tLabel}>Perfect for:</p>
          <p className={s.tValue}>{shop.perfectFor}</p>
        </div>
        <div>
          <p className={s.tLabel}>Shop:</p>
          <a className={s.tValue} href={shop.url} target="_blank" rel="noopener">
            {shop.shopLabel}
          </a>
        </div>
      </div>
    </div>
  );
}

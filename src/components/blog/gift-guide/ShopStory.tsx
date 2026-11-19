import Image from 'next/image';
import type { CSSProperties, ReactNode } from 'react';
import ScrollScene from '@/components/blog/ScrollScene';
import type { CollageData, Layer, Shop, Story } from './shops';
import { ProductLink } from './ProductLink';
import s from './GiftGuide.module.css';

/** One Figma px inside the collage (`--cu`). */
const cu = (n: number) => `calc(${n} * var(--cu))`;

export function Layers({ layers, className }: { layers: Layer[]; className?: string }) {
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
 * A template shop (see shops.ts): the zoom scene, then its details pinned over
 * it (copy, then the collage card by card, then half a screen of rest before
 * the next shop slides over).
 */
export default function ShopStory({ shop }: { shop: Shop }) {
  return (
    <>
      <StoryZoom story={shop} />
      <StoryDetails story={shop} style={{ '--collage-top': shop.collageTop, '--back': shop.backCard.color } as CSSProperties}>
        <ShopCopy shop={shop} />
        <Collage data={{ ...shop, href: shop.productUrl ?? shop.url }} />
      </StoryDetails>
    </>
  );
}

/**
 * Framed photo → bigger frame → full-bleed + logo; then, in its hold, the paper
 * veil fades in with the scroll. `children` fade with the logo (see .shopLogo).
 */
export function StoryZoom({ story, children }: { story: Story; children?: ReactNode }) {
  const { logo } = story;
  return (
    <ScrollScene
      length={2.4}
      hold={3.2}
      mobileHold={2}
      cover="desktop"
      className={s.zoom}
      style={
        {
          background: story.bg,
          ...(story.mobileX === undefined ? {} : { '--mx': story.mobileX, '--hmx': 1 }),
          ...(story.photo.scale === undefined ? {} : { '--zs': story.photo.scale }),
        } as CSSProperties
      }
      label={story.name}
    >
      <Layers layers={story.texture} />
      <div className={s.zoomBox}>
        <Image
          src={story.photo.src}
          alt={story.photo.alt}
          fill
          sizes="100vw"
          className={s.cover}
          style={{ objectPosition: story.photo.position }}
        />
      </div>
      {children}
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
            sizes={logo.sizes ?? '(max-width: 767px) 80vw, 520px'}
            className={s.shopLogo}
            style={
              {
                '--lw': logo.w, '--lh': logo.h, '--lcx': logo.cx, '--lcy': logo.cy,
                ...(logo.mobileScale === undefined ? {} : { '--lms': logo.mobileScale }),
              } as CSSProperties
            }
          />
        ))}
      {/* The details background: fades in with the scroll during the first
          hold screen, while the (transparent) details scene slides in. */}
      <div className={`${s.fill} ${s.zoomVeil}`}>
        <Layers layers={story.veil} />
      </div>
    </ScrollScene>
  );
}

/** The transparent details scene pinned over the zoom; `children` are its copy and pictures. */
export function StoryDetails({
  story,
  className,
  style,
  children,
}: {
  story: Story;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <ScrollScene
      length={1.7}
      hold={1.5}
      cover
      coverScreens={3.2}
      mobileCover={1}
      mode="pin-desktop"
      className={`${s.shop} ${s.staged} ${s.tShop} ${className ?? ''}`}
      stageClassName={s.shopStage}
      style={
        {
          '--text-top': story.textTop,
          '--bg': story.bg,
          ...(story.mobileX === undefined ? {} : { '--mx': story.mobileX, '--hmx': 1 }),
          ...style,
        } as CSSProperties
      }
    >
      {/* Below 1024px nothing is pinned underneath: draw the background here. */}
      <div className={`${s.fill} ${s.stagedBg} ${s.belowDesktop}`}>
        <Image
          src={story.photo.src}
          alt=""
          fill
          sizes="100vw"
          className={`${s.cover} ${s.stagedPhoto}`}
          style={{ objectPosition: story.photo.position }}
        />
        <Layers layers={story.veil} />
      </div>
      {children}
    </ScrollScene>
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

/** Heading, paragraphs and the "Perfect for" / "Shop" columns (Figma frame 7; "Shop" is optional). */
export function ShopCopy({
  shop,
  className,
  before,
}: {
  shop: Pick<Shop, 'heading' | 'paragraphs' | 'perfectFor'> & Partial<Pick<Shop, 'shopLabel' | 'url'>>;
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
        {shop.shopLabel && (
          <div>
            <p className={s.tLabel}>Shop:</p>
            <a className={s.tValue} href={shop.url} target="_blank" rel="noopener">
              {shop.shopLabel}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

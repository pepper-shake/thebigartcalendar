import Image from 'next/image';
import type { CSSProperties } from 'react';
import Link from 'next/link';
import localFont from 'next/font/local';
import ScrollScene from '@/components/blog/ScrollScene';
import type { BlogPost } from '@/lib/blogPosts';
import ShopStory, { Collage, ShopCopy } from './ShopStory';
import { Arrow, ProductLink } from './ProductLink';
import { SHOPS, type CollageData } from './shops';
import s from './GiftGuide.module.css';

// Figma sets this page in Newsreader 300/400/500 with italics, and renders
// it with the optical-size axis (opsz) on auto: big type (the 102px title)
// uses the high-contrast display cut, small type the text cut. So the landing
// serves the *variable* Newsreader files (wght 200–800, opsz 6–72, latin;
// OFL, from Google Fonts) under their own family name. Loading it through
// next/font/google would register a second "Newsreader" family that clashes
// with the site-wide static one (no opsz, only 300/600), and the browser could
// pick either face for the same weight.
const guideSerif = localFont({
  src: [
    { path: '../../../fonts/Newsreader-opsz-wght.latin.woff2', weight: '200 800', style: 'normal' },
    { path: '../../../fonts/Newsreader-Italic-opsz-wght.latin.woff2', weight: '200 800', style: 'italic' },
  ],
  variable: '--font-guide-serif',
  fallback: ['Georgia', 'serif'],
});

const A = '/blog/online-stores-for-creative-christmas-gifts';

const CHOOSING_KEEPING_URL = 'https://www.choosingkeeping.com';
const CHOOSING_KEEPING_PRODUCT_URL = 'https://choosingkeeping.com/products/pastel-clown-glass-ornament';

/** Choosing Keeping's cards on phones (Figma "Mob" Group 28): the template
 *  collage with the moon in the white card and the clown on the back card. */
const CK_COLLAGE: CollageData = {
  href: CHOOSING_KEEPING_PRODUCT_URL,
  texture: [{ src: `${A}/red-texture.jpg` }],
  backCard: { color: '#520b0e', src: `${A}/clown.webp`, w: 700, h: 1386, alt: '', fit: 'contain' },
  productCard: {
    panel: { x: 20, y: 20, w: 400, h: 488, color: '#eaded5' },
    img: { x: 74.5, y: 47.4, w: 272.3, h: 432.8, src: `${A}/moon.webp`, iw: 1000, ih: 1586, alt: '' },
  },
  stars: [{ x: 518, y: 90, w: 169, h: 194, src: `${A}/star-green.svg` }],
  link: { x: 571, y: 604 },
};

/**
 * The gift-guide landing (Figma "Online Stores for Creative Christmas Gifts",
 * Calendar 335:2017): a scroll story in the style of etsyedit.com. All copy is
 * server-rendered; ScrollScene only drives the CSS animation.
 */
export default function GiftGuide({ post }: { post: BlogPost }) {
  return (
    <article className={`${s.guide} ${guideSerif.variable}`}>
      {/* Frames 0 → 1 (Figma 335:2017): the title on velvet with gold stars;
          then the background turns to red paper and the red pocket (a folder)
          slides up, and what's inside comes out of it one by one, each its own
          way: the grid paper (paper clip, "Winter 2026"), the polaroid (clown
          photo), the Give A Pon slipper, the hanging mushroom ornament and the
          mug; last, the green star lands on the front. */}
      <ScrollScene length={2.6} hold={1} className={s.hero} label="Introduction">
        <Image src={`${A}/hero-velvet.jpg`} alt="" width={2600} height={1391} sizes="140vw" className={s.heroVelvet} preload />
        <div className={`${s.fill} ${s.heroRedPaper}`}>
          <Image src={`${A}/red-texture.jpg`} alt="" fill sizes="100vw" className={s.cover} />
        </div>
        <Link href="/" className={s.heroLogo} aria-label="The Big Art Calendar — all events">
          {/* eslint-disable-next-line @next/next/no-img-element -- vector wordmark */}
          <img src={`${A}/logo.svg`} alt="the big art calendar." width={163} height={56} />
        </Link>
        <header className={s.heroTitle}>
          <p className={s.heroKicker}>{post.kicker}</p>
          <h1 className={s.heroH1}>{post.title}</h1>
        </header>
        <div className={s.pocket} aria-hidden>
          {/* Layer order as in Figma, back to front. */}
          {/* eslint-disable @next/next/no-img-element -- vector pocket panels */}
          <img src={`${A}/pocket-back.svg`} alt="" className={s.pocketBack} />
          <img src={`${A}/pocket-back-m.svg`} alt="" className={`${s.pocketM} ${s.pocketBackM}`} />
          <div className={s.pocketPaperGroup}>
            <Image src={`${A}/pocket-paper.webp`} alt="" width={657} height={862} className={s.pocketPaper} preload />
            <div className={s.heroClip}>
              <Image src={`${A}/hero-paper-clip.webp`} alt="" width={360} height={540} sizes="(max-width: 767px) 12vw, 182px" />
            </div>
            <span className={s.heroWinter}>Winter 2026</span>
          </div>
          <div className={s.pocketPolaroidGroup}>
            <div className={s.heroClownPhoto}>
              <Image src={`${A}/hero-clown-photo.jpg`} alt="" width={900} height={1088} sizes="(max-width: 767px) 30vw, 450px" />
            </div>
            <Image src={`${A}/polaroid.webp`} alt="" width={1262} height={1462} className={s.pocketPolaroid} sizes="(max-width: 767px) 40vw, 532px" />
          </div>
          <Image src={`${A}/hero-slipper.webp`} alt="" width={640} height={790} sizes="(max-width: 767px) 30vw, 400px" className={s.heroSlipper} />
          <Image src={`${A}/hero-mushroom.webp`} alt="" width={1000} height={1081} sizes="(max-width: 767px) 35vw, 624px" className={s.heroMushroom} />
          <Image src={`${A}/hero-mug.webp`} alt="" width={1000} height={1081} sizes="(max-width: 767px) 35vw, 495px" className={s.heroMug} />
          <img src={`${A}/pocket-front.svg`} alt="" className={s.pocketFront} />
          <img src={`${A}/pocket-front-m.svg`} alt="" className={`${s.pocketM} ${s.pocketFrontM}`} />
          <img src={`${A}/star-green.svg`} alt="" className={s.heroStar} />
          {/* eslint-enable @next/next/no-img-element */}
        </div>
        {/* On the pocket front (Figma 355:2863); rises with the pocket. */}
        <p className={s.pocketText}>
          Every year, somewhere around the first grey week of November, I make the same promise to myself: this time,
          no last-minute candles. No gift sets grabbed at the checkout. This time, every present will feel like it was
          chosen for one person only.
        </p>
        <p className={`${s.hint} ${s.heroHint}`} aria-hidden>
          Scroll
          <Arrow />
        </p>
      </ScrollScene>

      {/* Frames 2 → 3: intro; slides up over the pocket, then the photo comes into focus. */}
      <ScrollScene length={1.6} hold={1} cover mode="pin-desktop" className={s.intro}>
        <div className={s.introText}>
          <h2 className={s.introHeading}>
            Why I choose <em>unique</em> gifts over generic ones
          </h2>
          <div className={s.introColumns}>
            <p>
              The truth is, the best gifts I’ve ever received weren’t expensive. They were the ones where I could feel
              the thought behind them. Something handmade, something a little unexpected, something that made me smile
              every time I used it.
            </p>
            <p>So this year I went looking for small online shops that make exactly that kind of thing.</p>
          </div>
        </div>
        <div className={s.introPhoto}>
          <Image src={post.image} alt={post.imageAlt} fill sizes="(max-width: 767px) 100vw, 41vw" className={s.cover} />
        </div>
      </ScrollScene>

      <ShopStory shop={SHOPS.giveapon} />
      <ShopStory shop={SHOPS.wielonki} />
      <ShopStory shop={SHOPS.tartagelatina} />
      <ShopStory shop={SHOPS.annanina} />

      {/* Choosing Keeping (bespoke): the framed moon on harlequin grows to
          full-bleed (the moon keeps its 345×548 size); in the hold the red
          paper fades in, the moon dims to 30% and the cream logo appears
          (Figma frame 11); then the logo leaves, the moon comes back and moves
          right, and the details appear around it (frame 12). */}
      <ScrollScene length={2.3} hold={3.5} mobileHold={2} cover="desktop" className={`${s.zoom} ${s.ck}`} style={{ background: '#962424', '--mx': -291 / 871, '--hmx': 1 } as CSSProperties} label="Choosing Keeping">
        <Image src={`${A}/red-texture.jpg`} alt="" fill sizes="100vw" className={s.cover} />
        <div className={s.zoomBox}>
          <Image src={`${A}/harlequin.jpg`} alt="" fill sizes="100vw" className={`${s.cover} ${s.harlequin} ${s.aboveSm}`} />
          {/* Phones: the moon on harlequin as one picture that zooms (Figma "Mob"). */}
          <Image src={`${A}/ck-moon-harlequin.jpg`} alt="" fill sizes="100vw" className={`${s.cover} ${s.belowSm}`} />
        </div>
        <div className={`${s.fill} ${s.zoomVeil}`}>
          <Image src={`${A}/red-texture.jpg`} alt="" fill sizes="100vw" className={`${s.cover} ${s.ckRedLayer}`} />
        </div>
        <Image
          src={`${A}/moon.webp`}
          alt="Glass crescent-moon ornament with a painted face"
          width={1000}
          height={1586}
          sizes="(max-width: 767px) 60vw, 400px"
          className={`${s.moon} ${s.aboveSm}`}
        />
        <span className={s.ckBigLogo} role="img" aria-label="Choosing Keeping" />
      </ScrollScene>
      <ScrollScene
        length={2}
        hold={1.5}
        cover
        coverScreens={3.5}
        mobileCover={1}
        mode="pin-desktop"
        className={`${s.shop} ${s.staged} ${s.tShop} ${s.ckDetails}`}
        stageClassName={s.shopStage}
        style={{ '--text-top': 117, '--bg': '#962424', '--mx': -291 / 871, '--hmx': 1 } as CSSProperties}
      >
        {/* Below 1024px nothing is pinned underneath: draw the layers here. */}
        <div className={`${s.fill} ${s.stagedBg} ${s.belowDesktop}`}>
          <Image src={`${A}/harlequin.jpg`} alt="" fill sizes="100vw" className={`${s.cover} ${s.harlequin} ${s.aboveSm}`} />
          <Image src={`${A}/ck-moon-harlequin.jpg`} alt="" fill sizes="100vw" className={`${s.cover} ${s.stagedPhoto} ${s.belowSm}`} />
          <Image src={`${A}/red-texture.jpg`} alt="" fill sizes="100vw" className={`${s.cover} ${s.ckRedLayer}`} />
        </div>
        <ShopCopy
          before={<span className={`${s.ckCopyLogo} ${s.belowSm}`} role="img" aria-label="Choosing Keeping" />}
          shop={{
            heading: 'Choosing Keeping: the most beautiful Christmas ornaments I’ve seen',
            paragraphs: [
              'I’ll be honest: Choosing Keeping’s ornament collection is the most beautiful I’ve come across. This London stationery shop has always been known for its eye for detail, carefully choosing pieces from independent makers around the world. Its Christmas ornaments carry the same care. They feel less like decorations and more like small treasures you’ll unwrap and rediscover every December.',
              'An ornament is one of my favourite gifts to give. It’s small, it’s personal, and it becomes part of someone’s Christmas tradition for years.',
            ],
            perfectFor: 'friends who collect ornaments, new homeowners decorating their first tree, anyone who loves Christmas traditions.',
            shopLabel: 'choosingkeeping.com',
            url: CHOOSING_KEEPING_URL,
          }}
        />
        <Collage data={CK_COLLAGE} className={s.belowSm} />
        <div className={`${s.ckProducts} ${s.aboveSm}`}>
          <Image
            src={`${A}/torn-paper.webp`}
            alt=""
            width={566}
            height={389}
            className={`${s.piece} ${s.ckTorn}`}
            style={{ '--d': 0 } as CSSProperties}
          />
          <Image
            src={`${A}/moon.webp`}
            alt=""
            width={1000}
            height={1586}
            sizes="45vw"
            className={`${s.ckMoonMobile} ${s.belowDesktop}`}
          />
          {/* Desktop: the zoom's moon, redrawn above the torn paper (see .ckMoonTop). */}
          <Image src={`${A}/moon.webp`} alt="" width={1000} height={1586} sizes="400px" className={s.ckMoonTop} />
          <Image
            src={`${A}/clown.webp`}
            alt="Pastel clown glass ornament from Choosing Keeping"
            width={700}
            height={1386}
            sizes="(max-width: 1023px) 35vw, 251px"
            className={`${s.piece} ${s.ckClown}`}
            style={{ '--d': 0.08 } as CSSProperties}
          />
          <ProductLink href={CHOOSING_KEEPING_PRODUCT_URL} className={s.ckLink} style={{ '--d': 0.2 } as CSSProperties} />
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element -- vector star */}
        <img src={`${A}/star-green.svg`} alt="" className={`${s.piece} ${s.ckStar} ${s.aboveSm}`} style={{ '--d': 0.14 } as CSSProperties} />
      </ScrollScene>

      <ShopStory shop={SHOPS.goodmood} />

      {/* Closing block (Figma 360:2990): on velvet with gold stars, the green
          envelope (with its card) rises out of the bottom (top 329 → 194 →
          85), then the pink star, the title and the note appear. */}
      <ScrollScene length={2.5} cover="desktop" className={s.envelope} label="The gift is the feeling">
        <Image src={`${A}/hero-velvet.jpg`} alt="" fill sizes="100vw" className={s.cover} />
        <Image
          src={`${A}/envelope.webp`}
          alt=""
          width={1600}
          height={2022}
          sizes="(max-width: 767px) 100vw, 892px"
          className={s.envelopeImg}
        />
        {/* eslint-disable-next-line @next/next/no-img-element -- vector star */}
        <img src={`${A}/star-pink.svg`} alt="" className={s.envelopeStar} />
        <h2 className={s.envelopeTitle}>The gift is the feeling</h2>
        <p className={s.envelopeText}>
          In the end, what people remember isn’t the present itself. It’s the feeling of being seen. This Christmas,
          let’s give gifts with a story: made by real people, chosen with care, and loved for years.
        </p>
      </ScrollScene>
    </article>
  );
}

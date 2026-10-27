import Image from 'next/image';
import Link from 'next/link';
import localFont from 'next/font/local';
import ScrollScene from '@/components/blog/ScrollScene';
import type { BlogPost } from '@/lib/blogPosts';
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

const ANNA_NINA_URL = 'https://www.anna-nina.nl';
const CHOOSING_KEEPING_URL = 'https://www.choosingkeeping.com';

const ARROWS = { white: 'arrow', dark: 'arrow-dark', cream: 'arrow-cream' } as const;

function Arrow({ tone = 'white' }: { tone?: keyof typeof ARROWS }) {
  // eslint-disable-next-line @next/next/no-img-element -- 24px static icon
  return <img src={`${A}/${ARROWS[tone]}.svg`} alt="" className={s.hintArrow} />;
}

/** "Link to product ↗": black on the white cards, cream (`light`) on red. */
function ProductLink({ href, className, light = false }: { href: string; className: string; light?: boolean }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      className={`${s.hint} ${s.productLink} ${light ? s.productLinkLight : ''} ${s.piece} ${className}`}
    >
      Link to product
      <Arrow tone={light ? 'cream' : 'dark'} />
    </a>
  );
}

/**
 * The gift-guide landing (Figma "Online Stores for Creative Christmas Gifts",
 * Calendar 335:2017): a scroll story in the style of etsyedit.com. All copy is
 * server-rendered; ScrollScene only drives the CSS animation.
 */
export default function GiftGuide({ post }: { post: BlogPost }) {
  return (
    <article className={`${s.guide} ${guideSerif.variable}`}>
      {/* Frames 0 → 1 (Figma 335:2017): the title on velvet with gold stars;
          then the background turns to red paper and the red pocket slides up,
          with the grid paper (paper clip, mushroom ornament, "Winter 2026",
          green star) and the polaroid (clown photo) pulled out of it. */}
      <ScrollScene length={1.8} hold={1} className={s.hero} label="Introduction">
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
          {/* eslint-disable @next/next/no-img-element -- vector pocket panels */}
          <img src={`${A}/pocket-back.svg`} alt="" className={s.pocketBack} />
          <div className={s.pocketPaperGroup}>
            <Image src={`${A}/pocket-paper.webp`} alt="" width={657} height={862} className={s.pocketPaper} preload />
            <div className={s.heroMushroom}>
              <Image src={`${A}/hero-mushroom.webp`} alt="" width={1000} height={1081} sizes="(max-width: 767px) 35vw, 624px" />
            </div>
            <div className={s.heroClip}>
              <Image src={`${A}/hero-paper-clip.webp`} alt="" width={360} height={540} sizes="(max-width: 767px) 12vw, 182px" />
            </div>
            <span className={s.heroWinter}>Winter 2026</span>
            <img src={`${A}/star-green.svg`} alt="" className={s.heroStar} />
          </div>
          <div className={s.pocketPolaroidGroup}>
            <div className={s.heroClownPhoto}>
              <Image src={`${A}/hero-clown-photo.jpg`} alt="" width={900} height={1088} sizes="(max-width: 767px) 30vw, 450px" />
            </div>
            <Image src={`${A}/polaroid.webp`} alt="" width={1262} height={1462} className={s.pocketPolaroid} sizes="(max-width: 767px) 40vw, 532px" />
          </div>
          <img src={`${A}/pocket-front.svg`} alt="" className={s.pocketFront} />
          {/* eslint-enable @next/next/no-img-element */}
        </div>
        <p className={`${s.hint} ${s.heroHint}`} aria-hidden>
          Scroll
          <Arrow />
        </p>
      </ScrollScene>

      {/* Frames 2 → 3: intro; slides up over the pocket, then the photo comes into focus. */}
      <ScrollScene length={1.6} hold={1} cover mode="pin-desktop" className={s.intro}>
        <div className={s.introText}>
          <h2 className={s.introHeading}>
            Where to buy creative <em>Christmas gifts</em> online.
          </h2>
          <div className={s.introColumns}>
            <p>
              Every December the same thing happens. The office announces Secret Santa, a friend invites you to a New
              Year’s party, and you end up with a candle and a box of chocolates again. Generic gifts are fine. Nobody
              remembers them, though.
            </p>
            <p>
              This guide is for people who want to give something with a bit more thought behind it, without spending
              whole weekends in crowded shopping centres. Below you’ll find why unique gifts are worth the extra effort,
              and the best online stores for creative Christmas presents.
            </p>
          </div>
        </div>
        <div className={s.introPhoto}>
          <Image src={post.image} alt={post.imageAlt} fill sizes="(max-width: 767px) 100vw, 41vw" className={s.cover} />
        </div>
      </ScrollScene>

      {/* Frames 4 → 6: anna + nina — the ornament photo grows to full-bleed. */}
      <ScrollScene length={2.4} hold={3.2} mobileHold={1} cover="desktop" className={`${s.zoom} ${s.zoomBlue}`} label="anna + nina">
        <Image src={`${A}/blue-texture.jpg`} alt="" fill sizes="100vw" className={s.cover} />
        <div className={s.zoomBox}>
          <Image
            src={`${A}/anna-nina-ornaments.jpg`}
            alt="Beaded Christmas ornaments from anna + nina: a mushroom, a letter and a striped bauble"
            fill
            sizes="100vw"
            className={`${s.cover} ${s.zoomPhoto}`}
          />
        </div>
        <span className={`${s.wordmark} ${s.zoomWordmark}`} aria-hidden />
        {/* Frame 7's blue layer: fades in with the scroll during the first hold
            screen, while the (transparent) details scene slides in over it. */}
        <div className={`${s.fill} ${s.zoomVeil}`}>
          <Image src={`${A}/blue-texture.jpg`} alt="" fill sizes="100vw" className={`${s.cover} ${s.annaNinaTexture}`} />
        </div>
      </ScrollScene>

      {/* Frame 7: anna + nina details. */}
      {/* Fades in over the full-bleed photo: background, then copy, then cards.
          hold 1.5 = half a screen of rest before the red section slides over.
          It lies entirely inside the zoom's hold (3.2 = 1.7 + 1.5), so the
          photo stays pinned underneath the whole time. */}
      <ScrollScene length={1.7} hold={1.5} cover coverScreens={3.2} mobileCover={1} mode="pin-desktop" className={`${s.shop} ${s.staged} ${s.annaNina}`} stageClassName={s.shopStage}>
        {/* Figma frame 7: the full-bleed photo + wordmark under the blue texture
            at 80%. On desktop the zoom scene underneath already shows all three
            (its veil), so this layer is only for smaller screens. */}
        <div className={`${s.fill} ${s.stagedBg} ${s.belowDesktop}`}>
          <Image
            src={`${A}/anna-nina-ornaments.jpg`}
            alt=""
            fill
            sizes="100vw"
            className={`${s.cover} ${s.zoomPhoto}`}
          />
          <Image src={`${A}/blue-texture.jpg`} alt="" fill sizes="100vw" className={`${s.cover} ${s.annaNinaTexture}`} />
        </div>
        <div className={s.shopCopy}>
          <h2 className="sr-only">anna + nina</h2>
          <p className={s.shopBody}>
            Anna + Nina is an Amsterdam-based brand selling jewellery, clothing and colourful homeware. Its Christmas
            collection covers ornaments, festive table pieces and gifts. Personalised options include initial necklaces
            and birthstone jewellery. There’s also a full gift shop sorted by personality and budget, from “for the
            homebody” to under €50.
          </p>
          <p className={s.bestFor}>
            Best for: close friends, partners, personalised gifts
            <br />
            Shop:{' '}
            <a href={ANNA_NINA_URL} target="_blank" rel="noopener">
              anna-nina.nl
            </a>
          </p>
        </div>
        <div className={s.collage}>
          <div className={`${s.piece} ${s.anNavy}`}>
            <Image src={`${A}/anna-nina-card.jpg`} alt="anna + nina Christmas ornament" width={360} height={448} />
          </div>
          <Image src={`${A}/torn-paper.webp`} alt="" width={566} height={389} className={`${s.piece} ${s.anTorn}`} />
          <a href={ANNA_NINA_URL} target="_blank" rel="noopener" className={`${s.piece} ${s.whiteCard} ${s.anCard}`}>
            <span className={s.anCardInner} />
            <Image
              src={`${A}/anna-nina-glasses.webp`}
              alt="anna + nina coupe glasses with a harlequin gift box"
              width={1200}
              height={1297}
              sizes="(max-width: 1023px) 55vw, 425px"
            />
          </a>
          <ProductLink href={ANNA_NINA_URL} className={s.anLink} />
        </div>
      </ScrollScene>

      {/* Frames 8 → 11: Choosing Keeping — the framed moon on harlequin grows to
          full-bleed (the moon keeps its frame-9 size), then in the hold the red
          paper fades in over the harlequin with the scroll (frame 11). */}
      <ScrollScene length={2.3} hold={2.7} mobileHold={1} cover="desktop" className={`${s.zoom} ${s.zoomRed}`} label="Choosing Keeping">
        <Image src={`${A}/red-texture.jpg`} alt="" fill sizes="100vw" className={s.cover} />
        <div className={s.zoomBox}>
          <Image src={`${A}/harlequin.jpg`} alt="" fill sizes="100vw" className={`${s.cover} ${s.harlequin}`} />
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
          className={s.moon}
        />
      </ScrollScene>

      {/* Frame 12: Choosing Keeping details over the pinned moon — the copy,
          then the star and the links. */}
      <ScrollScene
        length={1.7}
        hold={1}
        cover
        coverScreens={2.7}
        mobileCover={1}
        mode="pin-desktop"
        className={`${s.shop} ${s.staged} ${s.choosingKeeping}`}
        stageClassName={s.shopStage}
      >
        {/* Below 1024px nothing is pinned underneath: draw frame 12's layers here. */}
        <div className={`${s.fill} ${s.belowDesktop}`}>
          <Image src={`${A}/harlequin.jpg`} alt="" fill sizes="100vw" className={`${s.cover} ${s.harlequin}`} />
          <Image src={`${A}/red-texture.jpg`} alt="" fill sizes="100vw" className={`${s.cover} ${s.ckRedLayer}`} />
        </div>
        <div className={s.shopCopy}>
          <h2>
            <span className={s.ckLogo} role="img" aria-label="Choosing Keeping" />
          </h2>
          <p className={s.shopBody}>
            Choosing Keeping is a specialty stationery shop in Covent Garden, London, founded in 2012. It’s known for
            carefully chosen paper, pens, paints and desk objects from independent makers around the world. The
            Christmas range includes ornaments, Christmas cards, advent calendars, garlands, festive confectionery and
            stocking fillers. You can also add their in-house gift wrapping with patterned paper, satin ribbon and a
            handwritten card.
          </p>
          <p className={s.bestFor}>Best for: writers, artists, design lovers, elegant corporate gifts</p>
        </div>
        <div className={s.ckProducts}>
          <Image
            src={`${A}/moon.webp`}
            alt=""
            width={1000}
            height={1586}
            sizes="45vw"
            className={`${s.ckMoonMobile} ${s.belowDesktop}`}
          />
          <Image
            src={`${A}/clown.webp`}
            alt="Pastel clown glass ornament from Choosing Keeping"
            width={700}
            height={1386}
            sizes="(max-width: 1023px) 35vw, 251px"
            className={`${s.piece} ${s.ckClown}`}
          />
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element -- vector star */}
        <img src={`${A}/star-green.svg`} alt="" className={`${s.piece} ${s.ckStar}`} />
        <div className={s.ckLinks}>
          <ProductLink href={CHOOSING_KEEPING_URL} className={s.ckLinkMoon} light />
          <ProductLink href={CHOOSING_KEEPING_URL} className={s.ckLinkRight} light />
        </div>
      </ScrollScene>

      {/* Closing block (Figma 355:2864 → 355:2929): on velvet with gold stars,
          the green envelope (with its card) rises out of the bottom (top
          329 → 194 → 85), then the title and the note appear on the card. */}
      <ScrollScene length={2.5} cover="desktop" className={s.envelope} label="Make this Christmas memorable">
        <Image src={`${A}/hero-velvet.jpg`} alt="" fill sizes="100vw" className={s.cover} />
        <Image
          src={`${A}/envelope.webp`}
          alt=""
          width={1600}
          height={2022}
          sizes="(max-width: 767px) 100vw, 892px"
          className={s.envelopeImg}
        />
        <h2 className={s.envelopeTitle}>Make this Christmas memorable</h2>
        <p className={s.envelopeText}>
          The best gifts aren’t the most expensive. They’re the ones that make someone say “how did you know?” Start
          early, shop small where you can, and choose something with a story.
        </p>
      </ScrollScene>
    </article>
  );
}

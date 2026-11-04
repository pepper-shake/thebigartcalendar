import Image from 'next/image';
import type { CSSProperties } from 'react';
import Link from 'next/link';
import ScrollScene from '@/components/blog/ScrollScene';
import { guideSerif } from '@/components/blog/fonts';
import type { BlogPost } from '@/lib/blogPosts';
import { Layers, ShopCopy, StoryDetails, StoryZoom } from '../gift-guide/ShopStory';
import { Arrow } from '../gift-guide/ProductLink';
import g from '../gift-guide/GiftGuide.module.css';
import { A, FILMS, TIPS, TIPS_STORY, type Film } from './films';
import m from './ChristmasMovies.module.css';

const GUIDE = '/blog/online-stores-for-creative-christmas-gifts';

/**
 * The Christmas movies landing (Figma "Christmas movies to watch this holiday
 * season", Calendar 380:2032): the gift guide's scroll story (its scenes and
 * animation CSS) with new content. All copy is server-rendered.
 */
export default function ChristmasMovies({ post }: { post: BlogPost }) {
  return (
    <article className={`${g.guide} ${guideSerif.variable}`}>
      {/* Frames 0 → 1: the title on red paper under falling snow; the title
          leaves, the folder slides up and what's inside comes out of it one by
          one: the grid paper with Eloise and the clip, the polaroid, the
          ornament; last, the green star lands on the front. */}
      <ScrollScene length={2.6} hold={1} className={g.hero} label="Introduction">
        <Image src={`${A}/paper-texture.jpg`} alt="" fill sizes="100vw" className={g.cover} preload />
        <div className={m.heroSnow} aria-hidden />
        <Link href="/" className={g.heroLogo} aria-label="The Big Art Calendar — all events">
          {/* eslint-disable-next-line @next/next/no-img-element -- vector wordmark */}
          <img src={`${GUIDE}/logo.svg`} alt="the big art calendar." width={163} height={56} />
        </Link>
        <header className={`${g.heroTitle} ${m.heroTitle}`}>
          <p className={g.heroKicker}>{post.kicker}</p>
          <h1 className={g.heroH1}>{post.title}</h1>
        </header>
        <div className={g.pocket} aria-hidden>
          {/* Layer order as in Figma, back to front. */}
          {/* eslint-disable @next/next/no-img-element -- vector pocket panels */}
          <img src={`${GUIDE}/pocket-back.svg`} alt="" className={g.pocketBack} />
          <img src={`${GUIDE}/pocket-back-m.svg`} alt="" className={`${g.pocketM} ${g.pocketBackM}`} />
          <div className={g.pocketPaperGroup}>
            <Image src={`${GUIDE}/pocket-paper.webp`} alt="" width={657} height={862} className={g.pocketPaper} preload />
            <Image src={`${A}/hero-eloise-photo.webp`} alt="" width={1241} height={1190} sizes="(max-width: 767px) 35vw, 304px" className={m.paperPhoto} />
            <div className={g.heroClip}>
              <Image src={`${GUIDE}/hero-paper-clip.webp`} alt="" width={360} height={540} sizes="(max-width: 767px) 12vw, 182px" />
            </div>
          </div>
          <div className={g.pocketPolaroidGroup}>
            <Image src={`${A}/hero-polaroid-photo.jpg`} alt="" width={640} height={480} sizes="(max-width: 767px) 60vw, 444px" className={m.polaroidPhoto} />
            <Image src={`${A}/polaroid.webp`} alt="" width={1262} height={1462} className={g.pocketPolaroid} sizes="(max-width: 767px) 80vw, 532px" />
          </div>
          <Image src={`${A}/hero-ornament.webp`} alt="" width={258} height={439} sizes="(max-width: 767px) 50vw, 360px" className={m.ornament} />
          <img src={`${GUIDE}/pocket-front.svg`} alt="" className={g.pocketFront} />
          <img src={`${GUIDE}/pocket-front-m.svg`} alt="" className={`${g.pocketM} ${g.pocketFrontM}`} />
          <img src={`${GUIDE}/star-green.svg`} alt="" className={g.heroStar} />
          {/* eslint-enable @next/next/no-img-element */}
        </div>
        <p className={g.pocketText}>
          For me, Christmas doesn’t start with the first decoration or the first snowfall. It starts with the first
          Christmas movie of the season. The blanket comes out, the tea gets poured, the lights get turned down.
        </p>
        <p className={`${g.hint} ${g.heroHint}`} aria-hidden>
          Scroll
          <Arrow />
        </p>
      </ScrollScene>

      {/* Frames 2 → 3: intro; slides up over the folder, then the photo comes into focus. */}
      <ScrollScene length={1.6} hold={1} cover mode="pin-desktop" className={g.intro}>
        <div className={g.introText}>
          <h2 className={g.introHeading}>
            Why we <em>rewatch</em> Christmas movies every year
          </h2>
          <div className={g.introColumns}>
            <div>
              <p>
                Over the years, I’ve noticed I don’t need new films every Christmas. I need the ones that feel like
                coming home. Here are four I return to every year, and the kind of evening each one is perfect for.
              </p>
              <p>Christmas movies are less about the story and more about the feeling.</p>
            </div>
            <p>
              We already know how they end, and that’s the point. They remind us of childhood, of family traditions,
              and of the simple idea that kindness and a little magic can fix almost anything. In a busy, noisy season,
              that’s a comfort worth repeating.
            </p>
          </div>
        </div>
        <div className={g.introPhoto}>
          <Image src={`${A}/intro-photo.jpg`} alt="Vintage glass Christmas ornaments on white linen" fill sizes="(max-width: 767px) 100vw, 41vw" className={g.cover} />
        </div>
      </ScrollScene>

      {FILMS.map((film) => (
        <FilmStory key={film.id} film={film} />
      ))}

      {/* The tips: the ornaments zoom, then a centred list on the green paper. */}
      <StoryZoom story={TIPS_STORY} />
      <StoryDetails story={TIPS_STORY}>
        <div className={`${g.shopCopy} ${m.tips}`}>
          <h2 className={m.tipsHeading}>{TIPS_STORY.name}</h2>
          <ol className={m.tipsList}>
            {TIPS.map(([lead, rest]) => (
              <li key={lead}>
                <strong>{lead}</strong> {rest}
              </li>
            ))}
          </ol>
        </div>
        {/* eslint-disable @next/next/no-img-element -- vector stars */}
        <img src={`${A}/star-coral.svg`} alt="" className={`${g.piece} ${g.tStar} ${m.tipStar}`} style={{ '--sx': 1142, '--sy': 92, '--d': 0.1, '--rise': '120px', width: 'calc(169 * var(--u))' } as CSSProperties} />
        <img src={`${A}/star-wine-small.svg`} alt="" className={`${g.piece} ${g.tStar} ${m.tipStar} ${m.tipStarSmall}`} style={{ '--sx': 1322, '--sy': 189, '--d': 0.14, '--rise': '120px', width: 'calc(72.3 * var(--u))' } as CSSProperties} />
        {/* eslint-enable @next/next/no-img-element */}
      </StoryDetails>

      {/* Closing block, as in the gift guide: the envelope rises out of the
          bottom, then the pink star, the title and the note appear. */}
      <ScrollScene length={2.5} cover="desktop" className={`${g.envelope} ${m.closing}`} label="The magic of coming back">
        {/* Cover-fit on a tall phone it is drawn about two screen-heights wide, so ask
            for that much image: "100vw" would stretch a small copy until it blurs. */}
        <Image src={`${GUIDE}/hero-velvet.jpg`} alt="" fill sizes="(max-width: 767px) 190vh, 100vw" className={g.cover} />
        <Image src={`${GUIDE}/envelope.webp`} alt="" width={1600} height={2022} sizes="(max-width: 767px) 140vw, 892px" className={`${g.envelopeImg} ${m.closingImg}`} />
        {/* eslint-disable-next-line @next/next/no-img-element -- vector star */}
        <img src={`${GUIDE}/star-pink.svg`} alt="" className={`${g.envelopeStar} ${m.closingStar}`} />
        <h2 className={`${g.envelopeTitle} ${m.closingTitle}`}>The magic of coming back</h2>
        <p className={`${g.envelopeText} ${m.closingText}`}>
          Every year, these films tell us the same thing in different ways: that home is the people you love, and that a
          little kindness can change everything. So this December, put the kettle on, find your softest blanket, and
          press play on an old favourite.
        </p>
      </ScrollScene>
    </article>
  );
}

/** One film: the zoom with its title and snow, then the copy and the still grid. */
function FilmStory({ film }: { film: Film }) {
  return (
    <>
      <StoryZoom story={film}>
        <div className={m.snow} aria-hidden />
      </StoryZoom>
      <StoryDetails
        story={film}
        style={{ '--collage-top': 0, ...(film.ink ? { '--cream': film.ink, color: film.ink } : {}) } as CSSProperties}
      >
        <ShopCopy shop={film} />
        <div className={`${g.collage} ${g.tCollage}`}>
          <div className={g.tCollageBg} aria-hidden>
            <Layers layers={film.texture} />
          </div>
          <Image
            src={film.grid.src}
            alt={film.grid.alt}
            width={1300}
            height={1300}
            sizes="(max-width: 1023px) 90vw, 572px"
            className={`${g.piece} ${m.grid}`}
            style={{ '--d': 0, '--rise': '100px' } as CSSProperties}
          />
          {film.stars.map((st, i) => (
            // eslint-disable-next-line @next/next/no-img-element -- vector star
            <img
              key={i}
              src={st.src}
              alt=""
              className={`${g.piece} ${g.tStar} ${m.filmStar}`}
              style={{ '--sx': st.x, '--sy': st.y, width: `calc(${st.w} * var(--cu))`, height: `calc(${st.h} * var(--cu))`, '--d': 0.14 + i * 0.04, '--rise': '120px' } as CSSProperties}
            />
          ))}
        </div>
      </StoryDetails>
    </>
  );
}

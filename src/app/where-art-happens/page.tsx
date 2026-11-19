import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import NewsletterSignup from '@/components/home/NewsletterSignup';
import home from '@/components/home/Home.module.css';
import s from '@/components/where-art-happens/WhereArtHappens.module.css';
import JsonLd from '@/components/seo/JsonLd';
import SiteFooter from '@/components/layout/SiteFooter';
import { REGION, absoluteUrl } from '@/lib/site';

const DESCRIPTION = `Where Art Happens is a growing library of real creative spaces from our community across ${REGION}. Share the place where you make art; one space a month is featured on our homepage.`;

export const metadata: Metadata = {
  title: 'Where art happens',
  description: DESCRIPTION,
  alternates: { canonical: absoluteUrl('/where-art-happens') },
  openGraph: { url: absoluteUrl('/where-art-happens') },
};

// Figma 411:2479: three photos in a row, the last running off the right edge.
// The middle one is the homepage hero photo.
const PHOTOS = [
  {
    src: '/where-art-happens/studio-1.jpg',
    ratio: 479 / 359,
    alt: 'A home studio: a desk with pens and a jigsaw box under shelves of prints and postcards, a sofa beside it',
  },
  {
    src: '/home/hero.jpg',
    ratio: 638 / 359,
    alt: 'Brushes, paint tubes and a half-finished abstract painting on a table covered in newspaper',
  },
  {
    src: '/where-art-happens/studio-2.jpg',
    ratio: 479 / 359,
    alt: 'A wooden desk under a shuttered window, with a desk lamp and posters on the wall',
  },
];

// "Share your space" goes to the contact form until there is an upload flow.
const SHARE_HREF = '/contact';

const FAQ = [
  {
    q: 'Who can take part?',
    a: 'Anyone who makes art: painters, illustrators, ceramicists, printmakers, students and hobbyists alike. You don’t need to be a professional, and you don’t need to have exhibited anywhere.',
  },
  {
    q: 'Does my space need to be a real studio?',
    a: 'Not at all. A kitchen table, a windowsill, a corner of your bedroom or a shared workshop all count. Messy, tiny and improvised spaces are just as welcome as purpose-built ones.',
  },
  {
    q: 'Can I be in the photo?',
    a: 'Yes, if you like, or you can leave the space to speak for itself. If anyone else appears in the photo, please make sure they are happy to be shown.',
  },
  {
    q: 'How do you choose the photo of the month?',
    a: 'Each month we pick the space that inspires us most: one with character and a story behind it, not the tidiest or the most expensive. We’ll get in touch before it goes up.',
  },
  {
    q: 'Will my photo be used anywhere else?',
    a: 'Only on The Big Art Calendar, always with your name and a link to your work. We’ll ask you first before using it anywhere else.',
  },
];

function faqJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

export default function WhereArtHappensPage() {
  return (
    <div className={`${home.home} ${s.page} min-h-full flex flex-col`} style={{ backgroundColor: 'var(--page)' }}>
      <main className="flex-1">
        <section className={s.intro}>
          <div className={`${s.wrap} ${s.split}`}>
            <h1 className={s.title}>Where art happens</h1>
            <div className={s.copy}>
              <p>
                Show the place where you craft. See where others create. Connect with artists across {REGION}. One
                space a month gets featured on our homepage.
              </p>
              <Link href={SHARE_HREF} className={s.cta}>
                Share your space
              </Link>
            </div>
          </div>
        </section>

        <div className={s.photos}>
          {PHOTOS.map((p, i) => (
            <div key={p.src} className={s.photo} style={{ aspectRatio: p.ratio }}>
              <Image src={p.src} alt={p.alt} fill sizes="(min-width: 1440px) 640px, 45vw" preload={i < 2} />
            </div>
          ))}
        </div>

        <section aria-labelledby="every-artwork" className={s.sky}>
          <div className={`${s.wrap} ${s.split}`}>
            <h2 id="every-artwork" className={s.heading}>
              Every artwork starts somewhere
            </h2>
            <div className={s.copy}>
              <p>
                A kitchen table covered in sketches. A sunny windowsill with a row of brushes. A shared studio that
                smells of ink and coffee. The places where we make art say a lot about who we are, and they’re
                rarely seen.
              </p>
              <p>
                Where Art Happens is a growing library of real creative spaces from our community. No perfect setups
                needed: messy, tiny and improvised are all welcome.
              </p>
            </div>
          </div>
        </section>

        <section aria-labelledby="photo-of-the-month" className={s.sand}>
          <div className={`${s.wrap} ${s.split}`}>
            <h2 id="photo-of-the-month" className={s.heading}>
              Photo of the month
            </h2>
            <div className={s.copy}>
              <p>
                Every month we pick one space that inspires us most and feature it as the main picture on our
                homepage, with your name, your story and a link to your work. It’s our way of celebrating the people
                behind the art.
              </p>
              <Link href={SHARE_HREF} className={s.cta}>
                Share your space
              </Link>
            </div>
          </div>
        </section>

        <section aria-labelledby="faq" className={s.faq}>
          <div className={s.wrap}>
            <h2 id="faq" className={s.heading}>
              FAQ
            </h2>
            <div className={s.faqList}>
              {FAQ.map((f) => (
                <details key={f.q} name="faq">
                  <summary>
                    {/* eslint-disable-next-line @next/next/no-img-element -- 16px vector icons */}
                    <img src="/icons/faq-plus.svg" alt="" width={16} height={16} className={s.plus} />
                    {/* eslint-disable-next-line @next/next/no-img-element -- 16px vector icons */}
                    <img src="/icons/faq-minus.svg" alt="" width={16} height={16} className={s.minus} />
                    {f.q}
                  </summary>
                  <p className={s.answer}>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <NewsletterSignup source="where-art-happens" />
      </main>
      <SiteFooter flush />
      <JsonLd data={faqJsonLd()} />
    </div>
  );
}

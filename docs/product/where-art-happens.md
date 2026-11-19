# Where art happens

`/where-art-happens` (Figma "Calendar" → "where art happens" `411:2479`) invites artists to share the place where they make art; one space a month is meant to be featured on the homepage. It is the target of the blush "Where art happens" button in the homepage header.

Page: [`src/app/where-art-happens/page.tsx`](../../src/app/where-art-happens/page.tsx); styles: [`WhereArtHappens.module.css`](../../src/components/where-art-happens/WhereArtHappens.module.css).

## Layout
Everything runs full width with the site's 42px page gutters (24px on phones), so the headings line up with the photo row on any screen width.
- **Header** — the site header ([`SiteHeader`](../../src/components/layout/SiteHeader.tsx)), as on every page; its "Where art happens" button has `aria-current="page"` here.
- **Intro** (cream) — the `<h1>` (Newsreader 300, 52px) on the left; on the right, in a 497px column, the pitch (24/32) and an underlined "Share your space" link (32px). Region wording follows `REGION`.
- **Photos** — three photos 359px tall, 10px apart, starting at the left gutter and running off the right edge: [`studio-1.jpg`](../../public/where-art-happens/studio-1.jpg), the homepage hero (`/home/hero.jpg`, same photo as in Figma), [`studio-2.jpg`](../../public/where-art-happens/studio-2.jpg). On phones the row scrolls sideways.
- **"Every artwork starts somewhere"** — sky `#92B8DA` band, 42px heading left, two paragraphs right.
- **"Photo of the month"** — sand `#E5E1D3` band, heading left, paragraph + "Share your space" right.
- **FAQ** — answers in Newsreader Regular 400 (Figma), questions 300; ink on cream, an 866px list of native `<details name="faq">` (one open at a time, works without JS, answers in the HTML), `#E5E1D3` hairlines, "+" / "−" icons from [`public/icons/`](../../public/icons/). Emits `FAQPage` JSON-LD.
- **Newsletter** — the homepage's `NewsletterSignup` with `source="where-art-happens"` (stored on the sign-up row and sent with the `newsletter_signup` event).
- `SiteFooter` (flush).

## Not built yet
- **"Share your space" links to `/contact`.** There is no photo upload or submission flow; entries arrive as contact messages.
- **The FAQ answers are drafts** written for the page (Figma had placeholder text); edit them in `FAQ` in the page file.
- The homepage hero is still a fixed photo; featuring the month's space there is manual (replace `public/home/hero.jpg` and its alt text in `src/app/page.tsx`).

## Deviations from Figma
Sentence case (style.md): the FAQ question "How do you choose the Studio of the Month?" reads "How do you choose the photo of the month?", to match the section heading; the cut-off "Will my photo be used anywhere els" is completed.

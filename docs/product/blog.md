# Blog

Posts live at `/blog/<slug>`. Each one is a **standalone, hand-built landing page** (its own route folder), not a template filled from data. The `/blog` index lists them as cards that open the post in a **new tab** (`target="_blank"`).

**Index (`/blog`, Figma *Calendar* `287:4760`):** breadcrumbs (Calendar / Blog), then a grid of white cards, 3 across from 1024px, 2 from 640px, 1 on phones (gap 16, padding 24). Each card has the title (Newsreader Light 34/36, −0.68px), built as kicker + title in sentence case by `blogPostCardTitle`, above the post's `cover` (a designed collage at 405:310, separate from the share `image`). The design has no visible heading, so the page has an `sr-only` `<h1>`.

## Where things are
| What | Where |
|---|---|
| Post list (slug, title, kicker, meta title, description, keywords, date, share image, card cover) | [`src/lib/blogPosts.ts`](../../src/lib/blogPosts.ts). Feeds `/blog`, the sitemap, metadata and `Article` JSON-LD. `metaTitle` is used as the page `<title>` as-is (`title.absolute`, no site-name suffix) and for OG / X / JSON-LD `headline`; `keywords` go to `<meta name="keywords">` and JSON-LD. |
| Index page | [`src/app/blog/page.tsx`](../../src/app/blog/page.tsx) |
| A post's route | `src/app/blog/<slug>/page.tsx`: metadata, the landing component, `SiteFooter`, `blogPostJsonLd` |
| A post's landing | `src/components/blog/<name>/` (component + CSS module) |
| A post's images | `public/blog/<slug>/` (photos as JPG ≤2.5k px, cut-outs as WebP, vectors as SVG; `next/image` serves resized copies) |
| Scroll-scene engine | [`src/components/blog/ScrollScene.tsx`](../../src/components/blog/ScrollScene.tsx) |

`RootHeader` shows only a cream menu "+" under `/blog/<slug>`, because the landings carry their own wordmark. The `/blog` index keeps the normal header.

## Scroll scenes (the etsyedit.com pattern)
`<ScrollScene length={n}>` is `n` screens tall. Its stage sticks to the viewport while you scroll through it, and the scene's `--p` CSS variable runs from 0 to 1 over that distance. JS writes `--p` (and `--h`, see `hold`) once per animation frame, and everything else is CSS. Both come from the scene's scrolled distance, which is eased: each frame it moves 20% of the remaining way, which smooths out wheel steps. Each scene derives its phases from it, e.g. `--a: clamp(0, (var(--p) - 0.1) / 0.6, 1)`, eased as smoothstep. Text stays server-rendered and in the DOM, so SEO is unaffected.

- `mode="pin"`: always pinned.
- `mode="pin-desktop"`: pinned from 768px up. On mobile the stage flows normally, because its content is too tall to pin.
- `mode="view"`: never pinned. `--p` tracks the stage scrolling into view (used for entrance animations).
- **Stacking (each section covers the one before):** `hold={1}` keeps a scene's stage pinned for one more screen after its animation has finished (`--p` is already 1). The next scene sets `cover` (`margin-top: -100svh`, `z-index: 1`) and slides up over it. Use `cover="desktop"` when the scene before is `pin-desktop`; it only overlaps from 1024px up, because below that the scene before isn't pinned. Covering scenes need an opaque background colour under any texture image, or the scene below shows through while the image loads.
- **Staged fade-in instead of a slide** (the `.staged` class in the gift-guide CSS): the covering scene is transparent on desktop, so its slide is invisible. Once pinned, it fades in its background, then its copy, then its cards one by one. Give such a scene its fallback colour as `--bg` in `style`, **never as an inline `background`**: inline styles beat the `.staged` transparency rule, and the opaque sheet would then hide the pinned zoom (photo, veil, logo) underneath. The scene underneath must stay pinned for as long as the staged scene is pinned, so the staged scene must sit entirely inside its hold: underneath `hold` = staged `coverScreens` = staged `length + hold`. Otherwise the scene underneath scrolls away mid-way and the page background shows through. In this post every template shop's zoom has `hold={3.2}` and its details have `length={1.7} hold={1.5}`, which gives half a screen of rest before the next shop slides over. Choosing Keeping's zoom has `hold={3.5}` and its details `length={2} hold={1.5}`. Below 1024px the details don't pin, so `mobileHold` / `mobileCover` set these back to 1 there.
- `prefers-reduced-motion`: no pinning, no overlap, and `--p = 1`, so every scene shows its end state.

## Fonts (read before changing type)
The landing does **not** use the site-wide `--font-serif`. That instance is static Newsreader 300/600 with no optical-size axis, so a 102px title renders in the low-contrast *text* cut and looks heavier than Figma. Instead, `GiftGuide.tsx` serves the **variable** Newsreader (wght 200–800, opsz 6–72, latin; OFL, from Google Fonts) from `src/fonts/` via `next/font/local`, under its own family name (`--font-guide-serif`), with `font-optical-sizing: auto`. Like Figma, the browser then uses the high-contrast display cut for big type and the text cut for small type.

Don't load it through `next/font/google`: that registers a second family also named "Newsreader", which clashes with the site-wide faces, and the browser may pick either one for the same weight.

Weights and styles come from Figma per text layer. Check each one: "Light Italic" = 300 italic, "Regular" = 400, "Medium" = 500. In this post the hero kicker and title are both Light Italic, and "Winter 2026" is Regular, not italic.

## Posts
### Online Stores for Creative Christmas Gifts (2026-10-27)
**SEO:** meta title "Our Guide to Online Stores for Creative Christmas Gifts"; main keyword "creative Christmas gifts online", supporting: unique Christmas gifts, handmade gifts, gifts for friends, Secret Santa ideas, small online shops. **Share image** (`share.jpg`, 1200×630) is the landing's first screen: captured from the running page at 1200×630 (2× then downscaled) with the cookie banner, menu "+" and "Scroll" hint hidden. Re-capture it if the hero changes. The intro photo is separate (`intro-photo.jpg`, set in `GiftGuide.tsx`).

Figma *Calendar* `335:2017` is a 1440×850 storyboard of frames (27,703px tall). Every section slides over the one before it: hero → intro → Give A Pon → Wielonki → Tarta Gelatina → anna + nina → Choosing Keeping → GoodMood Prints → envelope → footer. Details sections are pinned only from 1024px up; on tablet and mobile they're taller than a screen, so they scroll normally. The CSS uses `--u` = one Figma px fitted to the screen (`min(100vw/1440, 100svh/850)`), so desktop matches the frames.

| File | Role |
|---|---|
| `gift-guide/GiftGuide.tsx` | Page order; the hero, intro, Choosing Keeping and envelope scenes |
| `gift-guide/shops.ts` | Data for the five template shops: copy, photo, logo (box centred on `cx, cy`; `mask: true` = cream fill through the image), paper texture / veil layers, collage cards, stars and link position, all in Figma px |
| `gift-guide/ShopStory.tsx` | The template: a zoom scene + a staged details scene per shop; `ShopCopy` is reused by Choosing Keeping |
| `gift-guide/ProductLink.tsx` | "Link to product ↗" and the arrow icons |

To add or change a template shop, edit `shops.ts`; the layout lives in the `.t*` rules in `GiftGuide.module.css`.

1. **Hero** (frames 0→1, 2.6 screens + 1 of hold): the title on velvet with gold stars. Then the background crossfades to red paper (30% over the wine), the title and wordmark fade out, and the red pocket (a folder) slides up. What's inside then comes out of it one by one, each from its own depth with its own drift and tilt, in Figma's layer order (back to front): the grid paper with the paper clip and "Winter 2026" (#600E1C), the polaroid with the clown photo, the Give A Pon slipper, the hanging mushroom ornament (it swings a little as it rises) and the "Baby, it's cold outside" mug; then the folder's front, and last the green star lands on it with a spin. The timings are `--f`, `--g`, `--k-s`, `--k-m`, `--k-c` and `--k-st` on `.hero`. The intro paragraph ("Every year, somewhere around…", Geist 20/32, #FFCCC8) rises with the pocket, printed on its front. A cream menu "+" sits top right (from `RootHeader`, which shows only that button on blog posts). On mobile the title and wordmark stay and move up instead, and the "Scroll" hint fades out as the pocket paragraph rises into its spot.
2. **Intro** (2→3): "Why I choose *unique* gifts…" in two columns; the photo comes into focus (blur 17px and a 60% wine overlay → clear).
3. **Template shops** (Give A Pon, Wielonki, Tarta Gelatina, anna + nina, GoodMood Prints). **Zoom:** the framed photo on the shop's paper texture grows to a larger frame, then to full-bleed, then the logo fades in (GoodMood has none) and fades back out with the veil (the details frames have no logo). In the hold, the paper veil (e.g. blue at 80%) fades in linearly with the scroll across one screen, while the transparent details scene slides in. **Details:** the copy (heading Newsreader Medium 32, two paragraphs Geist 20/32, then, 42px below, "Perfect for:" / "Shop:" in Newsreader Medium Italic 24/42 over Newsreader Italic 16 values, 16/22 and 16/30 for the shop link), then the collage card by card: the tilted back card, torn grid paper, the white product card, the star(s), "Link to product". Below 1024px the details draw the photo and veil themselves and stack. **Hover** (mouse only, `(hover: hover) and (pointer: fine)`): the tilted back card comes in front of the white card, straightens and lifts while the pointer is on it; on Choosing Keeping the moon comes in front of the clown. The stars (`.tStar`, `.ckStar`) twinkle while hovered: a looping `starTwinkle` keyframe (spin with a small pop) on the `rotate` / `scale` properties; off for reduced motion. Done with the individual `scale` / `rotate` / `translate` properties so the transition never lags the scroll-driven `transform`.
4. **Choosing Keeping** (bespoke): the framed moon on harlequin grows to full-bleed while the moon keeps its size. In the hold, the red paper (94%) fades in, the moon dims to 30% and the big cream logo appears (frame 11, `--f11` = `--h` 0→1). Then the logo leaves, the moon returns to full opacity and moves 141px right (`--f12`, `--h` 1→1.4), and the details appear: copy on the left, the clown ornament on torn paper, the green star and "Link to product". The moon must sit **above** the torn paper, but it belongs to the zoom scene underneath, so from the moment the details pin (zoom `--h` = 1 = details `--p` 0) the details draw an identical copy (`.ckMoonTop`, between the paper and the clown) and the zoom's moon hides.
5. **Envelope** (closing block before the footer, Figma 360:2990): on the velvet with gold stars, the green envelope rises out of the bottom (top 329 → 194 → 85). Then the pink star, the title "The gift is the feeling" (Newsreader Italic 400, 40/76, #433D1F) and the note (Geist Light 18/28) appear on the card. On phones the envelope is drawn as a close-up (1 Figma px = 100vw/414), and the title wraps.

Deviations from Figma: the post loads its own Newsreader cut (300/400/500 + italics); the site-wide one has only 300/600. Copy typos in the frames are fixed ("riends" → "friends", "f I'm" → "If I'm", "n the end" → "In the end", "prodcut" → "product"). The intro's two columns in Figma repeat the same text; the code splits it across them. A stray anna + nina wordmark under the Give A Pon details is left out. "Link to product" and the product card go to the featured product (`productUrl` in `shops.ts`; GoodMood has none yet, so it falls back to the homepage); "Shop:" goes to the shop homepage. The torn grid papers are exported from Figma as single WebP images rather than rebuilt from their masked vector layers.

## Later
The planned `posts` table and admin authoring ([decision #0004](../design/decisions.md)) suit plain article posts. Designed landings like this one stay as code.

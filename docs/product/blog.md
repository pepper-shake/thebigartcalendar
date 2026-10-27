# Blog

Posts live at `/blog/<slug>`. Each one is a **standalone, hand-built landing page** (its own route folder), not a template filled from data. The `/blog` index lists them as cards that open the post in a **new tab** (`target="_blank"`).

## Where things are
| What | Where |
|---|---|
| Post list (slug, title, kicker, description, date, cover) | [`src/lib/blogPosts.ts`](../../src/lib/blogPosts.ts). Feeds `/blog`, the sitemap, metadata and `Article` JSON-LD. |
| Index page | [`src/app/blog/page.tsx`](../../src/app/blog/page.tsx) |
| A post's route | `src/app/blog/<slug>/page.tsx`: metadata, the landing component, `SiteFooter`, `blogPostJsonLd` |
| A post's landing | `src/components/blog/<name>/` (component + CSS module) |
| A post's images | `public/blog/<slug>/` (photos as JPG ≤2.5k px, cut-outs as WebP, vectors as SVG; `next/image` serves resized copies) |
| Scroll-scene engine | [`src/components/blog/ScrollScene.tsx`](../../src/components/blog/ScrollScene.tsx) |

`RootHeader` hides itself under `/blog/<slug>` because the landings carry their own wordmark. The `/blog` index keeps the normal header.

## Scroll scenes (the etsyedit.com pattern)
`<ScrollScene length={n}>` is `n` screens tall. Its stage sticks to the viewport while you scroll through it, and the scene's `--p` CSS variable runs from 0 to 1 over that distance. JS writes `--p` (and `--h`, see `hold`) once per animation frame, and everything else is CSS. Both come from the scene's scrolled distance, which is eased: each frame it moves 20% of the remaining way, which smooths out wheel steps. Each scene derives its phases from it, e.g. `--a: clamp(0, (var(--p) - 0.1) / 0.6, 1)`, eased as smoothstep. Text stays server-rendered and in the DOM, so SEO is unaffected.

- `mode="pin"`: always pinned.
- `mode="pin-desktop"`: pinned from 768px up. On mobile the stage flows normally, because its content is too tall to pin.
- `mode="view"`: never pinned. `--p` tracks the stage scrolling into view (used for entrance animations).
- **Stacking (each section covers the one before):** `hold={1}` keeps a scene's stage pinned for one more screen after its animation has finished (`--p` is already 1). The next scene sets `cover` (`margin-top: -100svh`, `z-index: 1`) and slides up over it. Use `cover="desktop"` when the scene before is `pin-desktop`; it only overlaps from 1024px up, because below that the scene before isn't pinned. Covering scenes need an opaque background colour under any texture image, or the scene below shows through while the image loads.
- **Staged fade-in instead of a slide** (the `.staged` class in the gift-guide CSS): the covering scene is transparent on desktop, so its slide is invisible. Once pinned, it fades in its background, then its copy, then its cards one by one. The scene underneath must stay pinned for as long as the staged scene is pinned, so the staged scene must sit entirely inside its hold: underneath `hold` = staged `coverScreens` = staged `length + hold`. Otherwise the scene underneath scrolls away mid-way and the page background shows through. In this post, the anna + nina zoom has `hold={3.2}` and its details have `length={1.7} hold={1.5}`, which gives half a screen of rest before the red section slides over. Choosing Keeping uses the same pattern: zoom `hold={2.7}`, details `length={1.7} hold={1}` (the extra screen lets the envelope slide over it). Below 1024px the details don't pin, so `mobileHold` / `mobileCover` set these back to 1 there.
- `prefers-reduced-motion`: no pinning, no overlap, and `--p = 1`, so every scene shows its end state.

## Fonts (read before changing type)
The landing does **not** use the site-wide `--font-serif`. That instance is static Newsreader 300/600 with no optical-size axis, so a 102px title renders in the low-contrast *text* cut and looks heavier than Figma. Instead, `GiftGuide.tsx` serves the **variable** Newsreader (wght 200–800, opsz 6–72, latin; OFL, from Google Fonts) from `src/fonts/` via `next/font/local`, under its own family name (`--font-guide-serif`), with `font-optical-sizing: auto`. Like Figma, the browser then uses the high-contrast display cut for big type and the text cut for small type.

Don't load it through `next/font/google`: that registers a second family also named "Newsreader", which clashes with the site-wide faces, and the browser may pick either one for the same weight.

Weights and styles come from Figma per text layer. Check each one: "Light Italic" = 300 italic, "Regular" = 400, "Medium" = 500. In this post the hero kicker and title are both Light Italic, and "Winter 2026" is Regular, not italic.

## Posts
### Online Stores for Creative Christmas Gifts (2026-10-27)
Figma *Calendar* `335:2017` is a 1440×850 storyboard of frames. Every section slides over the one before it (hero → intro → anna + nina zoom → details → Choosing Keeping zoom → details). Details sections are pinned only from 1024px up; on tablet and mobile they're taller than a screen, so they scroll normally. The CSS uses `--u` = one Figma px fitted to the screen (`min(100vw/1440, 100svh/850)`), so desktop matches the frames.
1. **Hero** (frames 0→1): the title on velvet with gold stars. Then the background crossfades to red paper (30% over the wine), the title and wordmark fade out, and the red pocket slides up. Two groups are pulled out of it: the grid paper, with the paper clip, the hanging mushroom ornament, "Winter 2026" and the green star; and the polaroid with the clown photo. A cream menu "+" sits top right (from `RootHeader`, which shows only that button on blog posts). On mobile the title and wordmark stay and move up instead.
2. **Intro** (2→3): the photo comes into focus (blur 17px and a 60% wine overlay → clear).
3. **anna + nina** (4→6, zoom): the framed photo grows to a larger frame, then to full-bleed, then the wordmark fades in. **Details** (7), staged over the still-pinned photo: the blue texture at 80% fades in over the still-pinned full-bleed photo and wordmark, linearly with the scroll across one full screen. On desktop this veil belongs to the zoom scene and is driven by its `--h` (hold progress), so it fades while the transparent details scene slides in, with no dead scroll (Figma layers: photo → wordmark → texture 80%), then the copy appears (no small wordmark; the name is a screen-reader-only heading), then the cards (smaller navy card, torn paper, white card, link). Below 1024px nothing is pinned underneath, so the details draw the photo themselves.
4. **Choosing Keeping** (Figma frames 8 → 12): the framed moon on harlequin grows (8 → 9). The harlequin then goes full-bleed while the moon keeps its frame-9 size in the centre (10). In the zoom's hold, the red paper (94%) fades in over the harlequin, linearly across one screen of scroll (11). Then the details appear over the still-pinned moon (12): the cream logo (a mask over a cream fill), the copy and "Best for" on the left, then the clown ornament cut-out on the right, the green star and the two cream "Link to product" links (under the moon and under the clown), one by one. There is no card collage. Below 1024px the details draw the harlequin, red paper and moon themselves and stack them.
5. **Envelope** (closing block before the footer, Figma 355:2864 → 355:2929): slides over Choosing Keeping. On the velvet with gold stars (the hero's image), the green envelope (892×1128, with its card) rises out of the bottom (top 329 → 194 → 85). Then the title "Make this Christmas memorable" (Newsreader **Italic 400**, 40/76, −0.8px, #433D1F, one line) and the note (Geist Light 18/28, #433D1F) appear on the card. The last frame is a normal 850px screen, then the footer. On phones the envelope is drawn as a close-up (1 Figma px = 100vw/414), and the title wraps.

Deviations from Figma: the post loads its own Newsreader cut (300/400/500 + italics); the site-wide one has only 300/600. "Link to prodcut" is corrected to "Link to product", and product links go to the shop homepages. The two torn grid papers are exported from Figma as single PNG→WebP images rather than rebuilt from their masked vector layers.

## Later
The planned `posts` table and admin authoring ([decision #0004](../design/decisions.md)) suit plain article posts. Designed landings like this one stay as code.

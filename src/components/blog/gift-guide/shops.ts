// The template shops of the gift guide (Figma Calendar 335:2017). Each one is
// a zoom scene (a small framed photo grows to full-bleed, the shop's logo
// appears, then a paper layer fades over it) followed by a details scene
// (heading, two paragraphs, "Perfect for" / "Shop", and a card collage).
// Positions are Figma pixels at 1440×850. Collage positions are relative to
// the collage box (794×772, left 624 in the frame). Choosing Keeping has its
// own bespoke scenes in GiftGuide.tsx.

const A = '/blog/online-stores-for-creative-christmas-gifts';

export type Layer = { src: string; opacity?: number };
export type Box = { x: number; y: number; w: number; h: number };

export type Shop = {
  id: string;
  name: string;
  url: string;
  /** The featured product ("Link to product" and the product card); the shop homepage if not set. */
  productUrl?: string;
  /** Fallback colour under the paper texture (never see-through while loading). */
  bg: string;
  /** Paper texture(s) behind the zoom, bottom first. */
  texture: Layer[];
  photo: { src: string; w: number; h: number; alt: string; position: string };
  /** The shop's logo on the full-bleed photo, centred on (cx, cy). A `mask`
   *  logo is a cream fill through the image; otherwise the image itself. */
  logo?: { src: string; w: number; h: number; cx: number; cy: number; mask?: boolean; label: string };
  /** Paper layer(s) that fade in over the full-bleed photo (the details background). */
  veil: Layer[];
  heading: string;
  paragraphs: string[];
  perfectFor: string;
  shopLabel: string;
  /** Top of the text block, Figma px from the frame top. */
  textTop: number;
  /** Top of the collage box, Figma px from the frame top. */
  collageTop: number;
  backCard: { color: string; src: string; w: number; h: number; alt: string };
  productCard: { panel?: Box & { color: string }; img: Box & { src: string; iw: number; ih: number; alt: string } };
  stars: (Box & { src: string })[];
  link: { x: number; y: number };
};

const BIG_STAR = { x: 518, y: 90, w: 169, h: 194 };
const SMALL_STAR = { x: 698, y: 187, w: 72.3, h: 83 };

export const SHOPS: Record<'giveapon' | 'wielonki' | 'tartagelatina' | 'annanina' | 'goodmood', Shop> = {
  giveapon: {
    id: 'giveapon',
    name: 'Give A Pon',
    url: 'https://giveapon.nl',
    productUrl: 'https://giveapon.nl/en/collections/new/products/meraki',
    bg: '#1a3263',
    texture: [{ src: `${A}/blue-texture.jpg` }],
    photo: {
      src: `${A}/giveapon-photo.jpg`,
      w: 890,
      h: 1200,
      alt: 'A woman asleep on a leather sofa wearing Give A Pon pompom slippers',
      position: '50% 36%',
    },
    logo: { src: `${A}/giveapon-wordmark.webp`, w: 556, h: 174, cx: 720, cy: 425, mask: true, label: 'Give A Pon' },
    veil: [{ src: `${A}/blue-texture.jpg`, opacity: 0.8 }],
    heading: 'Give A Pon: handmade slippers that feel like a hug',
    paragraphs: [
      'If I could give only one gift this winter, it would be a pair of slippers from Give A Pon. This Dutch brand takes the traditional woollen Greek slipper and reimagines it in bright, original colour combinations. Each pair is handmade in a workshop in Greece, and the pompom on the toe comes from centuries-old Greek footwear.',
      'They’re warm, beautiful and a little unusual, which is exactly what a good gift should be. The shop also makes pyjamas and blankets if you want to build a full cosy-evening bundle.',
    ],
    perfectFor: 'the friend who’s always cold, new parents, anyone who deserves slow mornings.',
    shopLabel: 'giveapon.nl',
    textTop: 177,
    collageTop: 2,
    backCard: { color: '#143367', src: `${A}/giveapon-card.webp`, w: 640, h: 790, alt: 'Give A Pon embroidered slipper' },
    productCard: {
      panel: { x: 20, y: 20, w: 400, h: 488, color: '#d9aca7' },
      img: {
        x: 51, y: 41, w: 338, h: 417,
        src: `${A}/giveapon-slippers.webp`, iw: 640, ih: 790,
        alt: 'A pair of Give A Pon woollen slippers with flowers and pompoms',
      },
    },
    stars: [{ ...BIG_STAR, src: `${A}/star-red.svg` }],
    link: { x: 571, y: 604 },
  },

  wielonki: {
    id: 'wielonki',
    name: 'Wielonki',
    url: 'https://wielonki.pl',
    productUrl: 'https://wielonki.pl/produkt/czapka-blurred/',
    bg: '#962424',
    texture: [{ src: `${A}/red-texture.jpg` }],
    photo: {
      src: `${A}/wielonki-photo.jpg`,
      w: 1440,
      h: 1920,
      alt: 'A woman in a pink knitted headscarf behind a bouquet of red craspedia',
      position: '50% 8%',
    },
    logo: { src: `${A}/wielonki-logo.webp`, w: 516, h: 147, cx: 720, cy: 408.5, label: 'Wielonki' },
    veil: [{ src: `${A}/red-texture.jpg`, opacity: 0.7 }],
    heading: 'Wielonki: colourful headwear for grey days',
    paragraphs: [
      'There’s something about December light that makes me crave colour. That’s why I love Wielonki, a shop of handmade headwear made with natural materials in cheerful colours. Their ready-to-ship collection is perfect for Christmas, because you don’t have to wait for a piece to be made.',
      'A bright hat on a dark winter morning is a small thing, but it changes the whole day.',
    ],
    perfectFor: 'friends who walk everywhere, colour lovers, Secret Santa with a slightly bigger budget.',
    shopLabel: 'wielonki.pl',
    textTop: 177,
    collageTop: 2,
    backCard: { color: '#520b0e', src: `${A}/wielonki-card.jpg`, w: 800, h: 800, alt: 'Wielonki striped knitted headscarf' },
    productCard: {
      img: {
        x: 20, y: 20, w: 400, h: 488,
        src: `${A}/wielonki-hat.jpg`, iw: 900, ih: 900,
        alt: 'A fluffy striped Wielonki beanie in pink, yellow and lilac',
      },
    },
    stars: [{ ...BIG_STAR, src: `${A}/star-lime.svg` }],
    link: { x: 571, y: 604 },
  },

  tartagelatina: {
    id: 'tartagelatina',
    name: 'Tarta Gelatina',
    url: 'https://tartagelatina.com',
    productUrl: 'https://tartagelatina.com/products/helga-towel',
    bg: '#6f8d46',
    texture: [{ src: `${A}/green-texture.jpg` }],
    photo: {
      src: `${A}/tartagelatina-photo.jpg`,
      w: 1300,
      h: 1625,
      alt: 'A green and cream patterned Tarta Gelatina towel on a washing line against the sky',
      position: '47% 44%',
    },
    logo: { src: `${A}/tartagelatina-wordmark.webp`, w: 643, h: 109, cx: 715.5, cy: 434.5, mask: true, label: 'Tarta Gelatina' },
    veil: [{ src: `${A}/green-texture.jpg`, opacity: 0.7 }],
    heading: 'Tarta Gelatina: because you can never have enough towels',
    paragraphs: [
      'I’ll say it: there can never be enough nice towels. Tarta Gelatina makes patterned and striped towels, playful bathmats, bathrobes and table textiles, all in joyful colours and fun designs. They describe themselves as modern homewares for creative people, and that’s exactly how they feel.',
      'A beautiful towel turns an everyday routine into a small pleasure, and the recipient thinks of you every time they use it.',
    ],
    perfectFor: 'housewarming gifts, friends who love interiors, hosts of your New Year’s party.',
    shopLabel: 'tartagelatina.com',
    textTop: 157,
    collageTop: 2,
    backCard: { color: '#520b0e', src: `${A}/tartagelatina-card.jpg`, w: 800, h: 1000, alt: 'Pink striped Tarta Gelatina towel' },
    productCard: {
      img: {
        x: 20, y: 20, w: 400, h: 488,
        src: `${A}/tartagelatina-bathroom.jpg`, iw: 900, ih: 1125,
        alt: 'Tarta Gelatina towels hanging in a wood-panelled bathroom',
      },
    },
    stars: [
      { ...BIG_STAR, src: `${A}/star-orange.svg` },
      { ...SMALL_STAR, src: `${A}/star-orange-small.svg` },
    ],
    link: { x: 571, y: 604 },
  },

  annanina: {
    id: 'annanina',
    name: 'anna + nina',
    url: 'https://www.anna-nina.nl',
    productUrl: 'https://www.anna-nina.nl/collections/christmas/products/surviving-christmas-cocktail-glass-set-of-2',
    bg: '#1a3263',
    texture: [{ src: `${A}/blue-texture.jpg` }],
    photo: {
      src: `${A}/anna-nina-ornaments.jpg`,
      w: 1200,
      h: 1298,
      alt: 'Beaded Christmas ornaments from anna + nina: a mushroom, a letter and a striped bauble',
      position: '50% 58%',
    },
    logo: { src: `${A}/anna-nina-wordmark.webp`, w: 830, h: 92, cx: 720, cy: 406, mask: true, label: 'anna + nina' },
    veil: [{ src: `${A}/blue-texture.jpg`, opacity: 0.8 }],
    heading: 'Anna + Nina: playful homeware for a festive table',
    paragraphs: [
      'Anna + Nina is an Amsterdam brand, and for me its homeware is the real treasure. Think colourful glasses and carafes, mugs with sweet details like the “I Love You” tea mug, scalloped plates, quirky vases and cosy home decor. At Christmas, its collection grows to include ornaments, festive decorations and pieces for the Christmas table.',
      'These are the kind of gifts that make everyday moments a little more joyful, like morning coffee in a cup that makes you smile. And if you want to add a little sparkle, the brand makes jewellery too.',
    ],
    perfectFor: 'the friend hosting Christmas dinner, coffee and tea lovers, anyone who loves a beautifully set table.',
    shopLabel: 'anna-nina.nl',
    textTop: 147,
    collageTop: 42,
    backCard: { color: '#143367', src: `${A}/anna-nina-card.jpg`, w: 360, h: 448, alt: 'anna + nina Christmas ornament' },
    productCard: {
      panel: { x: 40, y: 40, w: 360, h: 448, color: '#c8d6ee' },
      img: {
        x: 17, y: 46, w: 425, h: 459,
        src: `${A}/anna-nina-glasses.webp`, iw: 1200, ih: 1297,
        alt: 'anna + nina coupe glasses with a harlequin gift box',
      },
    },
    stars: [{ ...BIG_STAR, src: `${A}/star-red.svg` }],
    link: { x: 571, y: 604 },
  },

  goodmood: {
    id: 'goodmood',
    name: 'GoodMood Prints',
    url: 'https://goodmoodprints.com',
    bg: '#4f7a4d',
    texture: [{ src: `${A}/green-texture.jpg` }, { src: `${A}/green-dark-texture.jpg`, opacity: 0.5 }],
    photo: {
      src: `${A}/goodmood-photo.jpg`,
      w: 1650,
      h: 1370,
      alt: 'A woman sitting on a rug next to a large framed print of a black and orange dog',
      position: '0% 43%',
    },
    veil: [
      { src: `${A}/green-texture.jpg`, opacity: 0.9 },
      { src: `${A}/green-dark-texture.jpg`, opacity: 0.5 },
    ],
    heading: 'GoodMood Prints: wall art that works for everyone',
    paragraphs: [
      'If I’m truly stuck on a gift, I go to GoodMood. It’s an online marketplace of prints by independent artists from around the world. Every purchase supports the artist directly, and that’s the part I love most. New collections launch every month, so there’s always something fresh.',
      'Prints come unframed or framed in black, white or natural oak. They’re made with eco-friendly inks and FSC-certified materials, and printed close to where they’re delivered.',
    ],
    perfectFor: 'almost anyone, corporate gifts, friends who just moved.',
    shopLabel: 'goodmoodprints.com',
    textTop: 169,
    collageTop: 2,
    backCard: { color: '#520b0e', src: `${A}/goodmood-card.jpg`, w: 565, h: 800, alt: 'GoodMood print of a cowboy holding a lamb' },
    productCard: {
      img: {
        x: 20, y: 20, w: 400, h: 488,
        src: `${A}/goodmood-print.jpg`, iw: 900, ih: 900,
        alt: 'GoodMood print of a blue and orange spotted bird',
      },
    },
    stars: [
      { ...BIG_STAR, src: `${A}/star-orange.svg` },
      { ...SMALL_STAR, src: `${A}/star-orange-small.svg` },
    ],
    link: { x: 588, y: 639 },
  },
};

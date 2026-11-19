// The four films of the Christmas movies post (Figma Calendar 380:2032). Each
// is the gift guide's zoom + details story (see gift-guide/ShopStory): a framed
// still grows to full-bleed, the title on its flourish appears, a paper layer
// fades over it, and the copy and a 4-still grid come in. Positions are Figma
// pixels at 1440×850.

import type { Box, Layer, Story } from '../gift-guide/shops';

export const A = '/blog/christmas-movies-to-watch-this-holiday-season';
const GUIDE = '/blog/online-stores-for-creative-christmas-gifts';

export type Film = Story & {
  id: string;
  heading: string;
  paragraphs: string[];
  perfectFor: string;
  grid: { src: string; alt: string };
  stars: (Box & { src: string })[];
  /** Text colour, when the frame's differs from the usual cream. */
  ink?: string;
};

const BIG_STAR = { w: 169, h: 194 };
// The details frames share one box: the grid (572 square) at (769, 139).
const COLLAGE_LEFT = 624;
const star = (x: number, y: number, src: string, size: Pick<Box, 'w' | 'h'> = BIG_STAR) => ({
  x: x - COLLAGE_LEFT,
  y,
  ...size,
  src: `${A}/${src}`,
});

// Title image: 1440×589 (the flourish), its centre at (cx, 392.5).
const title = (name: string, label: string, cx: number): Story['logo'] => ({
  src: `${A}/${name}-title.webp`,
  w: 1440,
  h: 589,
  cx,
  cy: 392.5,
  label,
  sizes: '(max-width: 767px) 100vw, 1440px',
  mobileScale: 0.5,
});

const RED: Layer[] = [{ src: `${GUIDE}/red-texture.jpg` }];
const RED_VEIL: Layer[] = [{ src: `${GUIDE}/red-texture.jpg`, opacity: 0.7 }];

export const FILMS: Film[] = [
  {
    id: 'grinch',
    name: 'How the Grinch Stole Christmas',
    bg: '#1a3263',
    texture: [{ src: `${GUIDE}/blue-texture.jpg` }],
    photo: {
      src: `${A}/grinch.jpg`,
      w: 900,
      h: 596,
      alt: 'Cindy Lou Who and the Grinch face to face in How the Grinch Stole Christmas',
      position: '34% 20%',
      scale: 1.33,
    },
    logo: title('grinch', 'How the Grinch Stole Christmas', 698),
    veil: [{ src: `${GUIDE}/blue-texture.jpg`, opacity: 0.8 }],
    textTop: 147,
    heading: 'How the Grinch Stole Christmas (2000)',
    paragraphs: [
      'Ron Howard’s live-action version of the Dr. Seuss classic is loud, colourful and wonderfully strange. Jim Carrey disappears completely into the green, grumpy Grinch, who lives on a mountain above Whoville and can’t stand the holidays. The film even won an Oscar for its makeup.',
      'Underneath all the chaos is a sweet story about loneliness, and about how one kind little girl, Cindy Lou Who, sees the good in someone everyone else has given up on. It’s a reminder that Christmas isn’t about presents. It’s about the people we share it with.',
    ],
    perfectFor: 'a family movie night with kids, or anyone who secretly feels a little Grinchy about the holiday rush.',
    grid: { src: `${A}/grinch-grid.jpg`, alt: 'Four stills from How the Grinch Stole Christmas' },
    stars: [star(1157, 54, 'star-red.svg')],
  },
  {
    id: 'eloise',
    name: 'Eloise at Christmastime',
    bg: '#962424',
    texture: RED,
    photo: {
      src: `${A}/eloise.jpg`,
      w: 640,
      h: 480,
      alt: 'Eloise and her Nanny, played by Julie Andrews, in a carriage in New York',
      position: '50% 0%',
      scale: 1.11,
    },
    logo: title('eloise', 'Eloise at Christmastime', 720),
    veil: RED_VEIL,
    textTop: 211,
    heading: 'Eloise at Christmastime (2003)',
    paragraphs: [
      'Based on Kay Thompson’s beloved books, this film follows Eloise, a six-year-old who lives at the Plaza Hotel in New York. At Christmas, the hotel is full of decorations, guests and a wedding in the making, and Eloise decides to help love find its way. Julie Andrews plays her patient, warm-hearted Nanny.',
      'It’s charming, elegant and full of that old New York holiday glow. Watching it feels like stepping into a snow globe.',
    ],
    perfectFor: 'a cosy night in with a hot chocolate, or a girls’ movie night with a little sparkle.',
    grid: { src: `${A}/eloise-grid.jpg`, alt: 'Four stills from Eloise at Christmastime' },
    stars: [star(1225, 54, 'star-lime.svg')],
  },
  {
    id: 'curly-sue',
    name: 'Curly Sue',
    bg: '#141414',
    texture: [{ src: `${A}/dark-texture.jpg` }],
    photo: {
      src: `${A}/curly-sue.jpg`,
      w: 988,
      h: 560,
      alt: 'Curly Sue and Bill together in a scene from Curly Sue',
      position: '58% 0%',
    },
    logo: title('curly-sue', 'Curly Sue', 724),
    veil: [{ src: `${A}/dark-texture.jpg`, opacity: 0.7 }],
    textTop: 157,
    ink: '#e3e3e3',
    heading: 'Curly Sue (1991)',
    paragraphs: [
      'Curly Sue isn’t a classic Christmas movie in the usual sense, but it has the warmth of one, and it has quietly become a winter favourite for many families. Written and directed by John Hughes, it follows Curly Sue, a clever little girl with a head of red curls, and her guardian Bill, played by Jim Belushi, as they get by on charm and small cons in wintry Chicago. Everything changes when they meet a wealthy lawyer who slowly lets them into her life.',
      'It’s a story about found family, about the people who become home, and that’s exactly what the holidays are about.',
    ],
    perfectFor: 'a quieter evening when you want something heartfelt, or watching with someone you consider family.',
    grid: { src: `${A}/curly-sue-grid.jpg`, alt: 'Four stills from Curly Sue' },
    stars: [star(1156, 42, 'star-green.svg'), star(1336, 139, 'star-green-small.svg', { w: 72.3, h: 83 })],
  },
  {
    id: 'home-alone',
    name: 'Home Alone',
    bg: '#962424',
    texture: RED,
    photo: {
      src: `${A}/home-alone.jpg`,
      w: 770,
      h: 417,
      alt: 'The McCallister family in a scene from Home Alone',
      position: '50% 20%',
      scale: 1.13,
    },
    logo: title('home-alone', 'Home Alone', 720),
    veil: RED_VEIL,
    textTop: 152,
    heading: 'Home Alone (1990)',
    paragraphs: [
      'No Christmas list is complete without it. When eight-year-old Kevin McCallister is accidentally left behind as his family flies to Paris for the holidays, he has to defend his house from two clumsy burglars. Macaulay Culkin is unforgettable as Kevin, and Joe Pesci and Daniel Stern are hilarious as the bandits. John Williams’ music makes the whole film feel like Christmas.',
      'It’s funny, it’s clever, and it has a surprisingly tender heart about family and belonging. Fun detail: Home Alone was written by John Hughes too, so it makes a perfect double feature with Curly Sue.',
    ],
    perfectFor: 'a big family gathering, a Christmas party with friends, or the night you finish wrapping presents.',
    grid: { src: `${A}/home-alone-grid.jpg`, alt: 'Four stills from Home Alone' },
    stars: [star(1225, 54, 'star-lime.svg')],
  },
];

/** The tips section: the same zoom on green paper, with no title. */
export const TIPS_STORY: Story = {
  name: 'My tips for the perfect Christmas movie night',
  bg: '#6f8d46',
  texture: [{ src: `${GUIDE}/green-texture.jpg` }, { src: `${GUIDE}/green-dark-texture.jpg`, opacity: 0.5 }],
  photo: {
    src: `${A}/ornaments.jpg`,
    w: 1128,
    h: 1470,
    alt: 'Vintage glass Christmas ornaments laid out on white linen',
    position: '50% 29%',
    scale: 1.39,
  },
  veil: [{ src: `${GUIDE}/green-texture.jpg`, opacity: 0.9 }, { src: `${GUIDE}/green-dark-texture.jpg`, opacity: 0.5 }],
  textTop: 314,
};

export const TIPS = [
  ['Make it a ritual.', 'Pick one evening a week in December and keep it just for films.'],
  ['Set the scene.', 'Blankets, fairy lights and something warm to drink turn any sofa into a cinema.'],
  ['Plan a double feature.', 'Pair Curly Sue and Home Alone for a John Hughes night.'],
  ['Add a little snack tradition.', 'Popcorn, gingerbread or hot chocolate makes the night feel special.'],
];

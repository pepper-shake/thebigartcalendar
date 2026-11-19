import localFont from 'next/font/local';

// Figma sets the blog landings in Newsreader 300/400/500 with italics, and
// renders it with the optical-size axis (opsz) on auto: big type (the 102px
// title) uses the high-contrast display cut, small type the text cut. So the
// landings serve the *variable* Newsreader files (wght 200–800, opsz 6–72,
// latin; OFL, from Google Fonts) under their own family name. Loading it
// through next/font/google would register a second "Newsreader" family that
// clashes with the site-wide static one (no opsz, only 300/600), and the
// browser could pick either face for the same weight.
export const guideSerif = localFont({
  src: [
    { path: '../../fonts/Newsreader-opsz-wght.latin.woff2', weight: '200 800', style: 'normal' },
    { path: '../../fonts/Newsreader-Italic-opsz-wght.latin.woff2', weight: '200 800', style: 'italic' },
  ],
  variable: '--font-guide-serif',
  fallback: ['Georgia', 'serif'],
});

import Link from 'next/link';

// Desktop header links either side of the wordmark (Figma "Home page"), on
// every page except blog posts. Positioned by `.header-nav` in globals.css,
// which keeps them level with the wordmark's first line as it shrinks.
const LEFT = [
  { label: 'Art events', href: '/calendar' },
  { label: 'Art places', href: '/places' },
  { label: 'Art shops', href: '/places?category=shop' },
];
const RIGHT = [
  { label: 'Blog', href: '/blog' },
  { label: 'About us', href: '/about' },
];

export default function HeaderNav() {
  return (
    <nav aria-label="Main" className="header-nav hidden lg:flex">
      {[LEFT, RIGHT].map((links, i) => (
        <ul key={i}>
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href}>{l.label}</Link>
            </li>
          ))}
        </ul>
      ))}
    </nav>
  );
}

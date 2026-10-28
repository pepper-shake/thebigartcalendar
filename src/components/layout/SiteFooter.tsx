import Link from 'next/link';
import { listActiveTypes } from '@/lib/events';
import { ConsentSettingsLink } from '@/components/analytics/Consent';

// Server-rendered footer (Figma "Calendar" node 318:2384). Its real <a> links
// give crawlers a path from every content page to the calendar, city and type
// hubs and the places directory.
const FOOTER_BG = '#999355';
const FOOTER_TEXT = '#FFFEF9';
const FOOTER_RULE = 'rgba(242, 239, 228, 0.4)';

const serif: React.CSSProperties = {
  fontFamily: 'var(--font-serif)',
  fontWeight: 300,
  fontSize: 24,
  lineHeight: '24px',
  letterSpacing: '-0.48px',
};
const meta: React.CSSProperties = {
  fontFamily: 'var(--font-meta)',
  fontWeight: 300,
  fontSize: 16,
  lineHeight: '26px',
};

type FooterLinkItem = { href: string; label: string };

/** `flush`: no top margin, for pages whose last section runs into the footer. */
export default async function SiteFooter({ flush = false }: { flush?: boolean } = {}) {
  const active = await listActiveTypes();
  // Figma also has "Event of the month" — left out until that page exists.
  const columns: FooterLinkItem[][] = [
    [
      { href: '/', label: 'All events' },
      { href: '/cities/lisbon', label: 'Art events in Lisbon' },
      { href: '/cities/porto', label: 'Art events in Porto' },
      // Type hubs with no upcoming events 404, so the link goes with them.
      ...(active.includes('workshop') ? [{ href: '/workshops', label: 'Workshops' }] : []),
    ],
    [
      { href: '/places', label: 'Art places' },
      { href: '/places?category=shop', label: 'Art shops' },
    ],
    [
      { href: '/blog', label: 'Blog' },
      { href: '/about', label: 'About us' },
      { href: '/contact', label: 'Contact' },
    ],
  ];

  return (
    <footer
      className={`${flush ? '' : 'mt-16 '}px-6 pt-12 md:px-16 md:pt-16`}
      style={{ backgroundColor: FOOTER_BG, color: FOOTER_TEXT }}
    >
      <div className="mx-auto flex max-w-[1440px] flex-col items-center gap-10 md:gap-[42px]">
        <Link
          href="/"
          className="text-center lowercase"
          style={{
            fontFamily: 'var(--font-serif)',
            fontWeight: 300,
            fontSize: 30,
            lineHeight: 0.93,
            letterSpacing: '-0.02em',
          }}
        >
          the big
          <br />
          art calendar.
        </Link>

        <div className="flex w-full flex-col gap-12 md:gap-[62px]">
          <div className="h-px w-full" style={{ backgroundColor: FOOTER_RULE }} />

          <div className="flex flex-col gap-12 lg:flex-row lg:justify-between lg:gap-16">
            <div className="flex flex-col gap-3 lg:max-w-[449px]">
              <h2 style={serif}>About us</h2>
              <p style={meta}>
                The Big Art Calendar is a non-commercial project created to make it easier to
                discover art events and creative things to do. I created it simply for fun and out
                of a love for art, culture, and creativity. Here you can find exhibitions,
                workshops, art spaces, and other ways to spend your time with art.
              </p>
            </div>

            <nav
              aria-label="Footer"
              className="grid grid-cols-1 gap-[14px] sm:grid-cols-3 sm:gap-8 lg:flex lg:gap-12 xl:gap-[82px]"
            >
              {columns.map((links, i) => (
                <ul
                  key={i}
                  className="flex flex-col gap-[14px] lg:whitespace-nowrap xl:min-w-[190px] xl:last:min-w-[130px]"
                >
                  {links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="hover:opacity-70 transition-opacity" style={serif}>
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              ))}
            </nav>
          </div>

          <div
            className="flex flex-col-reverse items-start gap-3 pb-6 sm:flex-row sm:items-center sm:justify-between"
            style={meta}
          >
            <p>© {new Date().getFullYear()} The Big Art Calendar. All rights reserved.</p>
            <ConsentSettingsLink className="text-left hover:opacity-70 transition-opacity" />
          </div>
        </div>
      </div>
    </footer>
  );
}

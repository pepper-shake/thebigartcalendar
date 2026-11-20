import Image from 'next/image';
import Link from 'next/link';
import { listActiveTypes } from '@/lib/events';
import { ConsentSettingsLink } from '@/components/analytics/Consent';

// Server-rendered footer (Figma "Calendar" node 424:5151 — "Default" 423:5115
// for desktop, "Mob" 424:5152 for phones). Its real <a> links give crawlers a
// path from every content page to the calendar, city and type hubs, places,
// blog and about pages.
const FOOTER_BG = '#999355';
const FOOTER_TEXT = '#FFFEF9';
const FOOTER_MUTED = '#CFCB99';

const meta: React.CSSProperties = {
  fontFamily: 'var(--font-meta)',
  fontWeight: 300,
  fontSize: 16,
  lineHeight: '26px',
};

type FooterLinkItem = { href: string; label: string };

/** Anna's portrait: the photo cropped to Figma's 82px circle mask. */
function Portrait() {
  return (
    <div
      className="relative size-[82px] shrink-0 overflow-hidden"
      style={{
        maskImage: 'url(/footer/anna-mask.png)',
        WebkitMaskImage: 'url(/footer/anna-mask.png)',
        maskSize: '82px 82px',
        WebkitMaskSize: '82px 82px',
      }}
    >
      <Image
        src="/footer/anna.jpg"
        alt="Anna Podvoiska"
        width={131}
        height={174}
        className="absolute left-[-25px] top-[-46px] h-[174px] w-[131px] max-w-none object-cover"
      />
    </div>
  );
}

/** `flush`: no top margin, for pages whose last section runs into the footer. */
export default async function SiteFooter({ flush = false }: { flush?: boolean } = {}) {
  const active = await listActiveTypes();
  const columns: FooterLinkItem[][] = [
    [
      { href: '/calendar', label: 'Calendar' },
      { href: '/cities/lisbon', label: 'Art events in Lisbon' },
      { href: '/cities/porto', label: 'Art events in Porto' },
      // Type hubs with no upcoming events 404, so the link goes with them.
      ...(active.includes('workshop') ? [{ href: '/workshops', label: 'Workshops' }] : []),
    ],
    [
      { href: '/places', label: 'Art spaces' },
      { href: '/places?category=shop', label: 'Art shops' },
      // Same target as the header's "This month" until it has its own page.
      { href: '/calendar', label: 'This month' },
      { href: '/where-art-happens', label: 'Where art happens' },
    ],
    [
      { href: '/blog', label: 'Blog' },
      { href: '/about', label: 'About' },
      { href: '/contact', label: 'Contact' },
    ],
  ];

  return (
    <footer
      className={`${flush ? '' : 'mt-16 '}px-[42px] pt-[42px]`}
      style={{ backgroundColor: FOOTER_BG, color: FOOTER_TEXT }}
    >
      <div className="flex flex-col items-center gap-[42px]">
        <Link href="/" aria-label="The Big Art Calendar — home">
          <Image src="/footer/logo.svg" alt="" width={163} height={56} className="block h-[56px] w-[163px]" />
        </Link>

        <div className="flex w-full flex-col">
          {/* Mob: links first, then the portrait + bio. Default: bio left, links right. */}
          <div className="flex flex-col gap-[35px] pb-[42px] pt-4 lg:flex-row-reverse lg:items-end lg:justify-between lg:gap-[42px]">
            <nav
              aria-label="Footer"
              className="flex flex-col gap-[18px] text-[22px] tracking-[-0.44px] md:flex-row md:gap-12 lg:gap-[22px] lg:text-[18px] lg:tracking-[-0.36px]"
              style={{ fontFamily: 'var(--font-serif)', fontWeight: 300 }}
            >
              {columns.map((links, i) => (
                <ul
                  key={i}
                  className="flex flex-col gap-[18px] md:gap-[14px] md:whitespace-nowrap lg:w-[160px] lg:last:w-[110px]"
                >
                  {links.map((l) => (
                    <li key={l.label} className="leading-[24px]">
                      <Link href={l.href} className="transition-opacity hover:opacity-70">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              ))}
            </nav>

            <div className="flex flex-col gap-3 lg:max-w-[590px]">
              <Portrait />
              <p style={meta}>
                Hello! I’m Anna Podvoiska, an artist, maker and designer. For me, art is a way to
                stay whole in a difficult world. I draw, build things and turn old objects into new
                ones. I started Big Art Calendar as a non-commercial project, out of love, so others
                can find their people, learn new techniques and spend time making art that heals.
              </p>
            </div>
          </div>

          <div
            className="flex flex-col items-start gap-3 pb-6 md:flex-row md:items-center md:justify-between"
            style={{ ...meta, color: FOOTER_MUTED }}
          >
            <p>© {new Date().getFullYear()} The Big Art Calendar. All rights reserved.</p>
            <ConsentSettingsLink className="text-left transition-opacity hover:opacity-70" />
          </div>
        </div>
      </div>
    </footer>
  );
}

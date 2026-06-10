import Link from 'next/link';
import { EVENT_TYPES } from '@/lib/eventTypes';

// Server-rendered footer. Its real <a> links give crawlers a path from every
// content page to the type + city hubs (which in turn link to event pages).
export default function SiteFooter() {
  return (
    <footer
      className="border-t border-black/10 px-6 py-12 mt-16"
      style={{ backgroundColor: '#FBFAF6' }}
    >
      <div className="max-w-6xl mx-auto grid grid-cols-2 gap-8 sm:grid-cols-4">
        <div className="col-span-2 sm:col-span-1">
          <Link
            href="/"
            className="text-black lowercase"
            style={{
              fontFamily: 'var(--font-host-grotesk)',
              fontWeight: 800,
              fontSize: 22,
              lineHeight: 1,
              letterSpacing: '-1px',
            }}
          >
            the big
            <br />
            art calendar.
          </Link>
        </div>

        <FooterCol title="Browse">
          {EVENT_TYPES.map((t) => (
            <FooterLink key={t.slug} href={`/${t.slug}`}>
              {t.plural}
            </FooterLink>
          ))}
          <FooterLink href="/cities">By city</FooterLink>
        </FooterCol>

        <FooterCol title="Calendar">
          <FooterLink href="/">All events</FooterLink>
        </FooterCol>

        <FooterCol title="More">
          <FooterLink href="/about">About</FooterLink>
          <FooterLink href="/blog">Blog</FooterLink>
          <FooterLink href="/contact">Contact</FooterLink>
        </FooterCol>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2
        className="text-black/40 uppercase tracking-widest mb-3"
        style={{ fontFamily: 'var(--font-host-grotesk)', fontWeight: 600, fontSize: 12 }}
      >
        {title}
      </h2>
      <ul className="flex flex-col gap-2">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="text-black/70 hover:text-black hover:underline underline-offset-2"
        style={{ fontFamily: 'var(--font-oxygen)', fontWeight: 300, fontSize: 15 }}
      >
        {children}
      </Link>
    </li>
  );
}

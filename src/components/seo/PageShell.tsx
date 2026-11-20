import SiteFooter from '@/components/layout/SiteFooter';
import NewsletterSignup from '@/components/home/NewsletterSignup';
import { type NewsletterSource } from '@/lib/newsletter';

// Server-rendered page wrapper matching the site's about/blog pages, with the
// shared footer (internal links) below the content. `newsletter` adds the
// newsletter band straight above the footer (that sign-up source).
export default function PageShell({
  children,
  wide = false,
  size,
  newsletter,
}: {
  children: React.ReactNode;
  wide?: boolean;
  size?: 'default' | 'wide' | 'full' | 'bleed';
  newsletter?: NewsletterSource;
}) {
  const resolved = size ?? (wide ? 'wide' : 'default');
  const maxWidth =
    resolved === 'full' ? '' : resolved === 'wide' ? 'max-w-6xl' : 'max-w-2xl';
  // 'bleed': no width or padding, for pages with full-width colour bands that
  // centre their own content (e.g. /places/[slug]).
  const mainClass = resolved === 'bleed' ? 'flex-1 w-full' : `flex-1 px-6 md:px-[42px] py-12 w-full mx-auto ${maxWidth}`;
  return (
    <div className="min-h-full flex flex-col" style={{ backgroundColor: 'var(--page)' }}>
      <main className={mainClass}>
        {children}
      </main>
      {newsletter && <NewsletterSignup source={newsletter} />}
      <SiteFooter flush={!!newsletter} />
    </div>
  );
}

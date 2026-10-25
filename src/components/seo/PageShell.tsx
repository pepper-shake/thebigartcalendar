import SiteFooter from '@/components/layout/SiteFooter';

// Server-rendered page wrapper matching the site's about/blog pages, with the
// shared footer (internal links) below the content.
export default function PageShell({
  children,
  wide = false,
  size,
}: {
  children: React.ReactNode;
  wide?: boolean;
  size?: 'default' | 'wide' | 'full' | 'bleed';
}) {
  const resolved = size ?? (wide ? 'wide' : 'default');
  const maxWidth =
    resolved === 'full' ? 'max-w-[1440px]' : resolved === 'wide' ? 'max-w-6xl' : 'max-w-2xl';
  // 'bleed': no width or padding, for pages with full-width colour bands that
  // centre their own content (e.g. /places/[slug]).
  const mainClass = resolved === 'bleed' ? 'flex-1 w-full' : `flex-1 px-6 py-12 w-full mx-auto ${maxWidth}`;
  return (
    <div className="min-h-full flex flex-col" style={{ backgroundColor: 'var(--page)' }}>
      <main className={mainClass}>
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}

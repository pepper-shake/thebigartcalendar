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
  size?: 'default' | 'wide' | 'full';
}) {
  const resolved = size ?? (wide ? 'wide' : 'default');
  const maxWidth =
    resolved === 'full' ? 'max-w-[1440px]' : resolved === 'wide' ? 'max-w-6xl' : 'max-w-2xl';
  return (
    <div className="min-h-full flex flex-col" style={{ backgroundColor: '#FBFAF6' }}>
      <main className={`flex-1 px-6 py-12 w-full mx-auto ${maxWidth}`}>
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}

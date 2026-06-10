import SiteFooter from '@/components/layout/SiteFooter';

// Server-rendered page wrapper matching the site's about/blog pages, with the
// shared footer (internal links) below the content.
export default function PageShell({
  children,
  wide = false,
}: {
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="min-h-full flex flex-col" style={{ backgroundColor: '#FBFAF6' }}>
      <main
        className={`flex-1 px-6 py-12 w-full mx-auto ${wide ? 'max-w-6xl' : 'max-w-2xl'}`}
      >
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}

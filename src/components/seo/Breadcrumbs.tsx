import Link from 'next/link';
import JsonLd from './JsonLd';
import { breadcrumbJsonLd } from '@/lib/jsonld';
import { absoluteUrl } from '@/lib/site';

export interface Crumb {
  name: string;
  href: string;
}

// Visible breadcrumb trail + matching BreadcrumbList JSON-LD (absolute URLs),
// from one list of crumbs. `colors` overrides the trail and current-page
// colours (place pages: grey trail, oxblood place name).
export default function Breadcrumbs({
  items,
  colors,
  className = 'mb-6',
}: {
  items: Crumb[];
  colors?: { trail: string; current: string };
  className?: string;
}) {
  return (
    <>
      <nav aria-label="Breadcrumb" className={className}>
        <ol
          className={`flex flex-wrap items-center gap-2 ${colors ? '' : 'text-ink/60'}`}
          style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 18, lineHeight: '24px', color: colors?.trail }}
        >
          {items.map((c, i) => {
            const last = i === items.length - 1;
            return (
              <li key={c.href} className="flex items-center gap-2">
                {i > 0 && <span aria-hidden="true">/</span>}
                {last ? (
                  <span className={colors ? '' : 'text-ink'} style={{ color: colors?.current }} aria-current="page">
                    {c.name}
                  </span>
                ) : (
                  <Link href={c.href} className={colors ? 'hover:underline' : 'hover:text-ink hover:underline'}>
                    {c.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <JsonLd
        data={breadcrumbJsonLd(
          items.map((c) => ({ name: c.name, url: absoluteUrl(c.href) })),
        )}
      />
    </>
  );
}

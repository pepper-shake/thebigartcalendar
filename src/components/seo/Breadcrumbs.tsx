import Link from 'next/link';
import JsonLd from './JsonLd';
import { breadcrumbJsonLd } from '@/lib/jsonld';
import { absoluteUrl } from '@/lib/site';

export interface Crumb {
  name: string;
  href: string;
}

// Visible breadcrumb trail + matching BreadcrumbList JSON-LD (absolute URLs),
// from one list of crumbs.
export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol
          className="flex flex-wrap items-center gap-2 text-[#909090]"
          style={{ fontFamily: 'var(--font-oxygen)', fontWeight: 400, fontSize: 18, lineHeight: '24px' }}
        >
          {items.map((c, i) => {
            const last = i === items.length - 1;
            return (
              <li key={c.href} className="flex items-center gap-2">
                {i > 0 && <span aria-hidden="true">/</span>}
                {last ? (
                  <span className="text-black" aria-current="page">
                    {c.name}
                  </span>
                ) : (
                  <Link href={c.href} className="hover:text-black hover:underline">
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

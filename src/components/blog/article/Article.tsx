import Image from 'next/image';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import { blogPostPath, type BlogPost } from '@/lib/blogPosts';
import styles from './Article.module.css';

// The plain article layout for `layout: 'article'` posts (news, short reads):
// breadcrumbs, kicker, title, lead, a hero photo, then the post's own body.
// Everything is server-rendered; no Figma frame, built to docs/design/style.md.
export default function Article({
  post,
  kicker,
  lead,
  hero,
  children,
}: {
  post: BlogPost;
  /** Small Geist line above the title, e.g. "News · Lisbon". */
  kicker?: string;
  lead: React.ReactNode;
  hero?: { src: string; alt: string; width: number; height: number; credit?: string };
  children: React.ReactNode;
}) {
  const date = new Date(`${post.publishedAt}T12:00:00Z`);
  return (
    <article className={styles.article}>
      <Breadcrumbs
        items={[
          { name: 'Calendar', href: '/calendar' },
          { name: 'Blog', href: '/blog' },
          { name: post.title, href: blogPostPath(post.slug) },
        ]}
      />
      <header className={styles.head}>
        <p className={styles.kicker}>
          {kicker && <>{kicker} · </>}
          <time dateTime={post.publishedAt}>
            {date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })}
          </time>
        </p>
        <h1 className={styles.title}>{post.title}</h1>
        <p className={styles.lead}>{lead}</p>
      </header>
      {hero && (
        <figure className={styles.hero}>
          <Image
            src={hero.src}
            alt={hero.alt}
            width={hero.width}
            height={hero.height}
            sizes="(min-width: 608px) 560px, 100vw"
            priority
          />
          {hero.credit && <figcaption>{hero.credit}</figcaption>}
        </figure>
      )}
      <div className={styles.body}>{children}</div>
    </article>
  );
}

/** A duotone panel of key facts (dates, hours, address, link). */
export function KeyInfo({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <aside className={styles.info}>
      <h2>{title}</h2>
      <dl>{children}</dl>
    </aside>
  );
}

export function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

/** A muted aside for caveats ("Please note: …"). */
export function Note({ children }: { children: React.ReactNode }) {
  return <p className={styles.note}>{children}</p>;
}

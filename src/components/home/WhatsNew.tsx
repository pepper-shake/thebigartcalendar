import Image from 'next/image';
import { formatDateShort } from '@/lib/format';
import { eventSlug } from '@/lib/slug';
import { blogPostCardTitle, blogPostPath } from '@/lib/blogPosts';
import type { WhatsNewItem } from '@/lib/whatsNew';
import BlogCardLink from '@/components/analytics/BlogCardLink';
import TrackedLink from '@/components/analytics/TrackedLink';
import s from './Home.module.css';


function placeLabel(city?: string, country?: string): string {
  const parts = [city, country].filter(Boolean);
  return parts.length ? parts.join(', ') : 'Virtual';
}

function Card({ item, lead, position }: { item: WhatsNewItem; lead: boolean; position: number }) {
  if (item.kind === 'post') {
    const { post } = item;
    return (
      // Posts are standalone landings, opened in their own tab (as on /blog).
      <BlogCardLink
        slug={post.slug}
        href={blogPostPath(post.slug)}
        className={s.feedItem}
        also={{ event: 'whats_new_click', params: { kind: 'post', item: post.slug, position } }}
      >
        <div className={s.feedImg}>
          <Image
            src={post.cover}
            alt={post.coverAlt}
            fill
            sizes={lead ? '(min-width: 481px) 60vw, 90vw' : '(min-width: 481px) 30vw, 90vw'}
          />
        </div>
        <p className={s.feedMeta}>{formatDateShort(post.publishedAt)}</p>
        <h3 className={s.feedTitle}>{blogPostCardTitle(post)}</h3>
        {lead && <p className={`${s.feedExcerpt} line-clamp-4`}>{post.description}</p>}
      </BlogCardLink>
    );
  }

  const { event } = item;
  return (
    <TrackedLink
      href={`/events/${eventSlug(event)}`}
      event="whats_new_click"
      params={{ kind: 'event', item: eventSlug(event), position }}
      className={s.feedItem}
    >
      <div className={s.feedImg}>
        {event.image && (
          // eslint-disable-next-line @next/next/no-img-element -- scraped remote images, as in EventCard
          <img src={event.image} alt={event.title} loading="lazy" />
        )}
      </div>
      <p className={s.feedMeta}>
        {placeLabel(event.city, event.country)} · {formatDateShort(event.date)}
        {event.startTime ? ` · ${event.startTime}` : ''}
      </p>
      <h3 className={s.feedTitle}>{event.title}</h3>
      {lead && event.description && <p className={`${s.feedExcerpt} line-clamp-4`}>{event.description}</p>}
    </TrackedLink>
  );
}

/** "What's new?": Myoan's feed grid (lead card over two thirds, two beside it,
 *  then rows of three) mixing upcoming events with blog posts. */
export default function WhatsNew({ items }: { items: WhatsNewItem[] }) {
  if (!items.length) return null;
  return (
    <section aria-labelledby="whats-new" className={s.feed} style={{ backgroundColor: 'var(--page)', color: 'var(--ink)' }}>
      <div className={s.wrap}>
        <h2 id="whats-new" className={s.feedHeading}>
          What&rsquo;s new?
        </h2>
        <div className={s.feedGrid}>
          {items.map((item, i) => (
            <Card key={item.kind === 'post' ? item.post.slug : item.event.id} item={item} lead={i === 0} position={i + 1} />
          ))}
        </div>
      </div>
    </section>
  );
}

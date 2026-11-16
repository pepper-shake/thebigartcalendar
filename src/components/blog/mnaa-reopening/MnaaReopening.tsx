import Link from 'next/link';
import Article, { InfoRow, KeyInfo, Note } from '@/components/blog/article/Article';
import type { BlogPost } from '@/lib/blogPosts';

export const MNAA_URL = 'http://www.museudearteantiga.pt';
// The announcement this post is based on (Recuperar Portugal / PRR).
const SOURCE_URL =
  'https://recuperarportugal.gov.pt/museu-nacional-de-arte-antiga-reabre-a-21-de-novembro-com-apoio-do-prr/';
const A = '/blog/museu-nacional-de-arte-antiga-reopens-with-free-entry';

// News: the Museu Nacional de Arte Antiga reopens on 21 November 2026.
export default function MnaaReopening({ post }: { post: BlogPost }) {
  return (
    <Article
      post={post}
      kicker="News · Lisbon"
      hero={{
        src: `${A}/hero.jpg`,
        alt: 'The museum\'s reopening poster: "voltámos, we are back, 21/11" over a Namban screen of Portuguese merchants arriving in Japan',
        width: 800,
        height: 1000,
        credit: 'Poster: Museu Nacional de Arte Antiga',
      }}
      lead={
        <>
          Great news for art lovers: on 21 November, after more than a year of restoration, the Museu Nacional de
          Arte Antiga (the National Museum of Ancient Art) in Lisbon opens its doors again.
        </>
      }
    >
      <p>
        €8.5 million went into the restoration. The historic rooms have been renovated, the Capela das Albertas
        chapel has been fully restored, and the exhibition galleries and auditorium have been modernised.
      </p>

      <h2>Why visit?</h2>
      <p>
        It is one of the most important art museums in Portugal, home to around 40,000 works of art from the Middle
        Ages to the 19th century.
      </p>
      <p>
        The collection includes works by European masters, painting, sculpture, jewellery, antique furniture and
        true national treasures of Portugal.
      </p>

      <h2>The opening weekend, 21–22 November</h2>
      <p>To celebrate the reopening, the museum has prepared a special programme:</p>
      <ul>
        <li>New temporary exhibitions and refreshed displays</li>
        <li>Concerts and cultural events</li>
        <li>Guided tours of the museum</li>
        <li>Creative workshops</li>
      </ul>
      <p>
        And the best part: from 21 November to 1 December inclusive, <em>entry is free</em>.
      </p>

      <KeyInfo title="Plan your visit">
        <InfoRow label="Opening">Saturday 21 November, 15:00</InfoRow>
        <InfoRow label="Free entry">21 November – 1 December, inclusive</InfoRow>
        <InfoRow label="Saturday 21 November">15:00–20:00</InfoRow>
        <InfoRow label="Sunday 22 November">10:00–18:00</InfoRow>
        <InfoRow label="Where">Museu Nacional de Arte Antiga, Rua das Janelas Verdes, Lisbon</InfoRow>
        <InfoRow label="More">
          <a href={MNAA_URL} target="_blank" rel="noopener">
            Official reopening information ↗
          </a>
        </InfoRow>
      </KeyInfo>

      <p>
        A lovely excuse for a cultural weekend: get to know Portuguese art and be among the first to see the
        renewed museum. For more of what&apos;s on, see <Link href="/cities/lisbon">art events in Lisbon</Link>.
      </p>

      <Note>
        Please note: on 21 November the museum reopens only partially, so not every room will be open straight away.
      </Note>

      <p className="text-[15px] leading-6 opacity-70" style={{ fontFamily: 'var(--font-meta)' }}>
        Source:{' '}
        <a href={SOURCE_URL} target="_blank" rel="noopener">
          Recuperar Portugal
        </a>
        , with details from the museum.
      </p>
    </Article>
  );
}

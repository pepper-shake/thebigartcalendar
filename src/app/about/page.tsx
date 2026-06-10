import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'About — The Big Art Calendar',
  description: 'The Big Art Calendar is a free portal that aggregates art events across Europe — exhibitions, workshops, fairs, performances, and more — so you never miss what matters.',
};

export default function AboutPage() {
  return (
    <div className="min-h-full flex flex-col" style={{ backgroundColor: '#FBFAF6' }}>
      <main className="flex-1 px-6 py-16 max-w-2xl mx-auto w-full">

        <h1
          className="text-black lowercase mb-12"
          style={{
            fontFamily: 'var(--font-host-grotesk)',
            fontWeight: 800,
            fontSize: 'clamp(56px, 8vw, 82px)',
            lineHeight: 0.95,
            letterSpacing: '-2px',
          }}
        >
          About
        </h1>

        <div
          className="space-y-8 text-black"
          style={{ fontFamily: 'var(--font-oxygen)', fontWeight: 300, fontSize: 18, lineHeight: '28px' }}
        >
          <p>
            The Big Art Calendar is a free portal for art events across Europe. The calendar is the main page — every visitor lands there and can browse upcoming exhibitions, workshops, lectures, short courses, competitions, and meetups.
          </p>

          <p>
            <strong style={{ fontWeight: 700 }}>The problem it solves:</strong> art lovers and creative professionals often miss events or find out too late to plan travel and book tickets at a good price. This portal gives them a single place to discover what&apos;s happening, plan ahead, and never miss an event that matters to them.
          </p>

          <p>
            <strong style={{ fontWeight: 700 }}>Audience:</strong> artists, designers, curators, and anyone with a general interest in the arts across Europe.
          </p>

          <p>
            <strong style={{ fontWeight: 700 }}>How it works:</strong> events are scraped daily from art institution and gallery websites, normalised, and stored in a database. The calendar updates automatically every day so the information is always current.
          </p>
        </div>

      </main>
    </div>
  );
}

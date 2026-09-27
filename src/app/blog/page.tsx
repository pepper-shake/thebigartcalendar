import type { Metadata } from 'next';
import { REGION_ADJECTIVE } from '@/lib/site';
export const metadata: Metadata = {
  title: 'Blog — The Big Art Calendar',
  description: `Writing about art events, the ${REGION_ADJECTIVE} art scene, and how to get the most out of The Big Art Calendar.`,
};

export default function BlogPage() {
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
          Blog
        </h1>

        <p
          className="text-black/40"
          style={{ fontFamily: 'var(--font-oxygen)', fontWeight: 300, fontSize: 18, lineHeight: '28px' }}
        >
          No posts yet — check back soon.
        </p>

      </main>
    </div>
  );
}

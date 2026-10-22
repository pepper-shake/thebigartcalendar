import type { Metadata } from 'next';
import ContactForm from './ContactForm';

export const metadata: Metadata = {
  title: 'Contact — The Big Art Calendar',
  description: 'Get in touch with The Big Art Calendar team — suggest an event source, report an issue, or just say hello.',
};

export default function ContactPage() {
  return (
    <div className="min-h-full flex flex-col" style={{ backgroundColor: 'var(--page)' }}>
      <main className="flex-1 px-6 py-16 max-w-2xl mx-auto w-full">

        <h1
          className="text-ink lowercase mb-12"
          style={{
            fontFamily: 'var(--font-serif)',
            fontWeight: 300,
            fontSize: 'clamp(56px, 8vw, 82px)',
            lineHeight: 0.95,
            letterSpacing: '-2px',
          }}
        >
          Contact
        </h1>

        <ContactForm />

      </main>
    </div>
  );
}

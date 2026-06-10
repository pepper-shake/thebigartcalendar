'use client';

import { useState } from 'react';

const inputStyle = {
  fontFamily: 'var(--font-oxygen)',
  fontWeight: 300,
  fontSize: 16,
} as const;

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Submission logic to be wired up
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <p
        className="text-black"
        style={{ fontFamily: 'var(--font-oxygen)', fontWeight: 300, fontSize: 18, lineHeight: '28px' }}
      >
        Thank you — we&apos;ll be in touch soon.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label
          htmlFor="name"
          className="text-black"
          style={{ ...inputStyle, fontSize: 14, letterSpacing: '0.05em', textTransform: 'uppercase' }}
        >
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          className="w-full bg-transparent border-b border-black/30 focus:border-black outline-none py-2 text-black transition-colors"
          style={inputStyle}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="email"
          className="text-black"
          style={{ ...inputStyle, fontSize: 14, letterSpacing: '0.05em', textTransform: 'uppercase' }}
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full bg-transparent border-b border-black/30 focus:border-black outline-none py-2 text-black transition-colors"
          style={inputStyle}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="message"
          className="text-black"
          style={{ ...inputStyle, fontSize: 14, letterSpacing: '0.05em', textTransform: 'uppercase' }}
        >
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className="w-full bg-transparent border-b border-black/30 focus:border-black outline-none py-2 text-black resize-none transition-colors"
          style={inputStyle}
        />
      </div>

      <div>
        <button
          type="submit"
          className="text-black border border-black px-8 py-3 hover:bg-black hover:text-[#FBFAF6] transition-colors"
          style={{
            fontFamily: 'var(--font-host-grotesk)',
            fontWeight: 800,
            fontSize: 16,
            letterSpacing: '-0.02em',
          }}
        >
          Send
        </button>
      </div>
    </form>
  );
}

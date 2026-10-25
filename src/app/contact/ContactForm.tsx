'use client';

import { useState } from 'react';

const inputStyle = {
  fontFamily: 'var(--font-serif)',
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
        className="text-ink"
        style={{ fontFamily: 'var(--font-serif)', fontWeight: 300, fontSize: 18, lineHeight: '28px' }}
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
          className="text-ink"
          style={{ ...inputStyle, fontSize: 16, fontStyle: 'italic' }}
        >
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          className="w-full bg-transparent border-b border-ink/30 focus:border-ink outline-none py-2 text-ink transition-colors"
          style={inputStyle}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="email"
          className="text-ink"
          style={{ ...inputStyle, fontSize: 16, fontStyle: 'italic' }}
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full bg-transparent border-b border-ink/30 focus:border-ink outline-none py-2 text-ink transition-colors"
          style={inputStyle}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="message"
          className="text-ink"
          style={{ ...inputStyle, fontSize: 16, fontStyle: 'italic' }}
        >
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className="w-full bg-transparent border-b border-ink/30 focus:border-ink outline-none py-2 text-ink resize-none transition-colors"
          style={inputStyle}
        />
      </div>

      <div>
        <button
          type="submit"
          className="bg-ink text-page px-6 py-[18px] hover:bg-ink/10 hover:text-ink transition-colors duration-[250ms] ease-out"
          style={{
            fontFamily: 'var(--font-serif)',
            fontWeight: 300,
            fontSize: 32,
            lineHeight: 1.1,
          }}
        >
          Send
        </button>
      </div>
    </form>
  );
}

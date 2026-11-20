'use client';

import { useActionState, useEffect } from 'react';
import { trackEvent } from '@/lib/analytics';
import { subscribeToNewsletter, type SignupState } from '@/app/actions/newsletter';
import { CARD_SCHEMES } from '@/lib/eventColor';
import { NEWSLETTER_CONSENT, type NewsletterSource } from '@/lib/newsletter';
import s from './Home.module.css';

// Figma "Home page": a blush band with oxblood text and button (the blush card scheme).
const BLUSH = CARD_SCHEMES[0];

/** Newsletter sign-up band (homepage, Where art happens). A plain form posting
 *  to a server action, so it also works before hydration / without JS. */
export default function NewsletterSignup({ source = 'home' }: { source?: NewsletterSource }) {
  const [state, action, pending] = useActionState<SignupState, FormData>(subscribeToNewsletter, { status: 'idle' });

  // A key event (conversion) in GA4: see docs/references/analytics.md.
  useEffect(() => {
    if (state.status === 'ok') trackEvent('newsletter_signup', { source });
  }, [state.status, source]);

  return (
    <section
      aria-labelledby="newsletter"
      className={`${s.home} ${s.newsletter}`}
      style={{ backgroundColor: BLUSH.bg, color: BLUSH.fg, ['--fg' as string]: BLUSH.fg, ['--bg' as string]: BLUSH.bg }}
    >
      <div className={s.wrap}>
        <div className={s.newsletterText}>
          <h2 id="newsletter" className={s.newsletterTitle}>
            Sketch. Make. Meet artists. In your city.
          </h2>
          <p className={s.newsletterLead}>
            One email a month with the workshops, life-drawing sessions and creative meetups happening near you
          </p>
        </div>

        {state.status === 'ok' ? (
          <p className={s.newsletterDone} role="status">
            Thank you! You&rsquo;re on the list.
          </p>
        ) : (
          <form action={action} className={s.newsletterForm}>
            <label htmlFor="newsletter-email" className="sr-only">
              E-mail address
            </label>
            <input
              id="newsletter-email"
              name="email"
              type="email"
              required
              maxLength={254}
              autoComplete="email"
              placeholder="Enter your e-mail address"
              aria-invalid={state.status === 'error' || undefined}
              aria-describedby={state.status === 'error' ? 'newsletter-error' : undefined}
            />
            <input type="hidden" name="source" value={source} />
            {/* Honeypot: hidden from people and screen readers. */}
            <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
            {state.status === 'error' && (
              <p id="newsletter-error" className={s.newsletterError} role="alert">
                {state.message}
              </p>
            )}
            <button type="submit" disabled={pending}>
              {pending ? 'Signing up…' : 'Subscribe'}
            </button>
            <p className={s.newsletterConsent}>{NEWSLETTER_CONSENT}</p>
          </form>
        )}
      </div>
    </section>
  );
}

'use server';

import { db } from '@/db';
import { newsletterSubscribers } from '@/db/schema';
import { NEWSLETTER_CONSENT } from '@/lib/newsletter';

export interface SignupState {
  status: 'idle' | 'ok' | 'error';
  message?: string;
}

// Deliberately loose: the browser's type="email" already checks the format;
// this only rejects obvious junk and over-long input.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Saves a homepage newsletter sign-up. Answers the same whether or not the
 *  address was already on the list, so the form can't be used to probe it. */
export async function subscribeToNewsletter(_prev: SignupState, form: FormData): Promise<SignupState> {
  // Honeypot: a field hidden from people; bots that fill it get a fake success.
  if (String(form.get('company') ?? '').trim()) return { status: 'ok' };

  const email = String(form.get('email') ?? '').trim().toLowerCase();
  if (email.length > 254 || !EMAIL_RE.test(email)) {
    return { status: 'error', message: 'Please enter a valid e-mail address.' };
  }

  try {
    await db
      .insert(newsletterSubscribers)
      .values({ email, source: 'home', consentText: NEWSLETTER_CONSENT })
      .onConflictDoNothing();
  } catch (err) {
    console.error('newsletter signup failed', err);
    return { status: 'error', message: 'Something went wrong. Please try again later.' };
  }
  return { status: 'ok' };
}

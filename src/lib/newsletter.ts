/** Shown under the sign-up button and stored with each sign-up as the consent
 *  record. Changing it only affects new sign-ups. */
export const NEWSLETTER_CONSENT = 'By signing up, you agree to receive marketing emails. You can unsubscribe at any time.';

/** Pages with the newsletter form; stored as the sign-up's `source` and sent
 *  with the `newsletter_signup` analytics event. */
export const NEWSLETTER_SOURCES = ['home', 'where-art-happens', 'blog', 'event'] as const;
export type NewsletterSource = (typeof NEWSLETTER_SOURCES)[number];

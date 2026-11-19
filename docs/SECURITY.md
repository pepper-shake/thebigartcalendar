# Security

A small, low-surface project. The notes that matter:

- **No public auth at launch.** The only authenticated surface is `POST /api/admin/upload`, gated by `ADMIN_UPLOAD_TOKEN` (Bearer header). Don't add public auth/account surfaces without discussion.
- **Secrets live in env, never in git.** `.env*` is gitignored (except `.env.example`, which holds placeholders only). Secrets in use: `DATABASE_URL`, `ANTHROPIC_API_KEY`, `BLOB_READ_WRITE_TOKEN`, `ADMIN_UPLOAD_TOKEN`. Rotation: [references/vercel-blob.md](references/vercel-blob.md).
- **Upload endpoint** restricts to image content types and caps size, but does **not** rate-limit (acceptable for a single-operator admin tool; revisit if exposed more widely — see [exec-plans/tech-debt.md](exec-plans/tech-debt.md)). Keep the token out of client code — Retool stores it as a secret.
- **Blob storage is public.** Uploaded images are world-readable via unguessable URLs. Don't upload anything sensitive.
- **Analytics are opt-in.** Microsoft Clarity (session recordings) loads only after the visitor accepts the consent banner; Google Analytics runs in Consent Mode with cookies denied until then. See [references/analytics.md](references/analytics.md).
- **Personal data: newsletter e-mails only.** Otherwise the app stores public event data, with no user accounts. The homepage newsletter form (server action `src/app/actions/newsletter.ts`) writes to `newsletter_subscribers`: e-mail, source, the consent wording shown, status, timestamp. Nothing sends e-mail yet. Abuse protection is a honeypot field only (no rate limit or CAPTCHA, see [exec-plans/tech-debt.md](exec-plans/tech-debt.md)); the form answers the same for new and existing addresses. Before the first send: add a sending provider with double opt-in confirmation and one-click unsubscribe, and a privacy note. Don't export or share the list outside the sending tool.

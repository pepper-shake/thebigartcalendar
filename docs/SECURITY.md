# Security

A small, low-surface project. The notes that matter:

- **No public auth at launch.** The only authenticated surface is `POST /api/admin/upload`, gated by `ADMIN_UPLOAD_TOKEN` (Bearer header). Don't add public auth/account surfaces without discussion.
- **Secrets live in env, never in git.** `.env*` is gitignored (except `.env.example`, which holds placeholders only). Secrets in use: `DATABASE_URL`, `ANTHROPIC_API_KEY`, `BLOB_READ_WRITE_TOKEN`, `ADMIN_UPLOAD_TOKEN`. Rotation: [references/vercel-blob.md](references/vercel-blob.md).
- **Upload endpoint** restricts to image content types and caps size, but does **not** rate-limit (acceptable for a single-operator admin tool; revisit if exposed more widely — see [exec-plans/tech-debt.md](exec-plans/tech-debt.md)). Keep the token out of client code — Retool stores it as a secret.
- **Blob storage is public.** Uploaded images are world-readable via unguessable URLs. Don't upload anything sensitive.
- **Analytics are opt-in.** Microsoft Clarity (session recordings) loads only after the visitor accepts the consent banner; Google Analytics runs in Consent Mode with cookies denied until then. See [references/analytics.md](references/analytics.md).
- **No PII.** The app stores public event data (and, later, blog posts) — no user accounts or personal data.

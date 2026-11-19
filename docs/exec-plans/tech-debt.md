# Tech debt / deferred work

- **Bulk re-host event images.** Un-overridden events still hotlink source images, which can rot or be referer-blocked. Option: re-host into Blob at scrape time. (See [decision #0003](../design/decisions.md).)
- **Large image uploads (>~3 MB).** The base64-JSON upload route is bounded by Vercel's ~4.5 MB request-body limit (base64 inflates ~33%). For bigger files, switch to Blob **client uploads** (`handleUpload`).
- **Preview env var.** `ADMIN_UPLOAD_TOKEN` is set for Production + Development but not Preview (a `vercel env add` non-interactive quirk: it wants a git branch for preview). Add via the dashboard if preview deploys need uploads.
- **`next/image`.** Event images use plain `<img>`. To adopt `next/image`, add the Blob hostname (`*.public.blob.vercel-storage.com`) to `next.config.ts` `images.remotePatterns`.
- **Versioned migrations.** Project uses `db:push` with no migration files ([#0005](../design/decisions.md)). To switch to `generate`/`migrate`, baseline the existing schema first (mark the initial migration as already-applied).
- **Docs CI + doc-gardening.** Add a linter (valid links, referenced files exist, AGENTS.md size bounded, schema doc matches `src/db/schema.ts`) and a recurring agent that opens fix-up PRs for stale docs. (See [docs/README.md](../README.md).)
- **Rate-limiting** on `/api/admin/upload` — currently auth-only. Fine for a single-operator admin tool; revisit if exposed more widely.
- **Newsletter form has no rate limit.** Only a honeypot field stops bots (`src/app/actions/newsletter.ts`). If junk sign-ups appear, add a per-IP limit (e.g. Vercel Firewall rule on the action's POST) or a CAPTCHA.

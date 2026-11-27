# Next.js 16 notes

**This is not the Next.js in your training data.** APIs, conventions, and file structure differ. Before writing Next code, read the relevant guide under `node_modules/next/dist/docs/` (e.g. `01-app/01-getting-started/`, `01-app/03-api-reference/03-file-conventions/`).

Specifics confirmed and relied on here:
- **Route handlers** (`src/app/**/route.ts`) use the Web `Request`/`Response` APIs. `POST` is never cached. Read JSON via `await request.json()`, headers via `request.headers`. Dynamic `context.params` is a **Promise** (`await params`). No `bodyParser` config needed. (Example: the upload route.)
- **Caching:** this app uses the previous caching model (no `cacheComponents`; guide: `01-app/02-guides/caching-without-cache-components.md`). DB reads go through `unstable_cache` and pages use `export const revalidate`, so edits appear within an hour — see [ARCHITECTURE.md](../ARCHITECTURE.md) §Caching. `revalidateTag` now takes two args (`revalidateTag(tag, 'max')`); the one-arg form is deprecated.
- **tsconfig `target` is below es2018** — runtime-level regex flags like `/s` (dotAll) fail typecheck. Use `[\s\S]` instead of `.` with `/s`. (`next build` runs `tsc`, so this fails the build, not just the editor.)
- **`next/image` remote images** need `images.remotePatterns` in `next.config.ts`. Currently the app uses plain `<img>`, so no patterns are configured yet (see tech-debt).

Versions: Next **16.2.6**, React **19.2.4** (Turbopack dev).

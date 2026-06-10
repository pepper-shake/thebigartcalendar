# AGENTS.md — start here

**The Big Art Calendar**: an SEO-first, mobile-first portal for art events across Europe. Events are scraped daily into Neon (Postgres) and server-rendered by Next.js. No user accounts at launch.

This file is a **map**, not an encyclopedia. Keep it short — put detail in [`docs/`](docs/) (the system of record) and link to it. If knowledge isn't written down in this repo, it doesn't exist for the next person or agent.

See [README.md](README.md) for the product intro and [docs/README.md](docs/README.md) for the knowledge base.

## Build / run / test
- `npm run dev` — local dev at http://localhost:3000
- `npm run build` / `npm run start` — production build / serve
- `npm run lint` — ESLint · `npx tsc --noEmit` — typecheck (no dedicated script)
- `npm run scrape` — run the daily scraper (needs `DATABASE_URL` + `ANTHROPIC_API_KEY`)
- `npm run db:push` — apply schema to Neon · `npm run db:studio` — browse data

## What counts as done
`tsc --noEmit` and `lint` clean; if the change is observable, verified in the running app; and the relevant doc under `docs/` updated in the **same** change.

## Hard constraints
- **SEO-first** — indexable content must be server-rendered; avoid client-only rendering for content.
- **Mobile-first** — design for mobile, scale up.
- **No public auth at launch** — the only authed surface is the token-gated upload route. Don't add account/auth surfaces without discussion. See [docs/SECURITY.md](docs/SECURITY.md).

## ⚠️ Landmines — read before touching these
- **Next.js 16 ≠ the Next.js you know.** Read the relevant guide in `node_modules/next/dist/docs/` before writing Next code. Notes: [docs/references/next-16.md](docs/references/next-16.md).
- **Schema changes use `db:push`, not generate/migrate** — there are no migration files. ([decision #0005](docs/design/decisions.md))
- **`vercel env pull` / `vercel blob create-store` overwrite `.env.local`** and drop `DATABASE_URL`/`ANTHROPIC_API_KEY` (only in Vercel prod/preview). [docs/references/vercel-blob.md](docs/references/vercel-blob.md)
- **The scraper upsert must never overwrite curation columns** (`status`, `*_override`, `curated_at`). [docs/product/event-curation.md](docs/product/event-curation.md) + guard in [scripts/lib/upsert.ts](scripts/lib/upsert.ts).

## Where things live
| Topic | Doc |
|---|---|
| Architecture & data flow | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) |
| SEO routing & custom domain | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) (§SEO & routing) · [docs/references/domain-setup.md](docs/references/domain-setup.md) |
| Decisions & rationale | [docs/design/decisions.md](docs/design/decisions.md) |
| Roadmap & in-flight work | [docs/exec-plans/](docs/exec-plans/) |
| Event editing / curation | [docs/product/event-curation.md](docs/product/event-curation.md) |
| Integrations (Vercel Blob, Retool) | [docs/references/](docs/references/) |
| DB schema snapshot | [docs/generated/db-schema.md](docs/generated/db-schema.md) |
| Security | [docs/SECURITY.md](docs/SECURITY.md) |

## Escalate / report uncertainty
No DB migrations, no destructive Neon operations, and no production deploys without explicit sign-off. If a doc contradicts the code, trust the code and fix the doc (see doc-gardening in [docs/README.md](docs/README.md)).

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

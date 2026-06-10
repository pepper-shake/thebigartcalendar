# Custom domain — thebigartcalendar.com

The app is already deployed on Vercel (default host `thebigartcalendar.vercel.app`). These are the steps to serve it on the custom domain **`thebigartcalendar.com`**. Steps 1–2 are done in the Vercel dashboard + your registrar; step 3 is the only code/config touchpoint.

> The vercel.app host keeps working throughout — nothing breaks while DNS propagates.

## 1. Add the domain in Vercel
- Dashboard → the project → **Settings → Domains → Add**.
- Add **both** `thebigartcalendar.com` and `www.thebigartcalendar.com`.
- Pick the canonical host — **recommend the apex `thebigartcalendar.com`** — and set `www` to **Redirect → apex** (Vercel offers a toggle). One canonical host matches the canonical URLs the app emits.

## 2. DNS records at your registrar
Vercel shows the exact records to add; the standard ones are:

| Host | Type | Value |
|---|---|---|
| `thebigartcalendar.com` (apex / `@`) | `A` | `76.76.21.21` *(or whatever Vercel shows)* |
| `www` | `CNAME` | `cname.vercel-dns.com` |

- If your DNS provider supports `ALIAS`/`ANAME`/CNAME-flattening at the apex, you can point the apex at `cname.vercel-dns.com` instead of the A record.
- **Remove old/conflicting** A/AAAA/CNAME records for those hosts.
- Make the records at the **authoritative** nameserver (wherever the domain's NS records point).
- TLS certificates are issued automatically once DNS resolves (minutes to a few hours).

## 3. Set the site origin env var
- Vercel → **Settings → Environment Variables** → add for **Production**:
  ```
  NEXT_PUBLIC_SITE_URL = https://thebigartcalendar.com
  ```
  (Leave Preview unset, or set it to the preview URL — preview deploys shouldn't claim the production canonical.)
- **Redeploy** so `metadataBase`, canonical tags, `sitemap.xml`, and JSON-LD use the new origin.
- The code falls back to `https://thebigartcalendar.com` when the var is unset (see [src/lib/site.ts](../../src/lib/site.ts)), so canonicals are already correct — but the env var is the source of truth and lets you change domains later without a code edit.
- ⚠️ Don't run `vercel env pull` / `vercel blob create-store` carelessly — they overwrite `.env.local` and drop other keys. See [vercel-blob.md](vercel-blob.md).

## 4. After it's live
- Verify over HTTPS: `https://thebigartcalendar.com/`, `/sitemap.xml`, `/robots.txt` — and that `www.` redirects to the apex.
- **Google Search Console**: add the domain property, verify (DNS `TXT`), submit `https://thebigartcalendar.com/sitemap.xml`.
- (Optional) **Bing Webmaster Tools**: same.
- (Optional) Switch the Retool upload-query base URL to the custom domain — see [retool.md](retool.md). The route works on either host; no rush.

## Notes
- `robots.txt` and `sitemap.xml` are generated from `NEXT_PUBLIC_SITE_URL`, so they update automatically when the env var changes — no code edit needed.
- Production deploys need explicit sign-off (see [AGENTS.md](../../AGENTS.md)); this guide is the procedure, not an instruction to deploy.

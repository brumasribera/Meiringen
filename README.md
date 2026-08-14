# Meiringen.life

A free, multilingual community platform for discovering cultural, social, sport and integration activities in Meiringen and Haslital.

## Stack

- **Next.js** (App Router) + TypeScript + Tailwind CSS
- **Supabase** — Postgres database + Auth (Google + email/password)
- **Resend** — monthly newsletter emails
- **Vercel** — hosting + cron jobs
- **Google Maps** — organization & event maps (requires API key)
- **next-intl** — 7 languages (de, gsw, en, fr, it, rm, pt)

## Quick start (local)

### 1. Clone and install

```bash
npm install
cp .env.example .env.local
```

### 2. Supabase setup

**Option A — Vercel Marketplace (recommended for production)**

1. Run `npm run setup:supabase` (opens the Vercel Supabase install in your browser)
2. Accept marketplace terms, choose the **free** plan, region **Europe Central (Zurich)**, and link to the `meiringen` project
3. The script waits for env vars, pulls them locally, runs migrations, and sets `NEXT_PUBLIC_SITE_URL` + `CRON_SECRET`

**Local dev with real data**

Supabase is connected to **Development** on Vercel. Pull env vars and start the dev server:

```bash
vercel env pull .env.local --environment=development --yes
npm run dev
```

Open [http://localhost:3000/organizations](http://localhost:3000/organizations)

**Option B — Manual**

1. Create a project at [supabase.com](https://supabase.com)
2. Copy URL, anon key, and service role key to `.env.local`

### 3. Run database migrations

In the Supabase SQL Editor, run these files in order:

1. `supabase/migrations/0001_schema.sql`
2. `supabase/migrations/0002_rls.sql`
3. `supabase/migrations/0003_seed.sql` (optional placeholder data)
4. `supabase/migrations/0004_meiringen_organizations.sql` (**real Vereine** — run this for production)
5. `supabase/migrations/0005_organization_localities.sql` (location filter + Haslital villages)
6. `supabase/migrations/0006_org_descriptions_logos.sql` (English descriptions + logo fixes)

### 4. Configure Google Sign-In

Google auth uses **Supabase Auth** as the OAuth broker. You configure Google once, then allow redirects in Supabase for local + production.

#### Step A — Google Cloud Console

1. Open [Google Cloud Console](https://console.cloud.google.com) → select or create a project
2. **APIs & Services → OAuth consent screen**
   - User type: **External** (fine for a community site)
   - Add app name, support email, developer contact
   - Scopes: keep defaults (`email`, `profile`, `openid`)
   - Add test users while in "Testing" mode (or publish when ready)
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID**
   - Application type: **Web application**
   - **Authorized JavaScript origins:**
     ```
     http://localhost:3000
     https://meiringen.life
     ```
   - **Authorized redirect URIs** (Supabase callback — replace `YOUR_PROJECT_REF`):
     ```
     https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
     ```
     Find your project ref in Supabase → Project Settings → General → Reference ID
4. Copy the **Client ID** and **Client Secret**

#### Step B — Supabase Google provider

1. Supabase Dashboard → **Authentication → Providers → Google**
2. Enable Google
3. Paste **Client ID** and **Client Secret**
4. Save

#### Step C — Supabase URL configuration

Authentication → **URL Configuration**:

| Setting           | Local dev               | Production (Vercel)      |
| ----------------- | ----------------------- | ------------------------ |
| **Site URL**      | `http://localhost:3000` | `https://meiringen.life` |
| **Redirect URLs** | Add all of these:       |                          |

```
http://localhost:3000/**
https://meiringen.life/**
https://*.vercel.app/**
```

The last line lets Vercel preview deployments work without reconfiguring Google each time.

#### Step D — Local `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-maps-javascript-api-key
GOOGLE_MAPS_MONTHLY_LIMIT=500
```

Enable **Maps JavaScript API** in Google Cloud Console for the same project (or a dedicated one). Optional: set `NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID` if you use a custom Map ID; otherwise `DEMO_MAP_ID` is used for development.

When the monthly load counter reaches `GOOGLE_MAPS_MONTHLY_LIMIT`, maps automatically fall back to a styled **Leaflet + OpenStreetMap/CARTO** view (free).

Restart dev server, then test: [http://localhost:3000/login](http://localhost:3000/login) → **Mit Google anmelden**

#### Step E — Vercel production env vars

In Vercel → Project → **Settings → Environment Variables** (Production + Preview):

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=https://meiringen.life
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-maps-javascript-api-key
```

After adding vars, **redeploy**. Then test: `https://meiringen.life/login`

#### How the redirect flow works

```
User clicks Google
  → Google login
  → Supabase (/auth/v1/callback)
  → Your app (/auth/callback?next=/account/newsletter)
  → Newsletter preferences page
```

#### Troubleshooting

| Error                              | Fix                                                                                         |
| ---------------------------------- | ------------------------------------------------------------------------------------------- |
| `redirect_uri_mismatch`            | Google redirect URI must be exactly `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback` |
| Redirected to login after Google   | Add `http://localhost:3000/**` or `https://meiringen.life/**` to Supabase Redirect URLs     |
| Works locally, not on Vercel       | Check env vars on Vercel; redeploy after adding them                                        |
| `Access blocked: app not verified` | Add your Google account as a test user, or publish OAuth consent screen                     |

### 5. Create an admin user

1. Sign up via the app (`/login`)
2. In Supabase SQL Editor:

```sql
update public.profiles set role = 'admin' where email = 'your@email.com';
```

### 6. Resend setup

**Option A — Vercel Marketplace**

Install Resend from the Vercel Marketplace and connect your project.

**Option B — Manual**

1. Create account at [resend.com](https://resend.com)
2. Add and verify domain `meiringen.life`
3. Set `RESEND_API_KEY` and `RESEND_FROM_EMAIL` in env vars

### 7. Run locally

```bash
npm run dev
```

Open [http://localhost:3000/de](http://localhost:3000/de)

## Deploy to Vercel

1. Push to GitHub and import in Vercel
2. Install Supabase + Resend via Vercel Marketplace
3. Set environment variables:
   - `CRON_SECRET` — random secure string
   - `NEXT_PUBLIC_SITE_URL` — `https://www.meiringen.life`
4. Add custom domain `meiringen.life` (apex redirects to `www`)
5. Verify production: `npm run test:production`
6. Cron jobs are configured in `vercel.json`:
   - Newsletter: 1st of each month at 08:00 UTC
   - Scrape: daily at 06:00 UTC
   - Organization directory sync: daily at 06:30 UTC

Vercel automatically sends `Authorization: Bearer <CRON_SECRET>` to cron endpoints.

## Project structure

```
src/
  app/[locale]/     # Public pages + admin (locale resolved from cookie; URLs are unprefixed)
  app/api/cron/     # Newsletter + scrape cron endpoints
  app/auth/         # OAuth callback
  components/       # UI components
  lib/              # Supabase, data access, scraping, newsletter
  messages/         # i18n translation files
  i18n/             # next-intl routing config
supabase/migrations/  # SQL schema, RLS, seed data
```

## Features

- Public website with events agenda, organization directory, maps, search & filters
- 7-language UI (German default, Haslidütsch, English, French, Italian, Romansh, Portuguese)
- User accounts (Google + email/password)
- Newsletter preferences (monthly, filtered by category/org/language)
- Admin CRUD for organizations, events (with draft review), and scraping sources
- Daily scrape cron with generic JSON-LD parser + placeholder site-specific parsers
- Monthly newsletter cron via Resend

## Scraping & agenda sync

The daily cron (`/api/cron/scrape`, 06:00 UTC) syncs the public agenda:

1. **Scrape** — fetches active sources plus organization websites, parses JSON-LD/dated event links, and publishes activities within the next **365 days**.
2. **Curate** — rejects generic navigation labels, invalid dates, thin broad-source rows, and broad tourist listings without Meiringen/Haslital regional signals.
3. **Clean up** — deletes only clearly bad future rows that were imported from a `source_url`; admin-created rows are left alone.

The daily organization cron (`/api/cron/org-research`, 06:30 UTC) refreshes Meiringen and Haslital-Brienz organization directories. New directory discoveries stay as drafts; missing source-backed organizations are only archived after the configured grace period.

Recurring rows marked as templates are hidden from the public agenda; only their dated occurrences appear. Duplicates are prevented by unique slugs and `(source_url, title, start_date)` for scraped events.

To run a manual sync locally: `npx tsx scripts/sync-agenda.mjs`

### Optional Ubuntu Codex research runner

For source discovery with the ChatGPT/Codex CLI installed on Ubuntu, pull production or development Supabase env vars into `.env.local`, then run:

```bash
npm run scrape:curated
```

This runs the deterministic organization and event sync first, then calls `codex exec --search` with `scripts/prompts/meiringen-curated-scrape.md`. The model must return JSON matching `scripts/curated-scrape-result.schema.json`; the importer still validates URLs, dates, categories, and regional relevance before writing to Supabase.

Dry run:

```bash
npm run scrape:curated:dry-run
```

Install the Ubuntu crontab entry after `.env.local` is present:

```bash
npm run scrape:curated:install-cron
```

## License

MIT

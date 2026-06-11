# Meiringen.org

A free, multilingual community platform for discovering cultural, social, sport and integration activities in Meiringen and Haslital.

## Stack

- **Next.js** (App Router) + TypeScript + Tailwind CSS
- **Supabase** — Postgres database + Auth (Google + email/password)
- **Resend** — monthly newsletter emails
- **Vercel** — hosting + cron jobs
- **Leaflet** + OpenStreetMap — maps
- **next-intl** — 7 languages (de, gsw, en, fr, it, rm, pt)

## Quick start (local)

### 1. Clone and install

```bash
npm install
cp .env.example .env.local
```

### 2. Supabase setup

**Option A — Vercel Marketplace (recommended for production)**

1. Go to [Vercel Marketplace](https://vercel.com/marketplace) → Supabase → Install
2. Create a free project and connect it to your Vercel project
3. Env vars are injected automatically

**Option B — Manual**

1. Create a project at [supabase.com](https://supabase.com)
2. Copy URL, anon key, and service role key to `.env.local`

### 3. Run database migrations

In the Supabase SQL Editor, run these files in order:

1. `supabase/migrations/0001_schema.sql`
2. `supabase/migrations/0002_rls.sql`
3. `supabase/migrations/0003_seed.sql`

### 4. Configure Google Auth (optional)

In Supabase Dashboard → Authentication → Providers → Google:

1. Enable Google provider
2. Add OAuth credentials from [Google Cloud Console](https://console.cloud.google.com)
3. Set redirect URL: `https://your-project.supabase.co/auth/v1/callback`
4. Add your site URL to Supabase → Authentication → URL Configuration:
   - Site URL: `http://localhost:3000` (dev) or `https://meiringen.org` (prod)
   - Redirect URLs: `http://localhost:3000/auth/callback`, `https://meiringen.org/auth/callback`

### 5. Create an admin user

1. Sign up via the app (`/de/login`)
2. In Supabase SQL Editor:

```sql
update public.profiles set role = 'admin' where email = 'your@email.com';
```

### 6. Resend setup

**Option A — Vercel Marketplace**

Install Resend from the Vercel Marketplace and connect your project.

**Option B — Manual**

1. Create account at [resend.com](https://resend.com)
2. Add and verify domain `meiringen.org`
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
   - `NEXT_PUBLIC_SITE_URL` — `https://meiringen.org`
4. Add custom domain `meiringen.org`
5. Cron jobs are configured in `vercel.json`:
   - Newsletter: 1st of each month at 08:00 UTC
   - Scrape: daily at 06:00 UTC

Vercel automatically sends `Authorization: Bearer <CRON_SECRET>` to cron endpoints.

## Project structure

```
src/
  app/[locale]/     # Public pages + admin (locale-prefixed routes)
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

## Scraping

The scrape endpoint (`/api/cron/scrape`) fetches active sources from `scraping_sources`, runs the matching parser, and inserts events as **drafts**. Duplicates are prevented by a unique index on `(source_url, title, start_date)`.

To add a site-specific parser, implement logic in `src/lib/scraping/parsers.ts` and register the type in admin sources.

## License

MIT

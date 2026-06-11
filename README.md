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
3. `supabase/migrations/0003_seed.sql` (optional placeholder data)
4. `supabase/migrations/0004_meiringen_organizations.sql` (**real Vereine** — run this for production)

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
     https://meiringen.org
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

| Setting | Local dev | Production (Vercel) |
|---------|-----------|---------------------|
| **Site URL** | `http://localhost:3000` | `https://meiringen.org` |
| **Redirect URLs** | Add all of these: | |

```
http://localhost:3000/**
https://meiringen.org/**
https://*.vercel.app/**
```

The last line lets Vercel preview deployments work without reconfiguring Google each time.

#### Step D — Local `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Restart dev server, then test: [http://localhost:3000/de/login](http://localhost:3000/de/login) → **Mit Google anmelden**

#### Step E — Vercel production env vars

In Vercel → Project → **Settings → Environment Variables** (Production + Preview):

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=https://meiringen.org
```

After adding vars, **redeploy**. Then test: `https://meiringen.org/de/login`

#### How the redirect flow works

```
User clicks Google
  → Google login
  → Supabase (/auth/v1/callback)
  → Your app (/auth/callback?next=/de/account/newsletter)
  → Newsletter preferences page
```

#### Troubleshooting

| Error | Fix |
|-------|-----|
| `redirect_uri_mismatch` | Google redirect URI must be exactly `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback` |
| Redirected to login after Google | Add `http://localhost:3000/**` or `https://meiringen.org/**` to Supabase Redirect URLs |
| Works locally, not on Vercel | Check env vars on Vercel; redeploy after adding them |
| `Access blocked: app not verified` | Add your Google account as a test user, or publish OAuth consent screen |

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

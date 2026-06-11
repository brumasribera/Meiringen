-- Meiringen.org schema

create extension if not exists "pgcrypto";

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  category text not null check (category in (
    'culture', 'sport', 'social', 'integration', 'education',
    'music', 'nature', 'festival', 'market', 'other'
  )),
  website_url text,
  email text,
  phone text,
  address text,
  latitude double precision,
  longitude double precision,
  languages text[] not null default '{}',
  image_url text,
  source_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete set null,
  title text not null,
  slug text not null unique,
  description text,
  category text not null check (category in (
    'culture', 'sport', 'social', 'integration', 'education',
    'music', 'nature', 'festival', 'market', 'other'
  )),
  start_date timestamptz not null,
  end_date timestamptz,
  location_name text,
  address text,
  latitude double precision,
  longitude double precision,
  price text,
  language text check (language in ('de', 'gsw', 'en', 'fr', 'it', 'rm', 'pt')),
  is_recurring boolean not null default false,
  recurrence_description text,
  source_url text,
  status text not null default 'published' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index events_dedupe_idx
  on public.events (source_url, title, start_date)
  where source_url is not null;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

create table public.newsletter_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  frequency text not null default 'monthly' check (frequency = 'monthly'),
  categories text[] not null default '{}',
  organization_ids uuid[] not null default '{}',
  languages text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.scraping_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text not null,
  type text not null default 'generic' check (type in ('generic', 'meiringen_ch', 'haslital_ch')),
  active boolean not null default true,
  last_checked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger organizations_updated_at
  before update on public.organizations
  for each row execute function public.handle_updated_at();

create trigger events_updated_at
  before update on public.events
  for each row execute function public.handle_updated_at();

create trigger newsletter_preferences_updated_at
  before update on public.newsletter_preferences
  for each row execute function public.handle_updated_at();

create trigger scraping_sources_updated_at
  before update on public.scraping_sources
  for each row execute function public.handle_updated_at();

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create index events_start_date_idx on public.events (start_date);
create index events_status_idx on public.events (status);
create index events_category_idx on public.events (category);
create index organizations_category_idx on public.organizations (category);
create index organizations_name_idx on public.organizations (name);

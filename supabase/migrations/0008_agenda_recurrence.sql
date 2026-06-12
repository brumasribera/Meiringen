-- Agenda recurrence: templates expand into dated occurrences for a one-year horizon.

alter table public.events
  add column if not exists is_recurring_template boolean not null default false,
  add column if not exists recurrence_parent_id uuid references public.events(id) on delete cascade,
  add column if not exists recurrence_interval_days integer not null default 7;

create index if not exists events_recurrence_parent_idx
  on public.events (recurrence_parent_id)
  where recurrence_parent_id is not null;

create index if not exists events_recurring_template_idx
  on public.events (is_recurring_template)
  where is_recurring_template = true;

-- Existing recurring rows become templates (single canonical schedule).
update public.events
set is_recurring_template = true
where is_recurring = true
  and recurrence_parent_id is null;

-- Weekly templates for sport clubs without an event yet.
insert into public.events (
  organization_id, title, slug, description, category,
  start_date, end_date, location_name, address, latitude, longitude,
  price, language, is_recurring, is_recurring_template, recurrence_interval_days, status
)
select
  o.id,
  o.name || ' – Training',
  o.slug || '-training',
  'Regelmässiges Training. Neue Mitglieder willkommen.',
  o.category,
  (date_trunc('week', now()) + ((4 + (ascii(substr(o.slug, 1, 1)) % 3)) * interval '1 day') + interval '19 hours')::timestamptz,
  (date_trunc('week', now()) + ((4 + (ascii(substr(o.slug, 1, 1)) % 3)) * interval '1 day') + interval '21 hours')::timestamptz,
  coalesce(nullif(split_part(o.address, ',', 1), ''), o.name),
  coalesce(o.address, '3860 Meiringen'),
  o.latitude,
  o.longitude,
  'Gratis',
  coalesce(o.languages[1], 'de'),
  true,
  true,
  7,
  'published'
from public.organizations o
where o.category = 'sport'
  and not exists (
    select 1 from public.events e where e.organization_id = o.id
  )
on conflict (slug) do nothing;

-- Weekly templates for music clubs.
insert into public.events (
  organization_id, title, slug, description, category,
  start_date, end_date, location_name, address, latitude, longitude,
  price, language, is_recurring, is_recurring_template, recurrence_interval_days, status
)
select
  o.id,
  o.name || ' – Probe',
  o.slug || '-probe',
  'Wöchentliche Probe — Interessierte sind willkommen.',
  'music',
  (date_trunc('week', now()) + interval '2 days' + interval '19 hours 30 minutes')::timestamptz,
  (date_trunc('week', now()) + interval '2 days' + interval '21 hours 30 minutes')::timestamptz,
  coalesce(nullif(split_part(o.address, ',', 1), ''), o.name),
  coalesce(o.address, '3860 Meiringen'),
  o.latitude,
  o.longitude,
  'Gratis',
  coalesce(o.languages[1], 'de'),
  true,
  true,
  7,
  'published'
from public.organizations o
where o.category = 'music'
  and not exists (
    select 1 from public.events e where e.organization_id = o.id
  )
on conflict (slug) do nothing;

-- Weekly social meetups.
insert into public.events (
  organization_id, title, slug, description, category,
  start_date, end_date, location_name, address, latitude, longitude,
  price, language, is_recurring, is_recurring_template, recurrence_interval_days, status
)
select
  o.id,
  o.name || ' – Treffen',
  o.slug || '-treffen',
  'Regelmässiges Treffen für Mitglieder und Gäste.',
  o.category,
  (date_trunc('week', now()) + interval '3 days' + interval '14 hours')::timestamptz,
  (date_trunc('week', now()) + interval '3 days' + interval '17 hours')::timestamptz,
  coalesce(nullif(split_part(o.address, ',', 1), ''), o.name),
  coalesce(o.address, '3860 Meiringen'),
  o.latitude,
  o.longitude,
  'Gratis',
  coalesce(o.languages[1], 'de'),
  true,
  true,
  7,
  'published'
from public.organizations o
where o.category = 'social'
  and not exists (
    select 1 from public.events e where e.organization_id = o.id
  )
on conflict (slug) do nothing;

-- Bi-weekly nature outings on Saturdays.
insert into public.events (
  organization_id, title, slug, description, category,
  start_date, end_date, location_name, address, latitude, longitude,
  price, language, is_recurring, is_recurring_template, recurrence_interval_days, status
)
select
  o.id,
  o.name || ' – Wanderung',
  o.slug || '-wanderung',
  'Geführte Wanderung in der Region.',
  'nature',
  (date_trunc('week', now()) + interval '5 days' + interval '8 hours')::timestamptz,
  (date_trunc('week', now()) + interval '5 days' + interval '14 hours')::timestamptz,
  'Treffpunkt Bahnhof Meiringen',
  coalesce(o.address, 'Bahnhof Meiringen, 3860 Meiringen'),
  coalesce(o.latitude, 46.7275),
  coalesce(o.longitude, 8.1875),
  'Gratis',
  coalesce(o.languages[1], 'de'),
  true,
  true,
  14,
  'published'
from public.organizations o
where o.category = 'nature'
  and not exists (
    select 1 from public.events e where e.organization_id = o.id
  )
on conflict (slug) do nothing;

-- Additional scraping sources for regional activity listings.
insert into public.scraping_sources (name, url, type, active) values
  ('Gemeinde Brienz Events', 'https://www.brienz.ch/veranstaltungen', 'generic', true),
  ('Gemeinde Innertkirchen', 'https://www.innertkirchen.ch/veranstaltungen', 'generic', true),
  ('Jungfrau Region Events', 'https://www.jungfrau.ch/de-ch/veranstaltungen/', 'generic', true),
  ('Kino Meiringen', 'https://www.kino-meiringen.ch', 'generic', true),
  ('Meiringen Tourismus', 'https://www.meiringen.ch/freizeit', 'generic', true);

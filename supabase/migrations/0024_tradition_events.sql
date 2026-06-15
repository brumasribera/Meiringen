-- Add a dedicated tradition event category and seed source-backed Meiringen customs.
-- Sources:
-- - https://www.meiringen.ch/warenmaerkte
-- - https://www.meiringen.ch/kultur/5891
-- - https://haslital.swiss/de/map/detail/altjahrswoche-und-ubersitz-7c747f7f-11fb-464a-bab3-ac1b6e885861.html

alter table public.events
  drop constraint if exists events_category_check;

alter table public.events
  add constraint events_category_check check (category in (
    'culture', 'sport', 'social', 'integration', 'education',
    'music', 'nature', 'festival', 'market', 'tradition', 'other'
  ));

insert into public.events (
  organization_id,
  title,
  slug,
  description,
  category,
  start_date,
  end_date,
  location_name,
  address,
  latitude,
  longitude,
  price,
  language,
  is_recurring,
  is_recurring_template,
  source_url,
  status
) values
(
  (select id from public.organizations where slug = 'gemeinde-meiringen'),
  'Traditioneller Warenmarkt Meiringen (September)',
  'traditioneller-warenmarkt-meiringen-september-2026',
  'Die Warenmärkte in Meiringen gehören seit Jahrhunderten zum Dorfleben. Der offizielle Herbstmarkt vom 16. September 2026 bringt Marktstände und Begegnungen ins Dorfzentrum.',
  'tradition',
  '2026-09-16T08:00:00+02:00',
  '2026-09-16T17:00:00+02:00',
  'Dorfzentrum Meiringen',
  'Kirchgasse, 3860 Meiringen',
  46.7272,
  8.1870,
  'Gratis',
  'de',
  false,
  false,
  'https://www.meiringen.ch/warenmaerkte',
  'published'
),
(
  (select id from public.organizations where slug = 'gemeinde-meiringen'),
  'Traditioneller Warenmarkt Meiringen (Oktober)',
  'traditioneller-warenmarkt-meiringen-oktober-2026',
  'Der spätherbstliche Warenmarkt vom 28. Oktober 2026 ist Teil der langen Markttradition von Meiringen; laut Gemeinde mit Brockenverkauf des Kindergartenvereins und eventuell Lunapark.',
  'tradition',
  '2026-10-28T08:00:00+01:00',
  '2026-10-28T17:00:00+01:00',
  'Dorfzentrum Meiringen',
  'Kirchgasse, 3860 Meiringen',
  46.7272,
  8.1870,
  'Gratis',
  'de',
  false,
  false,
  'https://www.meiringen.ch/warenmaerkte',
  'published'
),
(
  (select id from public.organizations where slug = 'gemeinde-meiringen'),
  'Altjahrswoche',
  'altjahrswoche-2026',
  'Die Altjahrswoche beginnt jeweils in der Nacht vom 25. auf den 26. Dezember. In den Dörfern des Haslitals ziehen die Trychelzüge nach altem Brauch aus, um mit Lärm und Masken die bösen Geister zu vertreiben.',
  'tradition',
  '2026-12-26T00:00:00+01:00',
  '2026-12-30T00:00:00+01:00',
  'Meiringen und die Dörfer des Haslitals',
  '3860 Meiringen',
  46.7275,
  8.1875,
  'Gratis',
  'de',
  false,
  false,
  'https://haslital.swiss/de/map/detail/altjahrswoche-und-ubersitz-7c747f7f-11fb-464a-bab3-ac1b6e885861.html',
  'published'
),
(
  (select id from public.organizations where slug = 'gemeinde-meiringen'),
  'Ubersitz',
  'ubersitz-2026',
  'Höhepunkt der Altjahrswoche: Am Ende der Trychelwoche treffen sich die Trychelzüge aus den einzelnen Dörfern des Haslitals zum gemeinsamen Ubersitz in Meiringen.',
  'tradition',
  '2026-12-30T00:00:00+01:00',
  null,
  'Dorfzentrum Meiringen',
  '3860 Meiringen',
  46.7275,
  8.1875,
  'Gratis',
  'de',
  false,
  false,
  'https://www.meiringen.ch/kultur/5891',
  'published'
)
on conflict (slug) do update
set
  organization_id = excluded.organization_id,
  title = excluded.title,
  description = excluded.description,
  category = excluded.category,
  start_date = excluded.start_date,
  end_date = excluded.end_date,
  location_name = excluded.location_name,
  address = excluded.address,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  price = excluded.price,
  language = excluded.language,
  is_recurring = excluded.is_recurring,
  is_recurring_template = excluded.is_recurring_template,
  source_url = excluded.source_url,
  status = excluded.status;

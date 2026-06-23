-- Add source-backed Meiringen festivals and traditional events with concrete dates.
-- Sources:
-- - https://musikfestwoche-meiringen.ch/de/Info/Programm/Programmubersicht
-- - https://haslital.swiss/en/events/highlights/details/meiringen-music-festival.html
-- - https://volkstheaterfestival.ch/
-- - https://bruenigschwinget.ch/
-- - https://bruenigschwinget.ch/schwingfest/
-- - https://meiringen-hasliberg.ch/174/schwing-und-alplerfest-engstlenalp
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
  'Musikfestwoche Meiringen 2026',
  'musikfestwoche-meiringen-2026',
  'Die Musikfestwoche Meiringen findet 2026 vom 3. bis 11. Juli statt. Das traditionsreiche Klassikfestival bringt Kammermusik, Orchesterkonzerte und musikalische Begegnungen nach Meiringen.',
  'festival',
  '2026-07-03T19:00:00+02:00',
  '2026-07-11T22:00:00+02:00',
  'Michaelskirche Meiringen und weitere Orte',
  'Kirchgasse 19, 3860 Meiringen',
  46.7272,
  8.1870,
  'Ticket je nach Kategorie',
  'de',
  false,
  false,
  'https://musikfestwoche-meiringen.ch/de/Info/Programm/Programmubersicht',
  'published'
),
(
  (select id from public.organizations where slug = 'gemeinde-meiringen'),
  'Brünigschwinget 2026',
  'bruenigschwinget-2026',
  'Das Brünigschwinget ist ein traditionsreiches Schwingfest auf der Brünig Passhöhe. Die offizielle Ausgabe 2026 ist auf Sonntag, 26. Juli 2026 datiert.',
  'tradition',
  '2026-07-26T08:00:00+02:00',
  '2026-07-26T18:00:00+02:00',
  'Brünig Passhöhe',
  '3860 Brünig',
  46.7564,
  8.1401,
  'Ticket je nach Kategorie',
  'de',
  false,
  false,
  'https://bruenigschwinget.ch/schwingfest/',
  'published'
),
(
  (select id from public.organizations where slug = 'schwingklub-meiringen'),
  'Schwing- und Älplerfest Engstlenalp 2026',
  'schwing-und-aelplerfest-engstlenalp-2026',
  'Das Schwing- und Älplerfest auf der Engstlenalp verbindet Schwingen, Alpkultur und regionale Tradition. Die Ausgabe 2026 ist für Samstag, 22. August 2026 angekündigt.',
  'tradition',
  '2026-08-22T09:00:00+02:00',
  '2026-08-22T18:00:00+02:00',
  'Engstlenalp',
  'Engstlenalp, 3860 Innertkirchen',
  46.7756,
  8.3501,
  'Details beim Veranstalter',
  'de',
  false,
  false,
  'https://meiringen-hasliberg.ch/174/schwing-und-alplerfest-engstlenalp',
  'published'
),
(
  (select id from public.organizations where slug = 'gemeinde-meiringen'),
  'Altjahrswoche',
  'altjahrswoche-2026',
  'Die Altjahrswoche beginnt in der Nacht vom 25. auf den 26. Dezember. In den Dörfern des Haslitals ziehen Trychelzüge mit Schellen, Trommeln und Masken nach altem Brauch durch die Gassen.',
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
  'Höhepunkt der Altjahrswoche: Am Ubersitz treffen sich die Trychelzüge aus den Dörfern des Haslitals in Meiringen. Zu den maskierten Figuren gehört auch die Schnabelgeiss, die lang geschnäbelte Gestalt der Haslitaler Tradition.',
  'tradition',
  '2026-12-30T18:00:00+01:00',
  '2026-12-31T02:00:00+01:00',
  'Dorfzentrum Meiringen',
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
  'Volkstheaterfestival Meiringen 2027',
  'volkstheaterfestival-meiringen-2027',
  'Das Volkstheaterfestival Meiringen bringt zeitgenössisches Volkstheater nach Meiringen. Die nächste angekündigte Ausgabe findet vom 16. bis 20. Juni 2027 statt.',
  'festival',
  '2027-06-16T12:00:00+02:00',
  '2027-06-20T23:00:00+02:00',
  'Tramhalle und Kino+ Meiringen',
  'Bahnhofplatz 6, 3860 Meiringen',
  46.7279,
  8.1857,
  'Details beim Veranstalter',
  'de',
  false,
  false,
  'https://volkstheaterfestival.ch/',
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

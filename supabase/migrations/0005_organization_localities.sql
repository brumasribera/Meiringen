-- Add locality for location filtering + expand Haslital Vereine coverage

alter table public.organizations
  add column if not exists locality text;

create index if not exists organizations_locality_idx
  on public.organizations (locality);

-- Backfill localities from address patterns
update public.organizations set locality = 'balm'
  where address ilike '%Balm%' and locality is null;

update public.organizations set locality = 'hausen'
  where address ilike '%Hausen%' and locality is null;

update public.organizations set locality = 'brienz'
  where (address ilike '%3855 Brienz%' or address ilike '%Brienz%')
    and address not ilike '%Meiringen%'
    and locality is null;

update public.organizations set locality = 'meiringen'
  where locality is null;

update public.organizations set locality = 'willigen'
  where address ilike '%Willigen%'
    and locality is null;

-- Fix orgs that serve Brienz but were defaulting to Meiringen
update public.organizations set locality = 'brienz'
  where slug in ('schwingklub-meiringen');

-- Nearby village Vereine (sources: haslital-brienz.ch, gemeinde websites)
insert into public.organizations (
  name, slug, description, category, website_url, email, phone, address,
  latitude, longitude, languages, image_url, source_url, locality
) values
(
  'Jodlerklub Innertkirchen',
  'jodlerklub-innertkirchen',
  'Pflegt Jodeln und Brauchtum in Innertkirchen und der Aareschlucht-Region.',
  'music',
  null,
  null,
  '+41 33 971 30 25',
  '3862 Innertkirchen',
  46.7000, 8.2300,
  array['de','gsw'],
  '/brand/org-logos/haslital-brienz-ch.png',
  'https://www.haslital-brienz.ch/vereine',
  'innertkirchen'
),
(
  'Frauenchor Innertkirchen',
  'frauenchor-innertkirchen',
  'Frauenchor für klassische und volkstümliche Chormusik in Innertkirchen.',
  'music',
  null,
  null,
  '+41 33 975 14 55',
  '3862 Innertkirchen',
  46.7005, 8.2295,
  array['de','gsw'],
  '/brand/org-logos/haslital-brienz-ch.png',
  'https://www.haslital-brienz.ch/vereine',
  'innertkirchen'
),
(
  'Webgruppe Innertkirchen',
  'webgruppe-innertkirchen',
  'Verein für digitale Kompetenz und Web-Projekte in Innertkirchen.',
  'education',
  null,
  null,
  '+41 79 384 13 41',
  '3862 Innertkirchen',
  46.6995, 8.2310,
  array['de'],
  '/brand/org-logos/haslital-brienz-ch.png',
  'https://www.haslital-brienz.ch/vereine',
  'innertkirchen'
),
(
  'Gemeinde Innertkirchen',
  'gemeinde-innertkirchen',
  'Gemeindeverwaltung Innertkirchen: Veranstaltungen, Vereine und Bürgerservice im Haslital.',
  'festival',
  'https://www.innertkirchen.ch',
  null,
  '+41 33 982 11 11',
  '3862 Innertkirchen',
  46.7000, 8.2300,
  array['de','gsw','en'],
  '/brand/org-logos/innertkirchen-ch.png',
  'https://www.innertkirchen.ch',
  'innertkirchen'
),
(
  'Trachtengruppe Brienz',
  'trachtengruppe-brienz',
  'Pflege von Tracht, Volkstanz und Brauchtum in Brienz am Brienzersee.',
  'culture',
  null,
  null,
  '+41 79 283 39 02',
  '3855 Brienz',
  46.7550, 8.0380,
  array['de','gsw'],
  '/brand/org-logos/haslital-brienz-ch.png',
  'https://www.haslital-brienz.ch/vereine',
  'brienz'
),
(
  'Handharmonika-Club Brienz',
  'handharmonika-club-brienz',
  'Handharmonika-Musik und gemeinsames Musizieren in Brienz.',
  'music',
  null,
  null,
  '+41 79 678 19 30',
  '3855 Brienz',
  46.7545, 8.0390,
  array['de','gsw'],
  '/brand/org-logos/haslital-brienz-ch.png',
  'https://www.haslital-brienz.ch/vereine',
  'brienz'
),
(
  'Schachclub Brienz',
  'schachclub-brienz',
  'Schachclub für Hobby- und Turnierspieler in Brienz.',
  'other',
  null,
  null,
  '+41 79 471 06 10',
  '3855 Brienz',
  46.7555, 8.0370,
  array['de'],
  '/brand/org-logos/haslital-brienz-ch.png',
  'https://www.haslital-brienz.ch/vereine',
  'brienz'
),
(
  'Eisbahnverein Brienz',
  'eisbahnverein-brienz',
  'Betrieb und Förderung der Kunsteisbahn Brienz — Eislaufen für die Region.',
  'sport',
  null,
  null,
  '+41 79 776 64 13',
  '3855 Brienz',
  46.7560, 8.0400,
  array['de','gsw','en'],
  '/brand/org-logos/haslital-brienz-ch.png',
  'https://www.haslital-brienz.ch/vereine',
  'brienz'
),
(
  'Gemeinde Brienz',
  'gemeinde-brienz',
  'Gemeindeverwaltung Brienz: Märkte, Feste und kulturelle Anlässe am Brienzersee.',
  'festival',
  'https://www.brienz.ch',
  null,
  '+41 33 951 35 51',
  '3855 Brienz',
  46.7550, 8.0380,
  array['de','gsw','en','fr','it'],
  '/brand/org-logos/brienz-ch.png',
  'https://www.brienz.ch',
  'brienz'
),
(
  'Musikförderverein Brienzwiler',
  'musikfoerderverein-brienzwiler',
  'Förderung von Musik und musikalischer Bildung in Brienzwiler.',
  'music',
  null,
  null,
  '+41 77 489 73 93',
  '3856 Brienzwiler',
  46.7500, 8.0900,
  array['de','gsw'],
  '/brand/org-logos/haslital-brienz-ch.png',
  'https://www.haslital-brienz.ch/vereine',
  'brienzwiler'
),
(
  'Damenturnverein Brienzwiler',
  'damenturnverein-brienzwiler',
  'Turnen und Bewegung für Damen in Brienzwiler.',
  'sport',
  null,
  null,
  '+41 33 951 32 00',
  '3856 Brienzwiler',
  46.7505, 8.0910,
  array['de','gsw'],
  '/brand/org-logos/haslital-brienz-ch.png',
  'https://www.haslital-brienz.ch/vereine',
  'brienzwiler'
),
(
  'Freischützen Brienzwiler',
  'freischuetzen-brienzwiler',
  'Traditionelle Schützenvereinigung in Brienzwiler.',
  'culture',
  null,
  null,
  '+41 79 762 40 79',
  '3856 Brienzwiler',
  46.7495, 8.0890,
  array['de','gsw'],
  '/brand/org-logos/haslital-brienz-ch.png',
  'https://www.haslital-brienz.ch/vereine',
  'brienzwiler'
),
(
  'Theaterliit Gadmen',
  'theaterliit-gadmen',
  'Lokale Theatergruppe mit Produktionen und Auftritten in Gadmen.',
  'culture',
  null,
  null,
  '+41 76 326 49 96',
  '3863 Gadmen',
  46.7350, 8.3500,
  array['de','gsw'],
  '/brand/org-logos/haslital-brienz-ch.png',
  'https://www.haslital-brienz.ch/vereine',
  'gadmen'
),
(
  'Trychelzug Gadmental',
  'trychelzug-gadmental',
  'Brauchtum und Trycheln im Gadmental — lebendige Haslital-Tradition.',
  'culture',
  null,
  null,
  '+41 76 576 13 23',
  '3863 Gadmen',
  46.7340, 8.3510,
  array['de','gsw'],
  '/brand/org-logos/haslital-brienz-ch.png',
  'https://www.haslital-brienz.ch/vereine',
  'gadmen'
),
(
  'Püüreladen Gadmen',
  'puuereladen-gadmen',
  'Gemeinschaftlicher Treffpunkt und kulturelle Begegnungen in Gadmen.',
  'social',
  null,
  null,
  '+41 79 484 03 13',
  '3863 Gadmen',
  46.7355, 8.3490,
  array['de','gsw'],
  '/brand/org-logos/haslital-brienz-ch.png',
  'https://www.haslital-brienz.ch/vereine',
  'gadmen'
),
(
  'Schützengesellschaft Hasliberg',
  'schuetzengesellschaft-hasliberg',
  'Traditionelle Schützengesellschaft auf dem Hasliberg.',
  'culture',
  null,
  null,
  '+41 79 693 97 84',
  '6083 Hasliberg',
  46.7500, 8.1700,
  array['de','gsw'],
  '/brand/org-logos/haslital-brienz-ch.png',
  'https://www.haslital-brienz.ch/vereine',
  'hasliberg'
),
(
  'Theaterverein Hasliberg',
  'theaterverein-hasliberg',
  'Theater und Kleinkunst auf dem Hasliberg.',
  'culture',
  null,
  null,
  '+41 79 246 58 10',
  '6083 Hasliberg',
  46.7510, 8.1710,
  array['de','gsw'],
  '/brand/org-logos/haslital-brienz-ch.png',
  'https://www.haslital-brienz.ch/vereine',
  'hasliberg'
),
(
  'Frauenverein Hasliberg',
  'frauenverein-hasliberg',
  'Frauenverein für Begegnung und gesellschaftliche Aktivitäten auf dem Hasliberg.',
  'social',
  null,
  null,
  '+41 33 971 27 90',
  '6083 Hasliberg',
  46.7490, 8.1690,
  array['de','gsw'],
  '/brand/org-logos/haslital-brienz-ch.png',
  'https://www.haslital-brienz.ch/vereine',
  'hasliberg'
),
(
  'Jodlerclub Oberried',
  'jodlerclub-oberried',
  'Jodeln und Brauchtum in Oberried am Brienzersee.',
  'music',
  null,
  null,
  '+41 33 951 33 35',
  '3854 Oberried am Brienzersee',
  46.7300, 8.1000,
  array['de','gsw'],
  '/brand/org-logos/haslital-brienz-ch.png',
  'https://www.haslital-brienz.ch/vereine',
  'oberried'
),
(
  'Frauenturnverein Oberried',
  'frauenturnverein-oberried',
  'Turnen und Bewegung für Frauen in Oberried.',
  'sport',
  null,
  null,
  '+41 33 849 15 68',
  '3854 Oberried am Brienzersee',
  46.7305, 8.1010,
  array['de','gsw'],
  '/brand/org-logos/haslital-brienz-ch.png',
  'https://www.haslital-brienz.ch/vereine',
  'oberried'
),
(
  'Skiclub Hofstetten',
  'skiclub-hofstetten',
  'Skisport und Wintersportaktivitäten in Hofstetten bei Brienz.',
  'sport',
  null,
  null,
  '+41 33 951 31 53',
  '3858 Hofstetten bei Brienz',
  46.7800, 8.0700,
  array['de','gsw'],
  '/brand/org-logos/haslital-brienz-ch.png',
  'https://www.haslital-brienz.ch/vereine',
  'hofstetten'
),
(
  'Verkehrsverein Hofstetten',
  'verkehrsverein-hofstetten',
  'Förderung von Tourismus und lokalen Angeboten in Hofstetten.',
  'other',
  null,
  null,
  '+41 79 334 62 08',
  '3858 Hofstetten bei Brienz',
  46.7805, 8.0710,
  array['de','gsw'],
  '/brand/org-logos/haslital-brienz-ch.png',
  'https://www.haslital-brienz.ch/vereine',
  'hofstetten'
),
(
  'Turnverein Schwanden-Hofstetten',
  'turnverein-schwanden-hofstetten',
  'Turnen und Sport für alle Altersgruppen in Schwanden und Hofstetten.',
  'sport',
  null,
  null,
  '+41 79 129 74 87',
  '3857 Schwanden bei Brienz',
  46.7600, 8.1300,
  array['de','gsw'],
  '/brand/org-logos/haslital-brienz-ch.png',
  'https://www.haslital-brienz.ch/vereine',
  'schwanden'
),
(
  'Frauenverein Schwanden',
  'frauenverein-schwanden',
  'Frauenverein für Begegnung und gesellschaftliche Projekte in Schwanden.',
  'social',
  null,
  null,
  '+41 78 725 44 27',
  '3857 Schwanden bei Brienz',
  46.7605, 8.1310,
  array['de','gsw'],
  '/brand/org-logos/haslital-brienz-ch.png',
  'https://www.haslital-brienz.ch/vereine',
  'schwanden'
),
(
  'Turnverein Guttannen',
  'turnverein-guttannen',
  'Turnen und Bewegung in Guttannen im Grimselgebiet.',
  'sport',
  null,
  null,
  '+41 79 758 54 41',
  '3864 Guttannen',
  46.6600, 8.2900,
  array['de','gsw'],
  '/brand/org-logos/haslital-brienz-ch.png',
  'https://www.haslital-brienz.ch/vereine',
  'guttannen'
),
(
  'Feldschützen Guttannen',
  'feldschuetzen-guttannen',
  'Traditionelle Feldschützen in Guttannen.',
  'culture',
  null,
  null,
  null,
  '3864 Guttannen',
  46.6605, 8.2910,
  array['de','gsw'],
  '/brand/org-logos/haslital-brienz-ch.png',
  'https://www.haslital-brienz.ch/vereine',
  'guttannen'
),
(
  'Guttannen bewegt',
  'guttannen-bewegt',
  'Bewegungs- und Gesundheitsangebote für die Bevölkerung in Guttannen.',
  'sport',
  null,
  null,
  null,
  '3864 Guttannen',
  46.6595, 8.2890,
  array['de','gsw'],
  '/brand/org-logos/haslital-brienz-ch.png',
  'https://www.haslital-brienz.ch/vereine',
  'guttannen'
),
(
  'Verein Pro Schattenhalb',
  'verein-pro-schattenhalb',
  'Engagement für Dorfleben, Kultur und Zusammenhalt in Schattenhalb.',
  'social',
  null,
  null,
  null,
  '3860 Schattenhalb',
  46.7100, 8.2100,
  array['de','gsw'],
  '/brand/org-logos/haslital-brienz-ch.png',
  'https://www.haslital-brienz.ch/vereine',
  'schattenhalb'
)
on conflict (slug) do nothing;

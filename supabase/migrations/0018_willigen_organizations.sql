-- Add confirmed Willigen organizations to the Meiringen/Haslital directory

insert into public.organizations (
  name, slug, description, category, website_url, email, phone, address,
  latitude, longitude, languages, image_url, source_url, locality
) values
(
  'Laufgruppe Willigen',
  'laufgruppe-willigen',
  'Laufverein für Kinder und Erwachsene in Willigen mit kostenlosen Trainings, Wettkämpfen und regionalen Laufangeboten.',
  'sport',
  'https://www.lgwilligen.ch',
  null,
  '079 726 63 38',
  'Gässli 30, 3860 Schattenhalb',
  46.7078, 8.2118,
  array['de','gsw'],
  'https://www.google.com/s2/favicons?domain=lgwilligen.ch&sz=128',
  'https://schattenhalb.ch/de/Tourismus_und_Freizeit/Vereine',
  'willigen'
),
(
  'Frauenverein Willigen',
  'frauenverein-willigen',
  'Frauenverein in Willigen, der sich für Dorfleben, Gemeinschaft und Angebote für ältere Einwohnerinnen und Einwohner engagiert.',
  'social',
  null,
  'fv.willigen@gmx.ch',
  '078 614 43 77',
  'Geissholz 187, 3860 Schattenhalb',
  46.7165, 8.2140,
  array['de','gsw'],
  'https://www.google.com/s2/favicons?domain=schattenhalb.ch&sz=128',
  'https://schattenhalb.ch/de/Tourismus_und_Freizeit/Vereine',
  'willigen'
)
on conflict (slug) do nothing;

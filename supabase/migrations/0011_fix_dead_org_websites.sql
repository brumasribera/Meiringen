-- Fix organization websites that fail DNS or are unreachable (audit 2026-06)

update public.organizations set
  website_url = 'https://www.haslital-brienz.ch/vereine',
  image_url = 'https://www.google.com/s2/favicons?domain=haslital-brienz.ch&sz=128'
where slug = 'curling-club-oberhasli';

update public.organizations set
  website_url = 'https://www.thunersee.ch/erlebnisse/poi/natureisbahn-brienz',
  image_url = 'https://www.google.com/s2/favicons?domain=thunersee.ch&sz=128'
where slug = 'eisbahnverein-brienz';

update public.organizations set
  website_url = 'https://www.haslital-brienz.ch/vereine',
  image_url = 'https://www.google.com/s2/favicons?domain=haslital-brienz.ch&sz=128'
where slug = 'fotoclub-haslital';

update public.organizations set
  website_url = 'https://www.jodlerklub-meiringen.ch',
  image_url = 'https://www.google.com/s2/favicons?domain=jodlerklub-meiringen.ch&sz=128'
where slug = 'jodlerklub-meiringen';

update public.organizations set
  website_url = 'https://volkstheaterfestival.ch',
  image_url = 'https://www.google.com/s2/favicons?domain=volkstheaterfestival.ch&sz=128'
where slug = 'theatergruppe-glinggige';

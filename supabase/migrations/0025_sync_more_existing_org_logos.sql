-- Promote additional existing app-owned local logo assets into organization records.

update public.organizations set
  website_url = 'https://www.ccoberhasli.ch',
  image_url = '/brand/org-logos/ccoberhasli.ch.svg'
where slug = 'curling-club-oberhasli';

update public.organizations set
  website_url = 'https://www.fcht.ch',
  image_url = '/brand/org-logos/fcht.ch.svg'
where slug = 'fotoclub-haslital';

update public.organizations set
  website_url = 'https://www.fv-oberhasli.ch',
  image_url = '/brand/org-logos/fv-oberhasli.ch.svg'
where slug = 'fv-oberhasli';

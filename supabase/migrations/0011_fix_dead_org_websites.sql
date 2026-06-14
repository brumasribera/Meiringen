-- Fix organization websites that fail DNS or are unreachable (audit 2026-06)

update public.organizations set
  website_url = 'https://www.haslital-brienz.ch/vereine',
  image_url = '/brand/org-logos/haslital-brienz-ch.png'
where slug = 'curling-club-oberhasli';

update public.organizations set
  website_url = 'https://www.thunersee.ch/erlebnisse/poi/natureisbahn-brienz',
  image_url = '/brand/org-logos/thunersee.ch.png'
where slug = 'eisbahnverein-brienz';

update public.organizations set
  website_url = 'https://www.haslital-brienz.ch/vereine',
  image_url = '/brand/org-logos/haslital-brienz-ch.png'
where slug = 'fotoclub-haslital';

update public.organizations set
  website_url = 'https://www.jodlerklub-meiringen.ch',
  image_url = '/brand/org-logos/jkmeiringen.ch.png'
where slug = 'jodlerklub-meiringen';

update public.organizations set
  website_url = 'https://volkstheaterfestival.ch',
  image_url = '/brand/org-logos/volkstheaterfestival.ch.svg'
where slug = 'theatergruppe-glinggige';

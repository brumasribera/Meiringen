-- Media enrichment for Willigen and weekly org discovery cron

update public.organizations set
  image_url = '/brand/org-logos/laufgruppe-willigen.instagram.jpg',
  cover_image_url = 'https://schattenhalb.ch/cmsfiles/hochmoor_pf_2012.jpg',
  cover_image_credit = 'Schattenhalb Gemeinde',
  cover_image_credit_url = 'https://schattenhalb.ch'
where slug = 'laufgruppe-willigen';

update public.organizations set
  image_url = '/brand/org-logos/meiringen-ch.png',
  cover_image_url = 'https://schattenhalb.ch/cmsfiles/hochmoor_pf_2012.jpg',
  cover_image_credit = 'Schattenhalb Gemeinde',
  cover_image_credit_url = 'https://schattenhalb.ch'
where slug = 'frauenverein-willigen';

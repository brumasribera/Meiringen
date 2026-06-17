-- Promote existing app-owned local logo assets into organization records.

update public.organizations set
  image_url = '/brand/org-logos/kino-meiringen.ch.png'
where slug = 'kino-meiringen';

update public.organizations set
  image_url = '/brand/org-logos/mgmeiringen.ch.png'
where slug = 'musikgesellschaft-meiringen';

update public.organizations set
  image_url = '/brand/org-logos/sac-cas.ch.png'
where slug = 'sac-oberhasli';

update public.organizations set
  image_url = '/brand/org-logos/schwingklub-meiringen.ch.png'
where slug = 'schwingklub-meiringen';

update public.organizations set
  image_url = '/brand/org-logos/tennismeiringen.ch.png'
where slug = 'tennisclub-meiringen';

update public.organizations set
  image_url = '/brand/org-logos/tvmeiringen.ch.png'
where slug = 'turnverein-meiringen';

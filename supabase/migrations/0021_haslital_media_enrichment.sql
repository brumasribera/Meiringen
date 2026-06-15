-- Media enrichment for confirmed Haslital additions

update public.organizations set
  image_url = '/brand/org-logos/samariter-meiringen.ch.svg',
  cover_image_url = 'https://de.cdn-website.com/59bdf33b423946d78ca54ff19601c597/dms3rep/multi/7214627-SuperSami_Retten-ist-Klasse.jpg'
where slug = 'samariterverein-meiringen';

update public.organizations set
  image_url = '/brand/org-logos/reitverein-oberhasli-brienz.ch.svg'
where slug = 'reitverein-oberhasli-brienz';

update public.organizations set
  image_url = '/brand/org-logos/kmu-oberhasli.ch.svg'
where slug = 'berner-kmu-oberhasli';

update public.organizations set
  image_url = '/brand/org-logos/fv-oberhasli.ch.svg',
  cover_image_url = 'https://www.fv-oberhasli.ch/wp-content/uploads/2018/11/bg-10-free-img.jpg'
where slug = 'fischereiverein-oberhasli';

update public.organizations set
  image_url = '/brand/org-logos/slrg-thunoberland.ch.svg'
where slug = 'slrg-sektion-thun-oberland-aussenstation-brienz-meiringen';

update public.organizations set
  image_url = '/brand/org-logos/lgwilligen.ch.svg'
where slug = 'laufgruppe-willigen';

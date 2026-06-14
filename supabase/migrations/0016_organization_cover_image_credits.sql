alter table public.organizations
  add column if not exists cover_image_credit text,
  add column if not exists cover_image_credit_url text;

update public.organizations set
  cover_image_credit = 'Thunersee Tourismus',
  cover_image_credit_url = 'https://www.thunersee.ch/erlebnisse/poi/natureisbahn-brienz'
where slug = 'eisbahnverein-brienz';

update public.organizations set
  cover_image_credit = 'Jodlerklub Meiringen',
  cover_image_credit_url = 'https://www.jodlerklub-meiringen.ch'
where slug = 'jodlerklub-meiringen';

update public.organizations set
  cover_image_credit = 'Karate Kickboxing Meiringen/Spiez',
  cover_image_credit_url = 'https://www.karate-kickboxing.ch'
where slug = 'karate-kickboxing-meiringen';

update public.organizations set
  cover_image_credit = 'Kino+ Meiringen',
  cover_image_credit_url = 'https://www.kino-meiringen.ch'
where slug = 'kino-meiringen';

update public.organizations set
  cover_image_credit = 'Kynologischer Verein Haslital Meiringen',
  cover_image_credit_url = 'https://kvmeiringen.jimdoweb.com'
where slug = 'kynologischer-verein-haslital';

update public.organizations set
  cover_image_credit = 'Mutter- und Vaterberatung Bern',
  cover_image_credit_url = 'https://www.mvb-be.ch'
where slug = 'muetter-vaeterberatung-oberhasli';

update public.organizations set
  cover_image_credit = 'Museumsverein der Landschaft Hasli',
  cover_image_credit_url = 'https://www.haslimuseum.ch'
where slug = 'museumsverein-haslital';

update public.organizations set
  cover_image_credit = 'Musikgesellschaft Brienzwiler',
  cover_image_credit_url = 'https://wp.mgbrienzwiler.ch/wordpress/musikfoerderverein/'
where slug = 'musikfoerderverein-brienzwiler';

update public.organizations set
  cover_image_credit = 'Nordischer Skiclub Oberhasli',
  cover_image_credit_url = 'https://nscoberhasli.ch'
where slug = 'nordischer-skiclub-oberhasli';

update public.organizations set
  cover_image_credit = 'Pfadfinder St. Christophorus Meiringen-Brienz',
  cover_image_credit_url = 'https://www.pfadimeiringenbrienz.ch'
where slug = 'pfadfinder-meiringen-brienz';

update public.organizations set
  cover_image_credit = 'Procap Schweiz',
  cover_image_credit_url = 'https://www.procap.ch'
where slug = 'procap-oberhasli';

update public.organizations set
  cover_image_credit = 'SAC-CAS',
  cover_image_credit_url = 'https://www.sac-cas.ch'
where slug = 'sac-oberhasli';

update public.organizations set
  cover_image_credit = 'Skiclub Hofstetten',
  cover_image_credit_url = 'https://www.sc-hofstetten.ch'
where slug = 'skiclub-hofstetten';

update public.organizations set
  cover_image_credit = 'Tauchclub Berner Oberland',
  cover_image_credit_url = 'https://www.tcbeo.ch'
where slug = 'tauchclub-berner-oberland';

update public.organizations set
  cover_image_credit = 'Volkstheaterfestival Meiringen',
  cover_image_credit_url = 'https://volkstheaterfestival.ch'
where slug = 'theatergruppe-glinggige';

update public.organizations set
  cover_image_credit = 'Turnverein Meiringen',
  cover_image_credit_url = 'https://www.tvmeiringen.ch'
where slug = 'turnverein-meiringen';

update public.organizations set
  cover_image_credit = 'Alpbachschlucht',
  cover_image_credit_url = 'https://www.alpbachschlucht.ch'
where slug = 'verein-pro-alpbachschlucht';

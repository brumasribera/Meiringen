-- Official club websites for organizations missing website_url
-- Sources: Haslital-Brienz Vereinsliste PDF (schattenhalb.ch), meiringen.ch,
-- vereinsverzeichnis.ch, and direct verification of club domains.

update public.organizations set
  website_url = 'https://nscoberhasli.ch',
  image_url = '/brand/org-logos/nscoberhasli.ch.png'
where slug = 'nordischer-skiclub-oberhasli';

update public.organizations set
  website_url = 'https://www.kkbeo.ch',
  image_url = '/brand/org-logos/kkbeo.ch.png'
where slug = 'kanu-klub-berner-oberland';

update public.organizations set
  website_url = 'https://www.tcbeo.ch',
  image_url = '/brand/org-logos/tcbeo.ch.png'
where slug = 'tauchclub-berner-oberland';

update public.organizations set
  website_url = 'http://www.ccoberhasli.ch',
  image_url = '/brand/org-logos/ccoberhasli.ch.svg'
where slug = 'curling-club-oberhasli';

update public.organizations set
  website_url = 'https://www.svmeiringen.ch',
  image_url = '/brand/org-logos/svmeiringen.ch.png'
where slug = 'sv-meiringen';

update public.organizations set
  website_url = 'https://www.fcht.ch',
  image_url = '/brand/org-logos/fcht.ch.svg'
where slug = 'fotoclub-haslital';

update public.organizations set
  website_url = 'https://www.karate-kickboxing.ch',
  image_url = '/brand/org-logos/karate-kickboxing.ch.png'
where slug = 'karate-kickboxing-meiringen';

update public.organizations set
  website_url = 'https://kvmeiringen.jimdoweb.com',
  image_url = '/brand/org-logos/kvmeiringen.jimdoweb.com.svg'
where slug = 'kynologischer-verein-haslital';

update public.organizations set
  website_url = 'https://www.flob.ch',
  image_url = '/brand/org-logos/flob.ch.png'
where slug = 'fluggruppe-flob';

update public.organizations set
  website_url = 'https://www.haslimuseum.ch',
  image_url = '/brand/org-logos/haslimuseum.ch.svg'
where slug = 'museumsverein-haslital';

update public.organizations set
  website_url = 'https://www.sg-balm.ch',
  image_url = '/brand/org-logos/sg-balm.ch.png'
where slug = 'schuetzengesellschaft-balm';

update public.organizations set
  website_url = 'https://www.schuetzenhausen.ch',
  image_url = '/brand/org-logos/schuetzenhausen.ch.png'
where slug = 'schuetzengesellschaft-hausen';

update public.organizations set
  website_url = 'https://www.glinggige.ch',
  image_url = '/brand/org-logos/glinggige.ch.svg'
where slug = 'theatergruppe-glinggige';

update public.organizations set
  website_url = 'https://www.fs-schattenhalb.ch',
  image_url = '/brand/org-logos/fs-schattenhalb.ch.png'
where slug = 'verein-pro-schattenhalb';

update public.organizations set
  website_url = 'https://www.hasliprodukt.ch',
  image_url = '/brand/org-logos/hasliprodukt.ch.svg'
where slug = 'puuereladen-gadmen';

update public.organizations set
  website_url = 'https://schwingklub-meiringen.ch',
  image_url = '/brand/org-logos/schwingklub-meiringen.ch.png'
where slug = 'schwingerfreunde-meiringen';

update public.organizations set
  website_url = 'https://www.trachtengruppe-oberhasli.ch',
  image_url = '/brand/org-logos/trachtengruppe-oberhasli.ch.svg'
where slug = 'trachtengruppe-oberhasli';

update public.organizations set
  website_url = 'https://www.kibio.ch',
  image_url = '/brand/org-logos/kibio.ch.png'
where slug = 'tagesfamilien-oberhasli';

update public.organizations set
  website_url = 'https://www.mvb-be.ch',
  image_url = '/brand/org-logos/mvb-be.ch.png'
where slug = 'muetter-vaeterberatung-oberhasli';

update public.organizations set
  website_url = 'https://wp.mgbrienzwiler.ch/wordpress/musikfoerderverein/',
  image_url = '/brand/org-logos/mgbrienzwiler.ch.svg'
where slug = 'musikfoerderverein-brienzwiler';

update public.organizations set
  website_url = 'https://www.sc-hofstetten.ch',
  image_url = '/brand/org-logos/sc-hofstetten.ch.svg'
where slug = 'skiclub-hofstetten';

update public.organizations set
  website_url = 'https://www.brienz.ch/vereinsliste/19535',
  image_url = '/brand/org-logos/brienz-ch.png'
where slug = 'eisbahnverein-brienz';

update public.organizations set
  website_url = 'https://www.brienzwiler.ch/freizeit/vereine-im-dorf',
  image_url = '/brand/org-logos/brienzwiler.ch.svg'
where slug in ('damenturnverein-brienzwiler', 'freischuetzen-brienzwiler');

update public.organizations set
  website_url = 'https://www.meiringen.ch/vereinsliste/24821',
  image_url = '/brand/org-logos/meiringen.ch.png'
where slug = 'maennerchor-saengerbund-meiringen';

update public.organizations set
  website_url = 'https://www.meiringen.ch/vereinsliste/23511',
  image_url = '/brand/org-logos/meiringen.ch.png'
where slug = 'frauenchor-meiringen';

update public.organizations set
  website_url = 'https://www.schweizerjodel.ch/interpreten/jodlerklub-oberried-am-brienzersee/',
  image_url = '/brand/org-logos/schweizerjodel.ch.png'
where slug = 'jodlerclub-oberried';

update public.organizations set
  website_url = 'https://www.gadmen.ch',
  image_url = '/brand/org-logos/gadmen.ch.svg'
where slug in ('theaterliit-gadmen', 'trychelzug-gadmental');

update public.organizations set
  website_url = 'https://www.guttannen.ch',
  image_url = '/brand/org-logos/guttannen-ch.png'
where slug in ('turnverein-guttannen', 'feldschuetzen-guttannen', 'guttannen-bewegt');

update public.organizations set
  website_url = 'https://www.haslital-brienz.ch/vereine',
  image_url = '/brand/org-logos/haslital-brienz-ch.png'
where slug in (
  'amc-auto-moto-club-haslital',
  'art-culture-community',
  'fv-oberhasli',
  'gemeinnuetziger-verein-meiringen',
  'frauenchor-innertkirchen',
  'frauenturnverein-oberried',
  'frauenverein-hasliberg',
  'frauenverein-schwanden',
  'handharmonika-club-brienz',
  'jodlerklub-innertkirchen',
  'schachclub-brienz',
  'schuetzengesellschaft-hasliberg',
  'theaterverein-hasliberg',
  'trachtengruppe-brienz',
  'turnverein-schwanden-hofstetten',
  'verkehrsverein-hofstetten',
  'webgruppe-innertkirchen'
);

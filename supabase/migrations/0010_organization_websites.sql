-- Official club websites for organizations missing website_url
-- Sources: Haslital-Brienz Vereinsliste PDF (schattenhalb.ch), meiringen.ch,
-- vereinsverzeichnis.ch, and direct verification of club domains.

update public.organizations set
  website_url = 'https://nscoberhasli.ch',
  image_url = 'https://www.google.com/s2/favicons?domain=nscoberhasli.ch&sz=128'
where slug = 'nordischer-skiclub-oberhasli';

update public.organizations set
  website_url = 'https://www.kkbeo.ch',
  image_url = 'https://www.google.com/s2/favicons?domain=kkbeo.ch&sz=128'
where slug = 'kanu-klub-berner-oberland';

update public.organizations set
  website_url = 'https://www.tcbeo.ch',
  image_url = 'https://www.google.com/s2/favicons?domain=tcbeo.ch&sz=128'
where slug = 'tauchclub-berner-oberland';

update public.organizations set
  website_url = 'http://www.ccoberhasli.ch',
  image_url = 'https://www.google.com/s2/favicons?domain=ccoberhasli.ch&sz=128'
where slug = 'curling-club-oberhasli';

update public.organizations set
  website_url = 'https://www.svmeiringen.ch',
  image_url = 'https://www.google.com/s2/favicons?domain=svmeiringen.ch&sz=128'
where slug = 'sv-meiringen';

update public.organizations set
  website_url = 'https://www.fcht.ch',
  image_url = 'https://www.google.com/s2/favicons?domain=fcht.ch&sz=128'
where slug = 'fotoclub-haslital';

update public.organizations set
  website_url = 'https://www.karate-kickboxing.ch',
  image_url = 'https://www.google.com/s2/favicons?domain=karate-kickboxing.ch&sz=128'
where slug = 'karate-kickboxing-meiringen';

update public.organizations set
  website_url = 'https://kvmeiringen.jimdoweb.com',
  image_url = 'https://www.google.com/s2/favicons?domain=kvmeiringen.jimdoweb.com&sz=128'
where slug = 'kynologischer-verein-haslital';

update public.organizations set
  website_url = 'https://www.flob.ch',
  image_url = 'https://www.google.com/s2/favicons?domain=flob.ch&sz=128'
where slug = 'fluggruppe-flob';

update public.organizations set
  website_url = 'https://www.haslimuseum.ch',
  image_url = 'https://www.google.com/s2/favicons?domain=haslimuseum.ch&sz=128'
where slug = 'museumsverein-haslital';

update public.organizations set
  website_url = 'https://www.sg-balm.ch',
  image_url = 'https://www.google.com/s2/favicons?domain=sg-balm.ch&sz=128'
where slug = 'schuetzengesellschaft-balm';

update public.organizations set
  website_url = 'https://www.schuetzenhausen.ch',
  image_url = 'https://www.google.com/s2/favicons?domain=schuetzenhausen.ch&sz=128'
where slug = 'schuetzengesellschaft-hausen';

update public.organizations set
  website_url = 'https://www.glinggige.ch',
  image_url = 'https://www.google.com/s2/favicons?domain=glinggige.ch&sz=128'
where slug = 'theatergruppe-glinggige';

update public.organizations set
  website_url = 'https://www.fs-schattenhalb.ch',
  image_url = 'https://www.google.com/s2/favicons?domain=fs-schattenhalb.ch&sz=128'
where slug = 'verein-pro-schattenhalb';

update public.organizations set
  website_url = 'https://www.hasliprodukt.ch',
  image_url = 'https://www.google.com/s2/favicons?domain=hasliprodukt.ch&sz=128'
where slug = 'puuereladen-gadmen';

update public.organizations set
  website_url = 'https://schwingklub-meiringen.ch',
  image_url = 'https://www.google.com/s2/favicons?domain=schwingklub-meiringen.ch&sz=128'
where slug = 'schwingerfreunde-meiringen';

update public.organizations set
  website_url = 'https://www.trachtengruppe-oberhasli.ch',
  image_url = 'https://www.google.com/s2/favicons?domain=trachtengruppe-oberhasli.ch&sz=128'
where slug = 'trachtengruppe-oberhasli';

update public.organizations set
  website_url = 'https://www.kibio.ch',
  image_url = 'https://www.google.com/s2/favicons?domain=kibio.ch&sz=128'
where slug = 'tagesfamilien-oberhasli';

update public.organizations set
  website_url = 'https://www.mvb-be.ch',
  image_url = 'https://www.google.com/s2/favicons?domain=mvb-be.ch&sz=128'
where slug = 'muetter-vaeterberatung-oberhasli';

update public.organizations set
  website_url = 'https://wp.mgbrienzwiler.ch/wordpress/musikfoerderverein/',
  image_url = 'https://www.google.com/s2/favicons?domain=mgbrienzwiler.ch&sz=128'
where slug = 'musikfoerderverein-brienzwiler';

update public.organizations set
  website_url = 'https://www.sc-hofstetten.ch',
  image_url = 'https://www.google.com/s2/favicons?domain=sc-hofstetten.ch&sz=128'
where slug = 'skiclub-hofstetten';

update public.organizations set
  website_url = 'https://www.brienz.ch/vereinsliste/19535',
  image_url = 'https://www.google.com/s2/favicons?domain=brienz.ch&sz=128'
where slug = 'eisbahnverein-brienz';

update public.organizations set
  website_url = 'https://www.brienzwiler.ch/freizeit/vereine-im-dorf',
  image_url = 'https://www.google.com/s2/favicons?domain=brienzwiler.ch&sz=128'
where slug in ('damenturnverein-brienzwiler', 'freischuetzen-brienzwiler');

update public.organizations set
  website_url = 'https://www.meiringen.ch/vereinsliste/24821',
  image_url = 'https://www.google.com/s2/favicons?domain=meiringen.ch&sz=128'
where slug = 'maennerchor-saengerbund-meiringen';

update public.organizations set
  website_url = 'https://www.meiringen.ch/vereinsliste/23511',
  image_url = 'https://www.google.com/s2/favicons?domain=meiringen.ch&sz=128'
where slug = 'frauenchor-meiringen';

update public.organizations set
  website_url = 'https://www.schweizerjodel.ch/interpreten/jodlerklub-oberried-am-brienzersee/',
  image_url = 'https://www.google.com/s2/favicons?domain=schweizerjodel.ch&sz=128'
where slug = 'jodlerclub-oberried';

update public.organizations set
  website_url = 'https://www.gadmen.ch',
  image_url = 'https://www.google.com/s2/favicons?domain=gadmen.ch&sz=128'
where slug in ('theaterliit-gadmen', 'trychelzug-gadmental');

update public.organizations set
  website_url = 'https://www.guttannen.ch',
  image_url = 'https://www.google.com/s2/favicons?domain=guttannen.ch&sz=128'
where slug in ('turnverein-guttannen', 'feldschuetzen-guttannen', 'guttannen-bewegt');

update public.organizations set
  website_url = 'https://www.haslital-brienz.ch/vereine',
  image_url = 'https://www.google.com/s2/favicons?domain=haslital-brienz.ch&sz=128'
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

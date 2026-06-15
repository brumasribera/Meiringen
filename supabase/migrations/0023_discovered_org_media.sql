-- Discovered organization media from official, social and search sources

update public.organizations set
  image_url = '/brand/org-logos/dvo-detaillistenverein-oberhasli.api-i-web-ch.logo.jpg'
where slug = 'dvo-detaillistenverein-oberhasli';

update public.organizations set
  image_url = '/brand/org-logos/dynamo-wiggaefisch.api-i-web-ch.logo.jpg'
where slug = 'dynamo-wiggaefisch';

update public.organizations set
  image_url = '/brand/org-logos/gemeinde-brienz.brienz-ch.logo.svg',
  cover_image_url = '/brand/org-covers/gemeinde-brienz.brienz-ch.cover.jpg',
  cover_image_credit = 'brienz.ch',
  cover_image_credit_url = 'https://www.brienz.ch/'
where slug = 'gemeinde-brienz';

update public.organizations set
  image_url = '/brand/org-logos/gemeinde-innertkirchen.innertkirchen-ch.logo.png',
  cover_image_url = '/brand/org-covers/gemeinde-innertkirchen.innertkirchen-ch.cover.jpg',
  cover_image_credit = 'innertkirchen.ch',
  cover_image_credit_url = 'https://www.innertkirchen.ch/'
where slug = 'gemeinde-innertkirchen';

update public.organizations set
  image_url = '/brand/org-logos/gemeinde-meiringen.meiringen-ch.logo.png'
where slug = 'gemeinde-meiringen';

update public.organizations set
  image_url = '/brand/org-logos/jodlerclub-oberried.schweizerjodel-ch.logo.svg',
  cover_image_url = '/brand/org-covers/jodlerclub-oberried.schweizerjodel-ch.cover.gif',
  cover_image_credit = 'schweizerjodel.ch',
  cover_image_credit_url = 'https://www.schweizerjodel.ch/interpreten/jodlerklub-oberried-am-brienzersee/'
where slug = 'jodlerclub-oberried';

update public.organizations set
  image_url = '/brand/org-logos/kanu-klub-berner-oberland.kkbeo-ch.logo.png'
where slug = 'kanu-klub-berner-oberland';

update public.organizations set
  cover_image_url = '/brand/org-covers/musikgesellschaft-meiringen.scontent-fsog1-1-fna-fbcdn-net.cover.png',
  cover_image_credit = 'facebook.com',
  cover_image_credit_url = 'https://www.facebook.com/mgmeiringen/'
where slug = 'musikgesellschaft-meiringen';

update public.organizations set
  image_url = '/brand/org-logos/procap-oberhasli.procap-ch.logo.png',
  cover_image_url = '/brand/org-covers/procap-oberhasli.procap-ch.cover.jpg',
  cover_image_credit = 'procap.ch',
  cover_image_credit_url = 'https://www.procap.ch/'
where slug = 'procap-oberhasli';

update public.organizations set
  image_url = '/brand/org-logos/reitverein-oberhasli-brienz.image-jimcdn-com.logo.png'
where slug = 'reitverein-oberhasli-brienz';

update public.organizations set
  cover_image_url = '/brand/org-covers/sac-oberhasli.sac-cas-ch.cover.jpg',
  cover_image_credit = 'sac-cas.ch',
  cover_image_credit_url = 'https://www.sac-cas.ch/de/'
where slug = 'sac-oberhasli';

update public.organizations set
  cover_image_url = '/brand/org-covers/turnverein-meiringen.static-wixstatic-com.cover.jpg',
  cover_image_credit = 'tvmeiringen.ch',
  cover_image_credit_url = 'https://www.tvmeiringen.ch/'
where slug = 'turnverein-meiringen';

update public.organizations set
  cover_image_url = '/brand/org-covers/tagesfamilien-oberhasli.static-wixstatic-com.cover.png',
  cover_image_credit = 'kibio.ch',
  cover_image_credit_url = 'https://www.kibio.ch/'
where slug = 'tagesfamilien-oberhasli';

alter table public.organizations
  add column if not exists cover_image_url text;

-- Cover photos sourced from official club or organization websites
-- and the Haslital-Brienz / municipal club listings that point to them.

update public.organizations set
  cover_image_url = 'https://dam.destination.one/194809/6b50293c5c3fa56f9d3f1e70b3d33f354dd08011059226b2ff99074e02d48df8/brienz-natureisbahn-schlittschuhlaufen-winter-eis.jpg'
where slug = 'eisbahnverein-brienz';

update public.organizations set
  cover_image_url = 'https://jodlerklub-meiringen.ch/images/1.-Tenor-01_24-scaled.jpg'
where slug = 'jodlerklub-meiringen';

update public.organizations set
  cover_image_url = 'https://image.jimcdn.com/app/cms/image/transf/none/path/sd9d2020e30b158e6/backgroundarea/ib0740ab62c97827f/version/1705152187/image.jpg'
where slug = 'kynologischer-verein-haslital';

update public.organizations set
  cover_image_url = 'https://image.jimcdn.com/app/cms/image/transf/dimension=1920x1024:format=jpg/path/s6e7889aa5fccf8e5/image/i39ce2a0d8b431096/version/1777793843/image.jpg'
where slug = 'museumsverein-haslital';

update public.organizations set
  cover_image_url = 'https://www.procap.ch/fileadmin/_processed_/0/9/csm_20211019_Headerslide_Magazin_3-21_a87064fe64.jpg'
where slug = 'procap-oberhasli';

update public.organizations set
  cover_image_url = 'https://www.sac-cas.ch/typo3temp/assets/_processed_/3/1/csm_Sac-cas-og-de-2_c29f78ba10.jpg'
where slug = 'sac-oberhasli';

update public.organizations set
  cover_image_url = 'https://image.jimcdn.com/app/cms/image/transf/none/path/s0bd5f299d78669a9/image/id3cb55b28ac96f6d/version/1772211701/image.png'
where slug = 'skiclub-hofstetten';

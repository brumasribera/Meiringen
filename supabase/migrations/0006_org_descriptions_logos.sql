-- English descriptions + logo fixes

alter table public.organizations
  add column if not exists description_en text;

-- Dedicated websites discovered for orgs that only had portal listings
update public.organizations set
  website_url = 'https://www.jkmeiringen.ch',
  image_url = '/brand/org-logos/jkmeiringen.ch.png'
where slug = 'jodlerklub-meiringen';

update public.organizations set
  website_url = 'https://www.pfadimeiringenbrienz.ch',
  image_url = '/brand/org-logos/pfadimeiringenbrienz.ch.png'
where slug = 'pfadfinder-meiringen-brienz';

update public.organizations set
  website_url = 'https://www.uhcbrienz.ch',
  image_url = '/brand/org-logos/uhcbrienz.ch.png'
where slug = 'uhc-brienz-oberhasli';

update public.organizations set
  website_url = 'https://www.alpbachschlucht.ch',
  image_url = '/brand/org-logos/alpbachschlucht.ch.png'
where slug = 'verein-pro-alpbachschlucht';

-- Replace generic portal favicons with locality municipality logos
update public.organizations set image_url = '/brand/org-logos/brienz-ch.png'
where locality in ('brienz', 'brienzwiler', 'oberried', 'schwanden', 'hofstetten')
  and image_url like '%haslital-brienz.ch%';

update public.organizations set image_url = '/brand/org-logos/innertkirchen-ch.png'
where locality in ('innertkirchen', 'gadmen')
  and image_url like '%haslital-brienz.ch%';

update public.organizations set image_url = '/brand/org-logos/guttannen-ch.png'
where locality = 'guttannen'
  and image_url like '%haslital-brienz.ch%';

update public.organizations set image_url = '/brand/org-logos/hasliberg-ch.png'
where locality = 'hasliberg'
  and image_url like '%haslital-brienz.ch%';

update public.organizations set image_url = '/brand/org-logos/meiringen-ch.png'
where locality in ('meiringen', 'balm', 'hausen', 'schattenhalb')
  and image_url like '%haslital-brienz.ch%';

update public.organizations set image_url = '/brand/org-logos/meiringen-ch.png'
where image_url like '%vereinsverzeichnis.ch%'
   or image_url like '%localcities.ch%';

-- English descriptions
update public.organizations set description_en = 'Active since 1875: brass band and drummers with spring concerts, serenades and performances across the region.' where slug = 'musikgesellschaft-meiringen';
update public.organizations set description_en = 'Founded in 1944. Preserves yodelling and folk traditions with weekly rehearsals and an annual concert on the first March weekend.' where slug = 'jodlerklub-meiringen';
update public.organizations set description_en = 'Preserves Hasli traditional dress, folk dance, folk song and folk theatre in Meiringen and the region.' where slug = 'trachtengruppe-oberhasli';
update public.organizations set description_en = 'Traditional men''s choir with performances and singing in Meiringen.' where slug = 'maennerchor-saengerbund-meiringen';
update public.organizations set description_en = 'Women''s choir for classical and traditional choral music in Meiringen.' where slug = 'frauenchor-meiringen';
update public.organizations set description_en = 'Local theatre group with productions and performances in Meiringen.' where slug = 'theatergruppe-glinggige';
update public.organizations set description_en = 'Non-profit cultural association: cinema, comedy, concerts and meeting spaces in the heart of Meiringen.' where slug = 'kino-meiringen';
update public.organizations set description_en = 'Supporting association of the Hasli Museum — preserving and sharing regional history.' where slug = 'museumsverein-haslital';
update public.organizations set description_en = 'Community for art and culture in the Haslital — connecting creative people.' where slug = 'art-culture-community';
update public.organizations set description_en = 'Photography club for hobby and ambitious photographers in the Haslital region.' where slug = 'fotoclub-haslital';
update public.organizations set description_en = 'Association promoting customs, festivals and regional culture in the Oberhasli.' where slug = 'fv-oberhasli';
update public.organizations set description_en = 'Non-profit association for social and community projects in Meiringen.' where slug = 'gemeinnuetziger-verein-meiringen';
update public.organizations set description_en = 'Gymnastics, volleyball and running for children, active members and seniors — including TBO tournaments.' where slug = 'turnverein-meiringen';
update public.organizations set description_en = 'Since 1931: Swiss wrestling with the Haslital youth wrestling day and the Schwing and Älpler festival on Engstlenalp.' where slug = 'schwingklub-meiringen';
update public.organizations set description_en = 'Friends and supporters of Swiss wrestling in Meiringen.' where slug = 'schwingerfreunde-meiringen';
update public.organizations set description_en = 'Alpine tennis centre: tennis, padel, badminton and pickleball in the Haslital.' where slug = 'tennisclub-meiringen';
update public.organizations set description_en = 'Football club offering training and match play for the Meiringen region.' where slug = 'sv-meiringen';
update public.organizations set description_en = 'Curling for beginners and advanced players in the Oberhasli.' where slug = 'curling-club-oberhasli';
update public.organizations set description_en = 'Cross-country skiing and Nordic disciplines in the ski area and Haslital.' where slug = 'nordischer-skiclub-oberhasli';
update public.organizations set description_en = 'Martial arts training: karate and kickboxing for children and adults.' where slug = 'karate-kickboxing-meiringen';
update public.organizations set description_en = 'Canoe and kayak on rivers and lakes in the Bernese Oberland.' where slug = 'kanu-klub-berner-oberland';
update public.organizations set description_en = 'Diving and underwater activities for members from the region.' where slug = 'tauchclub-berner-oberland';
update public.organizations set description_en = 'Swiss Alpine Club Oberhasli section: hiking, mountaineering and mountain huts.' where slug = 'sac-oberhasli';
update public.organizations set description_en = 'Floorball club for juniors and adults in Brienz and Oberhasli.' where slug = 'uhc-brienz-oberhasli';
update public.organizations set description_en = 'Preservation and promotion of the Aare Gorge and Alpbach Gorge trail near Meiringen.' where slug = 'verein-pro-alpbachschlucht';
update public.organizations set description_en = 'Dog sports and canine activities for dog owners in the Haslital.' where slug = 'kynologischer-verein-haslital';
update public.organizations set description_en = 'Car and motorcycle club for enthusiasts in the Haslital.' where slug = 'amc-auto-moto-club-haslital';
update public.organizations set description_en = 'Flying group for model and air sports enthusiasts in Oberhasli and Brienz.' where slug = 'fluggruppe-flob';
update public.organizations set description_en = 'Traditional shooting society in Meiringen-Balm.' where slug = 'schuetzengesellschaft-balm';
update public.organizations set description_en = 'Traditional shooting society in Meiringen-Hausen.' where slug = 'schuetzengesellschaft-hausen';
update public.organizations set description_en = 'Scout group for children and young people in Meiringen and Brienz.' where slug = 'pfadfinder-meiringen-brienz';
update public.organizations set description_en = 'Counselling and support for parents in the Interlaken-Oberhasli region.' where slug = 'muetter-vaeterberatung-oberhasli';
update public.organizations set description_en = 'Network of day-care families and foster care in the region.' where slug = 'tagesfamilien-oberhasli';
update public.organizations set description_en = 'Self-help organisation for people with physical disabilities.' where slug = 'procap-oberhasli';
update public.organizations set description_en = 'Official municipal administration: events, markets, culture and citizen services.' where slug = 'gemeinde-meiringen';
update public.organizations set description_en = 'Preserves yodelling and folk traditions in Innertkirchen and the Aare Gorge region.' where slug = 'jodlerklub-innertkirchen';
update public.organizations set description_en = 'Women''s choir for classical and traditional choral music in Innertkirchen.' where slug = 'frauenchor-innertkirchen';
update public.organizations set description_en = 'Association for digital skills and web projects in Innertkirchen.' where slug = 'webgruppe-innertkirchen';
update public.organizations set description_en = 'Innertkirchen municipal administration: events, clubs and citizen services in the Haslital.' where slug = 'gemeinde-innertkirchen';
update public.organizations set description_en = 'Preserves traditional dress, folk dance and customs in Brienz on Lake Brienz.' where slug = 'trachtengruppe-brienz';
update public.organizations set description_en = 'Accordion music and joint playing in Brienz.' where slug = 'handharmonika-club-brienz';
update public.organizations set description_en = 'Chess club for hobby and tournament players in Brienz.' where slug = 'schachclub-brienz';
update public.organizations set description_en = 'Operation and promotion of the Brienz ice rink — ice skating for the region.' where slug = 'eisbahnverein-brienz';
update public.organizations set description_en = 'Brienz municipal administration: markets, festivals and cultural events on Lake Brienz.' where slug = 'gemeinde-brienz';
update public.organizations set description_en = 'Promotion of music and musical education in Brienzwiler.' where slug = 'musikfoerderverein-brienzwiler';
update public.organizations set description_en = 'Gymnastics and movement for women in Brienzwiler.' where slug = 'damenturnverein-brienzwiler';
update public.organizations set description_en = 'Traditional shooting association in Brienzwiler.' where slug = 'freischuetzen-brienzwiler';
update public.organizations set description_en = 'Local theatre group with productions and performances in Gadmen.' where slug = 'theaterliit-gadmen';
update public.organizations set description_en = 'Cowbell tradition in the Gadmental — living Haslital heritage.' where slug = 'trychelzug-gadmental';
update public.organizations set description_en = 'Community meeting point and cultural gatherings in Gadmen.' where slug = 'puuereladen-gadmen';
update public.organizations set description_en = 'Traditional shooting society on the Hasliberg.' where slug = 'schuetzengesellschaft-hasliberg';
update public.organizations set description_en = 'Theatre and cabaret on the Hasliberg.' where slug = 'theaterverein-hasliberg';
update public.organizations set description_en = 'Women''s association for social activities on the Hasliberg.' where slug = 'frauenverein-hasliberg';
update public.organizations set description_en = 'Yodelling and folk traditions in Oberried am Brienzersee.' where slug = 'jodlerclub-oberried';
update public.organizations set description_en = 'Gymnastics and movement for women in Oberried.' where slug = 'frauenturnverein-oberried';
update public.organizations set description_en = 'Ski sports and winter activities in Hofstetten bei Brienz.' where slug = 'skiclub-hofstetten';
update public.organizations set description_en = 'Promotion of tourism and local offerings in Hofstetten.' where slug = 'verkehrsverein-hofstetten';
update public.organizations set description_en = 'Gymnastics and sport for all ages in Schwanden and Hofstetten.' where slug = 'turnverein-schwanden-hofstetten';
update public.organizations set description_en = 'Women''s association for social projects in Schwanden.' where slug = 'frauenverein-schwanden';
update public.organizations set description_en = 'Gymnastics and movement in Guttannen in the Grimsel area.' where slug = 'turnverein-guttannen';
update public.organizations set description_en = 'Traditional field shooters in Guttannen.' where slug = 'feldschuetzen-guttannen';
update public.organizations set description_en = 'Movement and health activities for residents in Guttannen.' where slug = 'guttannen-bewegt';
update public.organizations set description_en = 'Commitment to village life, culture and community in Schattenhalb.' where slug = 'verein-pro-schattenhalb';

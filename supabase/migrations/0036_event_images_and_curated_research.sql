-- Add source-provided event images and seed researched public events.

alter table public.events
  add column if not exists image_url text;

update public.events
set status = 'draft'
where status = 'published'
  and (
    title ~* '^(kino\+?[[:space:]]*programm|toy story[[:space:]]*5|vaiana[[:space:]]*\(live action\)|diamanti|amarga navidad)$'
    or title ~* '^[[:alpha:] .''-]+[[:space:]]+(autor|autorin|artist|künstler|kuenstler)$'
  );

with curated_events (
  slug, title, description, category, start_date, end_date, location_name,
  address, price, language, is_recurring, source_url, image_url
) as (
  values
  ('samstag-markt-casinoplatz-2026-08-15', 'Samstag-Markt auf dem Casinoplatz', 'Traditioneller Markt mit regionalen Produkten, Bistro, Hot-Dog und Chäsbrätel im Zentrum von Meiringen.', 'market', '2026-08-15T06:00:00.000Z', '2026-08-15T10:00:00.000Z', 'Casinoplatz Meiringen', '3860 Meiringen', null, 'de', 'true', 'https://www.myswitzerland.com/de-ch/erlebnisse/veranstaltungen/samstagmarkt-auf-dem-casinoplatz-mit-bistro-von-08001200-uhr-8/', 'https://media.myswitzerland.com/image/fetch/c_lfill,g_auto,w_3200,h_1800/f_auto,q_80,fl_keep_iptc/https://d37dhr5745n0y2.cloudfront.net/5/21/d9/521d90feffbed0719dc66f4e6cea3ea70df208a9_933818209.jpg'),
  ('bach-orgelkonzert-meiringen-prof-freitag-2026-08-21', 'Bach-Orgelkonzert in Meiringen mit Prof. Freitag', 'Bach-Tour 26 mit Prof. Helmut Freitag an der Rieger-Orgel der reformierten Michaelskirche.', 'music', '2026-08-21T17:00:00.000Z', '2026-08-21T18:15:00.000Z', 'Evang.-ref. Michaelskirche', 'Bei der Kirche, 3860 Meiringen', 'Eintritt frei, Kollekte', 'de', 'false', 'https://www.myswitzerland.com/de-ch/erlebnisse/veranstaltungen/bachorgelkonzert-in-meiringen-mit-prof-freitag/', 'https://media.myswitzerland.com/image/fetch/c_lfill,g_auto,w_3200,h_1800/f_auto,q_80,fl_keep_iptc/https://d37dhr5745n0y2.cloudfront.net/7/d5/9f/7d59fb227238303206c20605228c88f59be89161_931418001.jpg'),
  ('samstag-markt-casinoplatz-2026-08-22', 'Samstag-Markt auf dem Casinoplatz', 'Traditioneller Markt mit regionalen Produkten und Bistro im Zentrum von Meiringen.', 'market', '2026-08-22T06:00:00.000Z', '2026-08-22T10:00:00.000Z', 'Casinoplatz Meiringen', '3860 Meiringen', null, 'de', 'true', 'https://www.myswitzerland.com/de-ch/erlebnisse/veranstaltungen/samstagmarkt-auf-dem-casinoplatz-mit-bistro-von-08001200-uhr-9/', 'https://media.myswitzerland.com/image/fetch/c_lfill,g_auto,w_3200,h_1800/f_auto,q_80,fl_keep_iptc/https://d37dhr5745n0y2.cloudfront.net/d/c6/12/dc612ff5d07da8c47a8302dd3a9aa9ca7172e646_933818208.jpg'),
  ('migros-hiking-sounds-meiringen-hasliberg-2026-08-29', 'Migros Hiking Sounds - Meiringen-Hasliberg', 'Musik- und Wanderfestival auf dem Hasliberg mit Vanessa Mai und Dodo.', 'music', '2026-08-29T07:00:00.000Z', null, 'Meiringen-Hasliberg', '6084 Hasliberg Wasserwendi', null, 'de', 'false', 'https://en.panorama-hasliberg.ch/175/migros-hiking-sounds', 'https://meiringen-hasliberg.ch/cmsfiles/posts/images/7f9403a7-d54b-407a-befc-9a2f15c1ecbd_rw_1920_img2_thmb1.jpg'),
  ('fuehrungen-michaelskirche-2026-08-29', 'Führungen Michaelskirche, Ausgrabungen und Turm', 'Führung durch Michaelskirche, Ausgrabungen und Turm mit restauriertem Uhrwerk von 1898.', 'culture', '2026-08-29T14:30:00.000Z', '2026-08-29T16:00:00.000Z', 'Michaelskirche Meiringen', 'Bei der Kirche 2, 3860 Meiringen', 'Freiwillige Kollekte', 'de', 'true', 'https://www.myswitzerland.com/de-ch/erlebnisse/veranstaltungen/fuehrungen-michaelskirche-ausgrabungen-und-turm/', 'https://media.myswitzerland.com/image/fetch/c_lfill,g_auto,w_3200,h_1800/f_auto,q_80,fl_keep_iptc/https://d37dhr5745n0y2.cloudfront.net/d/f9/13/df913de9ada697a184dedc147712fbe236d31f73_802413338.jpg'),
  ('migros-hiking-sounds-meiringen-hasliberg-2026-08-30', 'Migros Hiking Sounds - Meiringen-Hasliberg', 'Musik- und Wanderfestival auf dem Hasliberg mit Stubete Gäng, Halunke und Heimatliebi.', 'music', '2026-08-30T07:00:00.000Z', null, 'Meiringen-Hasliberg', '6084 Hasliberg Wasserwendi', null, 'de', 'false', 'https://en.panorama-hasliberg.ch/175/migros-hiking-sounds', 'https://meiringen-hasliberg.ch/cmsfiles/posts/images/7f9403a7-d54b-407a-befc-9a2f15c1ecbd_rw_1920_img2_thmb1.jpg'),
  ('weindegustation-taellihuette-2026-09-03', 'Weindegustation auf der Tällihütte', 'Schweizer Weine mit begleitetem Hüttenmenu in alpiner Atmosphäre.', 'social', '2026-09-03T16:00:00.000Z', '2026-09-03T19:30:00.000Z', 'Berggasthaus Tälli', 'Birchlaui 222, 3863 Gadmen', 'CHF 68', 'de', 'true', 'https://www.myswitzerland.com/de-ch/erlebnisse/veranstaltungen/weindegustation-auf-der-taellihuette/', 'https://media.myswitzerland.com/image/fetch/c_lfill,g_auto,w_3200,h_1800/f_auto,q_80,fl_keep_iptc/https://d37dhr5745n0y2.cloudfront.net/0/6b/26/06b26ae9a28fc2e72555bff68870d3302878b355_926016497.jpg'),
  ('samstag-markt-casinoplatz-2026-09-05', 'Samstag-Markt auf dem Casinoplatz', 'Traditioneller Markt mit regionalen Produkten, Bistro und Live-Musik im Zentrum von Meiringen.', 'market', '2026-09-05T06:00:00.000Z', '2026-09-05T10:00:00.000Z', 'Casinoplatz Meiringen', '3860 Meiringen', null, 'de', 'true', 'https://www.myswitzerland.com/de-ch/erlebnisse/veranstaltungen/samstagmarkt-auf-dem-casinoplatz-mit-bistro-von-08001200-uhr-11/', 'https://media.myswitzerland.com/image/fetch/c_lfill,g_auto,w_3200,h_1800/f_auto,q_80,fl_keep_iptc/https://d37dhr5745n0y2.cloudfront.net/5/31/d6/531d61f95f66838798ed21a87a144583b3a81fa9_933591175.jpg'),
  ('sonnenaufgangs-fruehstueck-alpen-tower-2026-09-06', 'Sonnenaufgangs-Frühstück', 'Frühe Extrafahrt und Frühstücksbuffet auf dem Alpen tower zum Sonnenaufgang.', 'nature', '2026-09-06T05:00:00.000Z', '2026-09-06T07:00:00.000Z', 'Alpen tower', 'Meiringen-Hasliberg', null, 'de', 'true', 'https://meiringen-hasliberg.ch/177/sonnenaufgangs-fruhstuck', 'https://meiringen-hasliberg.ch/cmsfiles/posts/images/_b199267_by.davidbirri_img2_thmb1.jpg'),
  ('allianz-tag-des-kinos-2026-09-06', 'Allianz Tag des Kinos', 'Kinotag mit aktuellen Filmen zum Spezialpreis im Kino Meiringen.', 'cinema', '2026-09-06T10:00:00.000Z', null, 'Kino Meiringen', 'Kirchgasse 7, 3860 Meiringen', 'CHF 7', 'de', 'false', 'https://www.myswitzerland.com/de-ch/erlebnisse/veranstaltungen/allianz-tag-des-kinos/', 'https://media.myswitzerland.com/image/fetch/c_lfill,g_auto,w_3200,h_1800/f_auto,q_80,fl_keep_iptc/https://d37dhr5745n0y2.cloudfront.net/4/e9/3b/4e93b340394fcdede256312d61096f35af6d660c_944124654.jpg'),
  ('fuehrungen-michaelskirche-2026-09-09', 'Führungen Michaelskirche, Ausgrabungen und Turm', 'Führung durch Michaelskirche, Ausgrabungen und Turm mit restauriertem Uhrwerk von 1898.', 'culture', '2026-09-09T14:30:00.000Z', '2026-09-09T16:00:00.000Z', 'Michaelskirche Meiringen', 'Bei der Kirche 2, 3860 Meiringen', 'Freiwillige Kollekte', 'de', 'true', 'https://www.myswitzerland.com/de-ch/erlebnisse/veranstaltungen/fuehrungen-michaelskirche-ausgrabungen-und-turm/', 'https://media.myswitzerland.com/image/fetch/c_lfill,g_auto,w_3200,h_1800/f_auto,q_80,fl_keep_iptc/https://d37dhr5745n0y2.cloudfront.net/d/f9/13/df913de9ada697a184dedc147712fbe236d31f73_802413338.jpg'),
  ('weindegustation-taellihuette-2026-09-10', 'Weindegustation auf der Tällihütte', 'Schweizer Weine mit begleitetem Hüttenmenu in alpiner Atmosphäre.', 'social', '2026-09-10T16:00:00.000Z', '2026-09-10T19:30:00.000Z', 'Berggasthaus Tälli', 'Birchlaui 222, 3863 Gadmen', 'CHF 68', 'de', 'true', 'https://www.myswitzerland.com/de-ch/erlebnisse/veranstaltungen/weindegustation-auf-der-taellihuette/', 'https://media.myswitzerland.com/image/fetch/c_lfill,g_auto,w_3200,h_1800/f_auto,q_80,fl_keep_iptc/https://d37dhr5745n0y2.cloudfront.net/0/6b/26/06b26ae9a28fc2e72555bff68870d3302878b355_926016497.jpg'),
  ('dominik-muheim-soft-ice-2026-09-11', 'Dominik Muheim Soft Ice', 'Satirisches Bühnenprogramm von Dominik Muheim im Kino Meiringen.', 'culture', '2026-09-11T18:00:00.000Z', '2026-09-11T20:00:00.000Z', 'Kino Meiringen', 'Kirchgasse 7, 3860 Meiringen', 'CHF 30 / 20', 'de', 'false', 'https://www.myswitzerland.com/de-ch/erlebnisse/veranstaltungen/dominik-muheim-soft-ice-2/', 'https://media.myswitzerland.com/image/fetch/c_lfill,g_auto,w_3200,h_1800/f_auto,q_80,fl_keep_iptc/https://d37dhr5745n0y2.cloudfront.net/2/d7/39/2d7393526e62d17861b7438f3658bf47af885ac7_908774477.jpg'),
  ('chaesteilet-maegisalp-2026-09-12', 'Chästeilet Mägisalp', 'Traditionelles Volksfest zum Abschluss des Alpsommers auf der Mägisalp.', 'tradition', '2026-09-12T09:00:00.000Z', null, 'Mägisalp', '6086 Hasliberg', null, 'de', 'false', 'https://en.meiringen-hasliberg.ch/176/chasteilet-magisalp', 'https://en.meiringen-hasliberg.ch/176/cmsfiles/posts/images/815_7254_bydavidbirri_img2_thmb1.jpg'),
  ('weindegustation-taellihuette-2026-09-18', 'Weindegustation auf der Tällihütte', 'Schweizer Weine mit begleitetem Hüttenmenu in alpiner Atmosphäre.', 'social', '2026-09-18T16:00:00.000Z', '2026-09-18T19:30:00.000Z', 'Berggasthaus Tälli', 'Birchlaui 222, 3863 Gadmen', 'CHF 68', 'de', 'true', 'https://www.myswitzerland.com/de-ch/erlebnisse/veranstaltungen/weindegustation-auf-der-taellihuette/', 'https://media.myswitzerland.com/image/fetch/c_lfill,g_auto,w_3200,h_1800/f_auto,q_80,fl_keep_iptc/https://d37dhr5745n0y2.cloudfront.net/0/6b/26/06b26ae9a28fc2e72555bff68870d3302878b355_926016497.jpg'),
  ('samstag-markt-casinoplatz-2026-09-19', 'Samstag-Markt auf dem Casinoplatz', 'Traditioneller Markt mit regionalen Produkten, Bistro und Live-Musik im Zentrum von Meiringen.', 'market', '2026-09-19T06:00:00.000Z', '2026-09-19T10:00:00.000Z', 'Casinoplatz Meiringen', '3860 Meiringen', null, 'de', 'true', 'https://www.myswitzerland.com/de-ch/erlebnisse/veranstaltungen/samstagmarkt-auf-dem-casinoplatz-mit-bistro-von-08001200-uhr-13/', 'https://media.myswitzerland.com/image/fetch/c_lfill,g_auto,w_3200,h_1800/f_auto,q_80,fl_keep_iptc/https://d37dhr5745n0y2.cloudfront.net/2/0e/5b/20e5b4e4a48a5cbaa7087ab126a9f23389545661_933591173.jpg'),
  ('swisscom-football-camp-meiringen-2026-09-21', 'Swisscom Football Camp Meiringen', 'Tagescamp von MS Sports und SV Meiringen mit Training und Rahmenprogramm für Kinder.', 'sport', '2026-09-21T07:30:00.000Z', '2026-09-25T14:00:00.000Z', 'Fussballplatz Wiltschen', 'Brünigstrasse 95, 3860 Meiringen', 'CHF 315', 'de', 'false', 'https://www.myswitzerland.com/de-ch/erlebnisse/veranstaltungen/swisscom-football-camp-meiringen/', 'https://media.myswitzerland.com/image/fetch/c_lfill,g_auto,w_3200,h_1800/f_auto,q_80,fl_keep_iptc/https://d37dhr5745n0y2.cloudfront.net/uploaded/2/c1/e3/2c1e3aa1bcd914086df8b1089056b2fa0f4958f2.png'),
  ('weindegustation-taellihuette-2026-09-25', 'Weindegustation auf der Tällihütte', 'Schweizer Weine mit begleitetem Hüttenmenu in alpiner Atmosphäre.', 'social', '2026-09-25T16:00:00.000Z', '2026-09-25T19:30:00.000Z', 'Berggasthaus Tälli', 'Birchlaui 222, 3863 Gadmen', 'CHF 68', 'de', 'true', 'https://www.myswitzerland.com/de-ch/erlebnisse/veranstaltungen/weindegustation-auf-der-taellihuette/', 'https://media.myswitzerland.com/image/fetch/c_lfill,g_auto,w_3200,h_1800/f_auto,q_80,fl_keep_iptc/https://d37dhr5745n0y2.cloudfront.net/0/6b/26/06b26ae9a28fc2e72555bff68870d3302878b355_926016497.jpg'),
  ('fuehrungen-michaelskirche-2026-09-26', 'Führungen Michaelskirche, Ausgrabungen und Turm', 'Führung durch Michaelskirche, Ausgrabungen und Turm mit restauriertem Uhrwerk von 1898.', 'culture', '2026-09-26T14:30:00.000Z', '2026-09-26T16:00:00.000Z', 'Michaelskirche Meiringen', 'Bei der Kirche 2, 3860 Meiringen', 'Freiwillige Kollekte', 'de', 'true', 'https://www.myswitzerland.com/de-ch/erlebnisse/veranstaltungen/fuehrungen-michaelskirche-ausgrabungen-und-turm/', 'https://media.myswitzerland.com/image/fetch/c_lfill,g_auto,w_3200,h_1800/f_auto,q_80,fl_keep_iptc/https://d37dhr5745n0y2.cloudfront.net/d/f9/13/df913de9ada697a184dedc147712fbe236d31f73_802413338.jpg'),
  ('linedance-alpenzauber-vol-ii-2026-09-26', 'Linedance & Alpenzauber Vol. II', 'Line-Dance-Workshops, gemeinsames Essen und Tanzabend im Hotel Restaurant Terrasse.', 'social', '2026-09-26T07:00:00.000Z', '2026-09-26T21:00:00.000Z', 'Hotel Restaurant Terrasse', 'Sustenstrasse 55, 3863 Gadmen', 'CHF 120 ganzer Tag', 'de', 'false', 'https://www.myswitzerland.com/de-ch/erlebnisse/veranstaltungen/linedance-alpenzauber-vol-ii/', 'https://media.myswitzerland.com/image/fetch/c_lfill,g_auto,w_3200,h_1800/f_auto,q_80,fl_keep_iptc/https://d37dhr5745n0y2.cloudfront.net/f/70/a7/f70a725f9513ec066d253ba282d613d78a2aacb0_942489065.jpg'),
  ('erinnerungsanlass-80-jahre-dakota-2026-10-10', 'Erinnerungsanlass «80 Jahre Dakota»', 'Familienanlass zum Jahrestag der Dakota-Rettung mit Ausstellung, historischen Fahrzeugen und Vorträgen.', 'tradition', '2026-10-10T08:00:00.000Z', '2026-10-11T14:00:00.000Z', 'Flugplatz Unterbach', '3860 Meiringen', null, 'de', 'false', 'https://www.myswitzerland.com/de-ch/erlebnisse/veranstaltungen/erinnerungsanlass-80-jahre-dakota/', 'https://media.myswitzerland.com/image/fetch/c_lfill,g_auto,w_3200,h_1800/f_auto,q_80,fl_keep_iptc/https://d37dhr5745n0y2.cloudfront.net/a/01/03/a0103dd2b423e5bcb1a0a4d8744b004f29a2ca2d_935917208.jpg'),
  ('fuehrungen-michaelskirche-2026-10-24', 'Führungen Michaelskirche, Ausgrabungen und Turm', 'Führung durch Michaelskirche, Ausgrabungen und Turm mit restauriertem Uhrwerk von 1898.', 'culture', '2026-10-24T14:30:00.000Z', '2026-10-24T16:00:00.000Z', 'Michaelskirche Meiringen', 'Bei der Kirche 2, 3860 Meiringen', 'Freiwillige Kollekte', 'de', 'true', 'https://www.myswitzerland.com/de-ch/erlebnisse/veranstaltungen/fuehrungen-michaelskirche-ausgrabungen-und-turm/', 'https://media.myswitzerland.com/image/fetch/c_lfill,g_auto,w_3200,h_1800/f_auto,q_80,fl_keep_iptc/https://d37dhr5745n0y2.cloudfront.net/d/f9/13/df913de9ada697a184dedc147712fbe236d31f73_802413338.jpg'),
  ('repair-cafe-haslital-2026-10-24', 'Repair Café Haslital', 'Plattform Haslital organisiert Reparaturen für kaputte Alltagsgegenstände mit Freiwilligen.', 'social', '2026-10-24T07:00:00.000Z', '2026-10-24T12:00:00.000Z', 'Evang.-ref. Kirchgemeindehaus Meiringen', 'Kirchgasse 19, 3860 Meiringen', null, 'de', 'false', 'https://www.myswitzerland.com/de-ch/erlebnisse/veranstaltungen/repair-cafe-haslital/', 'https://media.myswitzerland.com/image/fetch/c_lfill,g_auto,w_3200,h_1800/f_auto,q_80,fl_keep_iptc/https://d37dhr5745n0y2.cloudfront.net/d/d2/4e/dd24e178a71070714766a804f3778892249284da_804404305.png'),
  ('konzert-in-den-advent-musikgesellschaft-meiringen-2026-11-29', 'Konzert in den Advent der Musikgesellschaft Meiringen', 'Adventskonzert der Jugendmusik Meiringen und Musikgesellschaft Meiringen in der Michaelskirche.', 'music', '2026-11-29T16:00:00.000Z', '2026-11-29T17:00:00.000Z', 'Evang.-ref. Michaelskirche', 'Kirchgasse 19, 3860 Meiringen', 'Eintritt frei, Kollekte', 'de', 'false', 'https://www.myswitzerland.com/de-ch/erlebnisse/veranstaltungen/konzert-in-den-advent-der-musikgesellschaft-meiringen/', 'https://media.myswitzerland.com/image/fetch/c_lfill,g_auto,w_3200,h_1800/f_auto,q_80,fl_keep_iptc/https://d37dhr5745n0y2.cloudfront.net/4/63/14/46314eef132e843389154937b06f8dde018136ed_836901922.png'),
  ('simon-enzler-zmetztinne-2026-12-10', 'Simon Enzler zmetztinne', 'Kabarettabend mit Simon Enzler im Kino Meiringen.', 'culture', '2026-12-10T19:00:00.000Z', '2026-12-10T21:00:00.000Z', 'Kino Meiringen', 'Kirchgasse 7, 3860 Meiringen', 'CHF 30 / 20', 'de', 'false', 'https://www.myswitzerland.com/de-ch/erlebnisse/veranstaltungen/simon-enzler-zmetztinne-1/', null)
)
insert into public.events (
  slug, title, description, category, start_date, end_date, location_name,
  address, price, language, is_recurring, is_recurring_template, status,
  source_url, image_url
)
select
  slug,
  title,
  description,
  category,
  start_date::timestamptz,
  end_date::timestamptz,
  location_name,
  address,
  price,
  language,
  is_recurring::boolean,
  false,
  'published',
  source_url,
  image_url
from curated_events
on conflict (slug) do update
set
  title = excluded.title,
  description = excluded.description,
  category = excluded.category,
  start_date = excluded.start_date,
  end_date = excluded.end_date,
  location_name = excluded.location_name,
  address = excluded.address,
  price = excluded.price,
  language = excluded.language,
  is_recurring = excluded.is_recurring,
  is_recurring_template = false,
  status = 'published',
  source_url = excluded.source_url,
  image_url = excluded.image_url,
  updated_at = now();

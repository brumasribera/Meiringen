import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const translations = {
  "musikgesellschaft-meiringen":
    "Active since 1875: brass band and drummers with spring concerts, serenades and performances across the region.",
  "jodlerklub-meiringen":
    "Founded in 1944. Preserves yodelling and folk traditions with weekly rehearsals and an annual concert on the first March weekend.",
  "trachtengruppe-oberhasli":
    "Preserves Hasli traditional dress, folk dance, folk song and folk theatre in Meiringen and the region.",
  "maennerchor-saengerbund-meiringen":
    "Traditional men's choir with performances and singing in Meiringen.",
  "frauenchor-meiringen":
    "Women's choir for classical and traditional choral music in Meiringen.",
  "theatergruppe-glinggige":
    "Local theatre group with productions and performances in Meiringen.",
  "kino-meiringen":
    "Non-profit cultural association: cinema, comedy, concerts and meeting spaces in the heart of Meiringen.",
  "museumsverein-haslital":
    "Supporting association of the Hasli Museum — preserving and sharing regional history.",
  "art-culture-community":
    "Community for art and culture in the Haslital — connecting creative people.",
  "fotoclub-haslital":
    "Photography club for hobby and ambitious photographers in the Haslital region.",
  "fv-oberhasli":
    "Association promoting customs, festivals and regional culture in the Oberhasli.",
  "gemeinnuetziger-verein-meiringen":
    "Non-profit association for social and community projects in Meiringen.",
  "turnverein-meiringen":
    "Gymnastics, volleyball and running for children, active members and seniors — including TBO tournaments.",
  "schwingklub-meiringen":
    "Since 1931: Swiss wrestling with the Haslital youth wrestling day and the Schwing and Älpler festival on Engstlenalp.",
  "schwingerfreunde-meiringen":
    "Friends and supporters of Swiss wrestling in Meiringen.",
  "tennisclub-meiringen":
    "Alpine tennis centre: tennis, padel, badminton and pickleball in the Haslital.",
  "sv-meiringen":
    "Football club offering training and match play for the Meiringen region.",
  "curling-club-oberhasli":
    "Curling for beginners and advanced players in the Oberhasli.",
  "nordischer-skiclub-oberhasli":
    "Cross-country skiing and Nordic disciplines in the ski area and Haslital.",
  "karate-kickboxing-meiringen":
    "Martial arts training: karate and kickboxing for children and adults.",
  "kanu-klub-berner-oberland":
    "Canoe and kayak on rivers and lakes in the Bernese Oberland.",
  "tauchclub-berner-oberland":
    "Diving and underwater activities for members from the region.",
  "sac-oberhasli":
    "Swiss Alpine Club Oberhasli section: hiking, mountaineering and mountain huts.",
  "uhc-brienz-oberhasli":
    "Floorball club for juniors and adults in Brienz and Oberhasli.",
  "verein-pro-alpbachschlucht":
    "Preservation and promotion of the Aare Gorge and Alpbach Gorge trail near Meiringen.",
  "kynologischer-verein-haslital":
    "Dog sports and canine activities for dog owners in the Haslital.",
  "amc-auto-moto-club-haslital":
    "Car and motorcycle club for enthusiasts in the Haslital.",
  "fluggruppe-flob":
    "Flying group for model and air sports enthusiasts in Oberhasli and Brienz.",
  "schuetzengesellschaft-balm":
    "Traditional shooting society in Meiringen-Balm.",
  "schuetzengesellschaft-hausen":
    "Traditional shooting society in Meiringen-Hausen.",
  "pfadfinder-meiringen-brienz":
    "Scout group for children and young people in Meiringen and Brienz.",
  "muetter-vaeterberatung-oberhasli":
    "Counselling and support for parents in the Interlaken-Oberhasli region.",
  "tagesfamilien-oberhasli":
    "Network of day-care families and foster care in the region.",
  "procap-oberhasli":
    "Self-help organisation for people with physical disabilities.",
  "gemeinde-meiringen":
    "Official municipal administration: events, markets, culture and citizen services.",
  "jodlerklub-innertkirchen":
    "Preserves yodelling and folk traditions in Innertkirchen and the Aare Gorge region.",
  "frauenchor-innertkirchen":
    "Women's choir for classical and traditional choral music in Innertkirchen.",
  "webgruppe-innertkirchen":
    "Association for digital skills and web projects in Innertkirchen.",
  "gemeinde-innertkirchen":
    "Innertkirchen municipal administration: events, clubs and citizen services in the Haslital.",
  "trachtengruppe-brienz":
    "Preserves traditional dress, folk dance and customs in Brienz on Lake Brienz.",
  "handharmonika-club-brienz":
    "Accordion music and joint playing in Brienz.",
  "schachclub-brienz":
    "Chess club for hobby and tournament players in Brienz.",
  "eisbahnverein-brienz":
    "Operation and promotion of the Brienz ice rink — ice skating for the region.",
  "gemeinde-brienz":
    "Brienz municipal administration: markets, festivals and cultural events on Lake Brienz.",
  "musikfoerderverein-brienzwiler":
    "Promotion of music and musical education in Brienzwiler.",
  "damenturnverein-brienzwiler":
    "Gymnastics and movement for women in Brienzwiler.",
  "freischuetzen-brienzwiler":
    "Traditional shooting association in Brienzwiler.",
  "theaterliit-gadmen":
    "Local theatre group with productions and performances in Gadmen.",
  "trychelzug-gadmental":
    "Cowbell tradition in the Gadmental — living Haslital heritage.",
  "puuereladen-gadmen":
    "Community meeting point and cultural gatherings in Gadmen.",
  "schuetzengesellschaft-hasliberg":
    "Traditional shooting society on the Hasliberg.",
  "theaterverein-hasliberg":
    "Theatre and cabaret on the Hasliberg.",
  "frauenverein-hasliberg":
    "Women's association for social activities on the Hasliberg.",
  "jodlerclub-oberried":
    "Yodelling and folk traditions in Oberried am Brienzersee.",
  "frauenturnverein-oberried":
    "Gymnastics and movement for women in Oberried.",
  "skiclub-hofstetten":
    "Ski sports and winter activities in Hofstetten bei Brienz.",
  "verkehrsverein-hofstetten":
    "Promotion of tourism and local offerings in Hofstetten.",
  "turnverein-schwanden-hofstetten":
    "Gymnastics and sport for all ages in Schwanden and Hofstetten.",
  "frauenverein-schwanden":
    "Women's association for social projects in Schwanden.",
  "turnverein-guttannen":
    "Gymnastics and movement in Guttannen in the Grimsel area.",
  "feldschuetzen-guttannen":
    "Traditional field shooters in Guttannen.",
  "guttannen-bewegt":
    "Movement and health activities for residents in Guttannen.",
  "verein-pro-schattenhalb":
    "Commitment to village life, culture and community in Schattenhalb.",
};

function esc(value) {
  return value.replace(/'/g, "''");
}

const header = `-- English descriptions + logo fixes

alter table public.organizations
  add column if not exists description_en text;

-- Dedicated websites discovered for orgs that only had portal listings
update public.organizations set
  website_url = 'https://www.jkmeiringen.ch',
  image_url = 'https://www.google.com/s2/favicons?domain=jkmeiringen.ch&sz=128'
where slug = 'jodlerklub-meiringen';

update public.organizations set
  website_url = 'https://www.pfadimeiringenbrienz.ch',
  image_url = 'https://www.google.com/s2/favicons?domain=pfadimeiringenbrienz.ch&sz=128'
where slug = 'pfadfinder-meiringen-brienz';

update public.organizations set
  website_url = 'https://www.uhcbrienz.ch',
  image_url = 'https://www.google.com/s2/favicons?domain=uhcbrienz.ch&sz=128'
where slug = 'uhc-brienz-oberhasli';

update public.organizations set
  website_url = 'https://www.alpbachschlucht.ch',
  image_url = 'https://www.google.com/s2/favicons?domain=alpbachschlucht.ch&sz=128'
where slug = 'verein-pro-alpbachschlucht';

-- Replace generic portal favicons with locality municipality logos
update public.organizations set image_url = 'https://www.google.com/s2/favicons?domain=brienz.ch&sz=128'
where locality in ('brienz', 'brienzwiler', 'oberried', 'schwanden', 'hofstetten')
  and image_url like '%haslital-brienz.ch%';

update public.organizations set image_url = 'https://www.google.com/s2/favicons?domain=innertkirchen.ch&sz=128'
where locality in ('innertkirchen', 'gadmen')
  and image_url like '%haslital-brienz.ch%';

update public.organizations set image_url = 'https://www.google.com/s2/favicons?domain=guttannen.ch&sz=128'
where locality = 'guttannen'
  and image_url like '%haslital-brienz.ch%';

update public.organizations set image_url = 'https://www.google.com/s2/favicons?domain=hasliberg.ch&sz=128'
where locality = 'hasliberg'
  and image_url like '%haslital-brienz.ch%';

update public.organizations set image_url = 'https://www.google.com/s2/favicons?domain=meiringen.ch&sz=128'
where locality in ('meiringen', 'balm', 'hausen', 'schattenhalb')
  and image_url like '%haslital-brienz.ch%';

update public.organizations set image_url = 'https://www.google.com/s2/favicons?domain=meiringen.ch&sz=128'
where image_url like '%vereinsverzeichnis.ch%'
   or image_url like '%localcities.ch%';

-- English descriptions
`;

const updates = Object.entries(translations).map(
  ([slug, en]) =>
    `update public.organizations set description_en = '${esc(en)}' where slug = '${slug}';`
);

const output = header + updates.join("\n") + "\n";
const outPath = path.join(
  __dirname,
  "../supabase/migrations/0006_org_descriptions_logos.sql"
);
fs.writeFileSync(outPath, output);
console.log(`Wrote ${outPath} (${updates.length} translations)`);

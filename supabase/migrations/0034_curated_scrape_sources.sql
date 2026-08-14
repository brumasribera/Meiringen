-- Add higher-signal event sources for the curated daily scraper.

insert into public.scraping_sources (name, url, type, active)
select source.name, source.url, source.type, true
from (
  values
    ('Gemeinde Meiringen Anlässe', 'https://www.meiringen.ch/anlaesseaktuelles', 'meiringen_ch'),
    ('Haslikalender', 'https://www.haslikalender.ch/', 'generic'),
    ('Haslital Veranstaltungskalender', 'https://haslital.swiss/de/entdecken/events/veranstaltungskalender.html', 'generic'),
    ('Haslital Brienz Events', 'https://www.haslital-brienz.ch/events', 'generic'),
    ('Localcities Meiringen Events', 'https://www.localcities.ch/de/veranstaltungen/meiringen/1665', 'generic'),
    ('Jugendarbeit Haslital Brienz', 'https://www.jugendarbeit-haslital-brienz.ch/', 'generic'),
    ('Bergbahnen Meiringen Hasliberg Events', 'https://meiringen-hasliberg.ch/events', 'generic')
) as source(name, url, type)
where not exists (
  select 1
  from public.scraping_sources existing
  where existing.url = source.url
);

update public.scraping_sources
set type = 'meiringen_ch',
    active = true
where url = 'https://www.meiringen.ch/anlaesseaktuelles';

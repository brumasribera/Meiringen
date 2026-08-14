-- Hide legacy placeholders and notice-like rows from the public agenda.
-- Current policy: public events should be source-backed and event-like.

update public.events
set status = 'draft'
where status = 'published'
  and is_recurring_template = false
  and start_date >= now()
  and (
    source_url is null
    or title ~* '^(montag|dienstag|mittwoch|donnerstag|freitag|samstag|sonntag|monday|tuesday|wednesday|thursday|friday|saturday|sunday),?[[:space:]]+[0-9]{1,2}\.[[:space:]]+[[:alpha:]]+[[:space:]]+20[0-9]{2}$'
    or title ~* '^[0-9]{1,2}\.[[:space:]]*[-–][[:space:]]*[0-9]{1,2}\.[[:space:]]*[[:alpha:]]+[[:space:]]+20[0-9]{2}$'
    or title ~* '^[0-9]{1,2}[./-][0-9]{1,2}[./-]20[0-9]{2}$'
    or title ~* '(a8|bauarbeiten|baugrund|baustelle|einschr.nkungen?|fahrplan.nderung|gemeindereglement|obligatorisches[[:space:]]+programm|reglement|schiesspflicht|schießpflicht|sperrung|strassensperrung|tourismusf.rderungsabgabe|verkehr|verordnung)'
    or (
      category = 'other'
      and coalesce(nullif(trim(description), ''), '') = ''
      and coalesce(nullif(trim(location_name), ''), '') = ''
      and coalesce(nullif(trim(address), ''), '') = ''
    )
  );

update public.scraping_sources
set active = false
where url in (
  'https://www.haslital.ch/de/veranstaltungen',
  'https://www.jungfrau.ch/de-ch/veranstaltungen/',
  'https://www.meiringen.ch/freizeit',
  'https://www.meiringen.ch/veranstaltungen'
);

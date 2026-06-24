-- Add cinema as an event category and retire integration from events.

alter table public.events
  drop constraint if exists events_category_check;

alter table public.events
  add constraint events_category_check check (category in (
    'culture', 'sport', 'social', 'education',
    'music', 'nature', 'festival', 'market', 'cinema', 'tradition', 'other'
  ));

update public.events
set category = 'other'
where category = 'integration';

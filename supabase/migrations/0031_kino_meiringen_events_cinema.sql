-- Normalize Kino Meiringen events to the cinema category.

update public.events e
set category = 'cinema'
from public.organizations o
where e.organization_id = o.id
  and o.slug = 'kino-meiringen';


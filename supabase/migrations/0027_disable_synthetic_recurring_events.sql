-- Stop showing inferred recurring placeholders in the public agenda.
-- The autonomous scraper now keeps source-backed dated events up to date.

update public.events
set status = 'draft'
where source_url is null
  and (
    is_recurring = true
    or is_recurring_template = true
    or recurrence_parent_id is not null
  );

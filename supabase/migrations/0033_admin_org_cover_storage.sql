-- Add storage for admin-managed organization cover images.

do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'storage'
      and table_name = 'buckets'
  ) then
    insert into storage.buckets (id, name, public)
    values ('org-covers', 'org-covers', true)
    on conflict (id) do update
      set public = excluded.public;
  end if;
end;
$$;

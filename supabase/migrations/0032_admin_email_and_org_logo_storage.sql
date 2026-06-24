-- Restrict admin access to the single approved account and persist uploaded org logos.

do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'storage'
      and table_name = 'buckets'
  ) then
    insert into storage.buckets (id, name, public)
    values ('org-logos', 'org-logos', true)
    on conflict (id) do update
      set public = excluded.public;
  end if;
end;
$$;

create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and lower(email) = 'brumasribera@gmail.com'
  );
$$ language sql security definer stable;

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    case when lower(new.email) = 'brumasribera@gmail.com' then 'admin' else 'user' end
  );
  return new;
end;
$$ language plpgsql security definer;

update public.profiles
set role = case when lower(email) = 'brumasribera@gmail.com' then 'admin' else 'user' end;

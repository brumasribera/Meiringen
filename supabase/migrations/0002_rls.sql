-- Row Level Security policies

alter table public.organizations enable row level security;
alter table public.events enable row level security;
alter table public.profiles enable row level security;
alter table public.newsletter_preferences enable row level security;
alter table public.scraping_sources enable row level security;

create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- Organizations: public read, admin write
create policy "organizations_public_read"
  on public.organizations for select
  using (true);

create policy "organizations_admin_insert"
  on public.organizations for insert
  with check (public.is_admin());

create policy "organizations_admin_update"
  on public.organizations for update
  using (public.is_admin());

create policy "organizations_admin_delete"
  on public.organizations for delete
  using (public.is_admin());

-- Events: public read published, admin read all + write
create policy "events_public_read"
  on public.events for select
  using (status = 'published' or public.is_admin());

create policy "events_admin_insert"
  on public.events for insert
  with check (public.is_admin());

create policy "events_admin_update"
  on public.events for update
  using (public.is_admin());

create policy "events_admin_delete"
  on public.events for delete
  using (public.is_admin());

-- Profiles: users read/update own, admin read all
create policy "profiles_read_own"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- Newsletter preferences: users manage own
create policy "newsletter_read_own"
  on public.newsletter_preferences for select
  using (auth.uid() = user_id or public.is_admin());

create policy "newsletter_insert_own"
  on public.newsletter_preferences for insert
  with check (auth.uid() = user_id);

create policy "newsletter_update_own"
  on public.newsletter_preferences for update
  using (auth.uid() = user_id);

create policy "newsletter_delete_own"
  on public.newsletter_preferences for delete
  using (auth.uid() = user_id);

-- Scraping sources: admin only
create policy "sources_admin_all"
  on public.scraping_sources for all
  using (public.is_admin())
  with check (public.is_admin());

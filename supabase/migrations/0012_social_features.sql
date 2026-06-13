-- Social engagement: event interest tracking and organization follows.

create table if not exists public.event_interests (
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, event_id)
);

create table if not exists public.organization_follows (
  user_id uuid not null references public.profiles(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, organization_id)
);

create index if not exists event_interests_event_id_idx
  on public.event_interests (event_id);

create index if not exists organization_follows_organization_id_idx
  on public.organization_follows (organization_id);

alter table public.event_interests enable row level security;
alter table public.organization_follows enable row level security;

drop policy if exists "event_interests_read_own" on public.event_interests;
create policy "event_interests_read_own"
  on public.event_interests for select
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "event_interests_insert_own" on public.event_interests;
create policy "event_interests_insert_own"
  on public.event_interests for insert
  with check (auth.uid() = user_id);

drop policy if exists "event_interests_delete_own" on public.event_interests;
create policy "event_interests_delete_own"
  on public.event_interests for delete
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "organization_follows_read_own" on public.organization_follows;
create policy "organization_follows_read_own"
  on public.organization_follows for select
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "organization_follows_insert_own" on public.organization_follows;
create policy "organization_follows_insert_own"
  on public.organization_follows for insert
  with check (auth.uid() = user_id);

drop policy if exists "organization_follows_delete_own" on public.organization_follows;
create policy "organization_follows_delete_own"
  on public.organization_follows for delete
  using (auth.uid() = user_id or public.is_admin());

-- Track organization lifecycle for autonomous directory reconciliation.

alter table public.organizations
  add column if not exists status text not null default 'published',
  add column if not exists directory_last_seen_at timestamptz,
  add column if not exists directory_missing_since timestamptz,
  add column if not exists directory_source_url text;

alter table public.organizations
  drop constraint if exists organizations_status_check;

alter table public.organizations
  add constraint organizations_status_check
  check (status in ('draft', 'published', 'archived'));

create index if not exists organizations_status_idx
  on public.organizations (status);

create index if not exists organizations_directory_source_idx
  on public.organizations (directory_source_url)
  where directory_source_url is not null;

-- Monthly Google Maps load counter (cost guard)

create table if not exists public.map_usage_monthly (
  month_key text primary key,
  google_loads integer not null default 0 check (google_loads >= 0),
  updated_at timestamptz not null default now()
);

alter table public.map_usage_monthly enable row level security;

create or replace function public.reserve_google_map_load(p_limit integer)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_month text := to_char(now(), 'YYYY-MM');
  v_loads integer;
begin
  insert into public.map_usage_monthly (month_key, google_loads)
  values (v_month, 0)
  on conflict (month_key) do nothing;

  select google_loads into v_loads
  from public.map_usage_monthly
  where month_key = v_month
  for update;

  if v_loads >= p_limit then
    return jsonb_build_object(
      'allowed', false,
      'usage', v_loads,
      'limit', p_limit,
      'month', v_month
    );
  end if;

  update public.map_usage_monthly
  set google_loads = google_loads + 1,
      updated_at = now()
  where month_key = v_month
  returning google_loads into v_loads;

  return jsonb_build_object(
    'allowed', true,
    'usage', v_loads,
    'limit', p_limit,
    'month', v_month
  );
end;
$$;

create or replace function public.map_usage_monthly_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists map_usage_monthly_updated_at on public.map_usage_monthly;
create trigger map_usage_monthly_updated_at
  before update on public.map_usage_monthly
  for each row execute function public.map_usage_monthly_updated_at();

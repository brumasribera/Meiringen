-- Event alert subscriptions: email-based, weekly or monthly, magic-link management.

alter table public.newsletter_preferences
  alter column user_id drop not null,
  add column if not exists email text,
  add column if not exists manage_token text default encode(gen_random_bytes(32), 'hex'),
  add column if not exists active boolean not null default true,
  add column if not exists locale text not null default 'de',
  add column if not exists last_sent_at timestamptz;

alter table public.newsletter_preferences
  drop constraint if exists newsletter_preferences_frequency_check;

alter table public.newsletter_preferences
  add constraint newsletter_preferences_frequency_check
  check (frequency in ('weekly', 'monthly'));

update public.newsletter_preferences np
set
  email = p.email,
  manage_token = coalesce(np.manage_token, encode(gen_random_bytes(32), 'hex'))
from public.profiles p
where p.id = np.user_id
  and np.email is null;

update public.newsletter_preferences
set manage_token = encode(gen_random_bytes(32), 'hex')
where manage_token is null;

alter table public.newsletter_preferences
  alter column manage_token set not null,
  alter column manage_token set default encode(gen_random_bytes(32), 'hex');

-- Require email; placeholder only if orphaned rows exist.
update public.newsletter_preferences
set email = 'unknown-' || id::text || '@local.invalid'
where email is null;

alter table public.newsletter_preferences
  alter column email set not null;

alter table public.newsletter_preferences
  drop constraint if exists newsletter_preferences_user_id_key;

create unique index if not exists newsletter_preferences_email_idx
  on public.newsletter_preferences (lower(email));

create unique index if not exists newsletter_preferences_manage_token_idx
  on public.newsletter_preferences (manage_token);

create unique index if not exists newsletter_preferences_user_id_idx
  on public.newsletter_preferences (user_id)
  where user_id is not null;

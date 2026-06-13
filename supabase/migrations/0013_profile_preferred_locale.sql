alter table public.profiles
  add column if not exists preferred_locale text;

alter table public.profiles
  drop constraint if exists profiles_preferred_locale_check;

alter table public.profiles
  add constraint profiles_preferred_locale_check
  check (
    preferred_locale is null
    or preferred_locale in ('de', 'gsw', 'en', 'fr', 'it', 'rm', 'pt')
  );

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, preferred_locale)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    case
      when new.raw_user_meta_data->>'preferred_locale' in ('de', 'gsw', 'en', 'fr', 'it', 'rm', 'pt')
        then new.raw_user_meta_data->>'preferred_locale'
      else null
    end
  );
  return new;
end;
$$ language plpgsql security definer;

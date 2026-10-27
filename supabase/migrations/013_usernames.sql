-- Public-facing usernames for listing privacy (shown instead of full_name).
alter table public.profiles
  add column if not exists username text;

-- Empty string means "not set yet" for existing accounts.
update public.profiles
set username = ''
where username is null;

alter table public.profiles
  alter column username set default '',
  alter column username set not null;

-- Case-insensitive uniqueness among chosen usernames.
create unique index if not exists profiles_username_lower_unique
  on public.profiles (lower(username))
  where username <> '';

alter table public.profiles
  drop constraint if exists profiles_username_format;

alter table public.profiles
  add constraint profiles_username_format
  check (
    username = ''
    or (
      char_length(username) between 3 and 24
      and username ~ '^[a-zA-Z0-9_]+$'
    )
  );

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, phone, role, email, username)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      ''
    ),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    'user',
    new.email,
    coalesce(new.raw_user_meta_data->>'username', '')
  );
  return new;
end;
$$;

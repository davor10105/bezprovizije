-- Allow users to create their own profile row (fallback if trigger did not run)
create policy "Users can insert own profile"
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

-- Relax NOT NULL so profile can be completed after email/OAuth confirmation
alter table public.profiles
  alter column full_name set default '',
  alter column phone set default '';

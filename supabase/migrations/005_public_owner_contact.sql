-- Allow visitors to see owner contact info on published listings
create policy "Public can view contact of published listing owners"
  on public.profiles
  for select
  using (
    exists (
      select 1
      from public.properties p
      where p.owner_id = profiles.id
        and p.is_published = true
    )
  );

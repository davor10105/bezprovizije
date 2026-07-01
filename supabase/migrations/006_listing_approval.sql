-- Listing approval workflow: only approved listings are public
create type public.approval_status as enum ('pending', 'approved', 'rejected');

alter table public.properties
  add column if not exists approval_status public.approval_status not null default 'pending';

	// Existing visible listings stay approved; new user submissions default to pending
update public.properties
set approval_status = 'approved'
where approval_status = 'pending'
  and created_at < now();

create index properties_approval_status_idx on public.properties (approval_status);

-- Replace public visibility policies
drop policy if exists "Anyone can view published properties" on public.properties;
create policy "Anyone can view approved properties"
  on public.properties
  for select
  using (approval_status = 'approved');

drop policy if exists "Anyone can view images of published properties" on public.property_images;
create policy "Anyone can view images of approved properties"
  on public.property_images
  for select
  using (
    exists (
      select 1
      from public.properties p
      where p.id = property_id
        and p.approval_status = 'approved'
    )
  );

drop policy if exists "Public can view contact of published listing owners" on public.profiles;
create policy "Public can view contact of approved listing owners"
  on public.profiles
  for select
  using (
    exists (
      select 1
      from public.properties p
      where p.owner_id = profiles.id
        and p.approval_status = 'approved'
    )
  );

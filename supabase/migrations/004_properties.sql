-- Property listing types
create type public.listing_type as enum ('sale', 'rent');
create type public.property_type as enum ('apartment', 'house', 'business', 'garage', 'room');

create table public.properties (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text not null,
  listing_type public.listing_type not null,
  price numeric(12, 2) not null check (price > 0),
  sqm numeric(10, 2) not null check (sqm > 0),
  property_type public.property_type not null,
  address text not null,
  lat double precision not null,
  lng double precision not null,
  rooms smallint check (rooms is null or rooms >= 0),
  bathrooms smallint check (bathrooms is null or bathrooms >= 0),
  build_year smallint check (build_year is null or build_year between 1800 and 2100),
  parking_spaces smallint check (parking_spaces is null or parking_spaces >= 0),
  attributes jsonb not null default '{}'::jsonb,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.property_images (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties (id) on delete cascade,
  storage_path text not null,
  sort_order smallint not null default 0,
  created_at timestamptz not null default now()
);

create index properties_owner_id_idx on public.properties (owner_id);
create index properties_listing_type_idx on public.properties (listing_type);
create index properties_property_type_idx on public.properties (property_type);
create index properties_price_idx on public.properties (price);
create index properties_sqm_idx on public.properties (sqm);
create index properties_rooms_idx on public.properties (rooms);
create index properties_bathrooms_idx on public.properties (bathrooms);
create index properties_location_idx on public.properties (lat, lng);
create index properties_attributes_idx on public.properties using gin (attributes);
create index properties_published_idx on public.properties (is_published) where is_published = true;

alter table public.properties enable row level security;
alter table public.property_images enable row level security;

create policy "Anyone can view published properties"
  on public.properties
  for select
  using (is_published = true);

create policy "Owners can view own properties"
  on public.properties
  for select
  to authenticated
  using (auth.uid() = owner_id);

create policy "Admins can view all properties"
  on public.properties
  for select
  to authenticated
  using (public.is_admin());

create policy "Owners can insert own properties"
  on public.properties
  for insert
  to authenticated
  with check (auth.uid() = owner_id);

create policy "Owners can update own properties"
  on public.properties
  for update
  to authenticated
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "Admins can update all properties"
  on public.properties
  for update
  to authenticated
  using (public.is_admin());

create policy "Owners can delete own properties"
  on public.properties
  for delete
  to authenticated
  using (auth.uid() = owner_id);

create policy "Admins can delete all properties"
  on public.properties
  for delete
  to authenticated
  using (public.is_admin());

create policy "Anyone can view images of published properties"
  on public.property_images
  for select
  using (
    exists (
      select 1
      from public.properties p
      where p.id = property_id
        and p.is_published = true
    )
  );

create policy "Owners can view images of own properties"
  on public.property_images
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.properties p
      where p.id = property_id
        and p.owner_id = auth.uid()
    )
  );

create policy "Admins can view all property images"
  on public.property_images
  for select
  to authenticated
  using (public.is_admin());

create policy "Owners can insert images for own properties"
  on public.property_images
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.properties p
      where p.id = property_id
        and p.owner_id = auth.uid()
    )
  );

create policy "Owners can delete images of own properties"
  on public.property_images
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.properties p
      where p.id = property_id
        and p.owner_id = auth.uid()
    )
  );

create or replace function public.set_properties_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger properties_updated_at
  before update on public.properties
  for each row
  execute function public.set_properties_updated_at();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'property-images',
  'property-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

create policy "Public read property images"
  on storage.objects
  for select
  using (bucket_id = 'property-images');

create policy "Authenticated users upload property images"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'property-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Owners delete own property images"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'property-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

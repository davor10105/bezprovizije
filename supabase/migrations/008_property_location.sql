-- Structured location fields for hierarchical search (populated via reverse geocoding).
alter table public.properties
  add column if not exists county text,
  add column if not exists city text,
  add column if not exists neighborhood text;

create index if not exists properties_county_idx on public.properties (county);
create index if not exists properties_city_idx on public.properties (city);
create index if not exists properties_neighborhood_idx on public.properties (neighborhood);
create index if not exists properties_location_hierarchy_idx
  on public.properties (county, city, neighborhood)
  where approval_status = 'approved';

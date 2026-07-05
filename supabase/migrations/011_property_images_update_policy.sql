-- Allow updating property image metadata (e.g. sort_order) when reordering photos
create policy "Owners can update images of own properties"
  on public.property_images
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.properties p
      where p.id = property_id
        and p.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.properties p
      where p.id = property_id
        and p.owner_id = auth.uid()
    )
  );

create policy "Admins can update all property images"
  on public.property_images
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Normalize sort_order for listings where every image shares the same value (e.g. all 0)
with ranked as (
  select
    id,
    row_number() over (
      partition by property_id
      order by sort_order asc, created_at asc, id asc
    ) - 1 as new_sort_order
  from public.property_images
)
update public.property_images pi
set sort_order = ranked.new_sort_order
from ranked
where pi.id = ranked.id;

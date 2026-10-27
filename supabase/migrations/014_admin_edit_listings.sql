-- Allow admins to fully manage other users' listing images (insert/delete),
-- and to upload/delete files in the property-images storage bucket.

create policy "Admins can insert all property images"
  on public.property_images
  for insert
  to authenticated
  with check (public.is_admin());

create policy "Admins can delete all property images"
  on public.property_images
  for delete
  to authenticated
  using (public.is_admin());

create policy "Admins upload any property images"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'property-images'
    and public.is_admin()
  );

create policy "Admins delete any property images"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'property-images'
    and public.is_admin()
  );

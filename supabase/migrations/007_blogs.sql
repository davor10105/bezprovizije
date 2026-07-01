create table public.blogs (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null,
  content text not null default '',
  cover_image_path text,
  is_published boolean not null default false,
  author_id uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint blogs_title_length check (char_length(title) >= 3),
  constraint blogs_description_length check (char_length(description) between 10 and 500),
  constraint blogs_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create index blogs_published_created_idx on public.blogs (is_published, created_at desc);
create index blogs_author_id_idx on public.blogs (author_id);

alter table public.blogs enable row level security;

create policy "Anyone can view published blogs"
  on public.blogs
  for select
  using (is_published = true);

create policy "Admins can view all blogs"
  on public.blogs
  for select
  to authenticated
  using (public.is_admin());

create policy "Admins can insert blogs"
  on public.blogs
  for insert
  to authenticated
  with check (public.is_admin() and auth.uid() = author_id);

create policy "Admins can update blogs"
  on public.blogs
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete blogs"
  on public.blogs
  for delete
  to authenticated
  using (public.is_admin());

create or replace function public.set_blogs_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger blogs_updated_at
  before update on public.blogs
  for each row
  execute function public.set_blogs_updated_at();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'blog-images',
  'blog-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

create policy "Public read blog images"
  on storage.objects
  for select
  using (bucket_id = 'blog-images');

create policy "Admins upload blog images"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'blog-images' and public.is_admin());

create policy "Admins update blog images"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'blog-images' and public.is_admin());

create policy "Admins delete blog images"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'blog-images' and public.is_admin());

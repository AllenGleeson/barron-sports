-- Admin image uploads: a public Storage bucket for the files, plus an
-- `images` table that lists them for the admin gallery.
--
-- Uploads are resized and compressed in the browser first
-- (src/lib/admin/imageCompression.ts). The bucket enforces the same output
-- limits, so oversized or unexpected files are rejected even if that step is
-- skipped.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('images', 'images', true, 2097152, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Anyone can view files through their public URL (the bucket is public).
-- Only admins can upload, list or delete them.
create policy "Admins can upload images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'images' and (select public.is_admin()));

create policy "Admins can see image files"
  on storage.objects for select to authenticated
  using (bucket_id = 'images' and (select public.is_admin()));

create policy "Admins can delete images"
  on storage.objects for delete to authenticated
  using (bucket_id = 'images' and (select public.is_admin()));

-- One row per uploaded file, for the admin gallery.
create table public.images (
  id uuid primary key default gen_random_uuid(),
  -- Path inside the `images` bucket; the public URL is built from it.
  path text not null unique,
  -- Original file name, for display.
  name text not null default '',
  width integer,
  height integer,
  bytes integer,
  content_type text,
  created_at timestamptz not null default now()
);
alter table public.images enable row level security;

create policy "Admins can see images"
  on public.images for select to authenticated
  using ((select public.is_admin()));

create policy "Admins can add images"
  on public.images for insert to authenticated
  with check ((select public.is_admin()));

create policy "Admins can delete images"
  on public.images for delete to authenticated
  using ((select public.is_admin()));

grant select, insert, delete on public.images to authenticated;

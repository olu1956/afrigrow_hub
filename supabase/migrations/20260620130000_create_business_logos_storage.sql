-- Supabase Storage: business logo uploads
-- Run in Supabase Dashboard → SQL Editor

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'business-logos',
  'business-logos',
  true,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read business logos" on storage.objects;
drop policy if exists "Users upload own business logo" on storage.objects;
drop policy if exists "Users update own business logo" on storage.objects;
drop policy if exists "Users delete own business logo" on storage.objects;

create policy "Public read business logos"
  on storage.objects
  for select
  to public
  using (bucket_id = 'business-logos');

create policy "Users upload own business logo"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'business-logos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users update own business logo"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'business-logos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users delete own business logo"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'business-logos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

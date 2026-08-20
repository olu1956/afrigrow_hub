-- Training course flyer / promotional image

alter table public.training_courses
  add column if not exists flyer_image_url text not null default '';

comment on column public.training_courses.flyer_image_url is
  'Public URL for the course flyer or promotional image.';

-- Supabase Storage: training flyer uploads
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'training-flyers',
  'training-flyers',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read training flyers" on storage.objects;
drop policy if exists "Users upload own training flyers" on storage.objects;
drop policy if exists "Users update own training flyers" on storage.objects;
drop policy if exists "Users delete own training flyers" on storage.objects;

create policy "Public read training flyers"
  on storage.objects
  for select
  to public
  using (bucket_id = 'training-flyers');

create policy "Users upload own training flyers"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'training-flyers'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users update own training flyers"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'training-flyers'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users delete own training flyers"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'training-flyers'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

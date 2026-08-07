-- Run in Supabase Dashboard → SQL Editor to enable Directory moderation.
-- Safe to re-run.

alter table public.businesses
  add column if not exists directory_hidden boolean not null default false;

create index if not exists businesses_directory_hidden_idx
  on public.businesses (directory_hidden);

comment on column public.businesses.directory_hidden is
  'When true, business is hidden from the public directory (admin moderation).';

drop policy if exists "Public can view directory businesses" on public.businesses;

create policy "Public can view directory businesses"
  on public.businesses
  for select
  to anon, authenticated
  using (
    length(trim(business_name)) > 0
    and profile_score >= 40
    and directory_hidden = false
  );

comment on policy "Public can view directory businesses" on public.businesses is
  'Directory listings: named businesses with profile_score >= 40 that are not admin-hidden.';

drop policy if exists "Platform admins can update businesses" on public.businesses;
create policy "Platform admins can update businesses"
  on public.businesses
  for update
  to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

drop policy if exists "Platform admins can delete businesses" on public.businesses;
create policy "Platform admins can delete businesses"
  on public.businesses
  for delete
  to authenticated
  using (public.is_platform_admin());

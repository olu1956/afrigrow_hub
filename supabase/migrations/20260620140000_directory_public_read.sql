-- Allow directory browsing of complete business profiles (public read)
-- Run in Supabase Dashboard → SQL Editor

drop policy if exists "Public can view directory businesses" on public.businesses;

create policy "Public can view directory businesses"
  on public.businesses
  for select
  to anon, authenticated
  using (
    length(trim(business_name)) > 0
    and profile_score >= 40
  );

comment on policy "Public can view directory businesses" on public.businesses is
  'Directory listings: businesses with a name and profile_score >= 40.';

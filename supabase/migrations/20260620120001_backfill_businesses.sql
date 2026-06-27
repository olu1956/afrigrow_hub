-- Backfill businesses for users created before the businesses trigger existed.
insert into public.businesses (
  user_id,
  business_name,
  industry,
  country,
  email
)
select
  u.id,
  coalesce(u.raw_user_meta_data->>'business_name', p.full_name || '''s Business'),
  coalesce(u.raw_user_meta_data->>'business_type', ''),
  coalesce(nullif(p.country, ''), u.raw_user_meta_data->>'country', ''),
  coalesce(u.email, p.email, '')
from auth.users u
left join public.users_profile p on p.user_id = u.id
where u.id not in (select user_id from public.businesses);

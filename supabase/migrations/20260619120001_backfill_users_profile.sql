-- Backfill profiles for users created before the users_profile trigger existed.
insert into public.users_profile (user_id, full_name, email, role, country)
select
  id,
  coalesce(raw_user_meta_data->>'full_name', ''),
  coalesce(email, ''),
  coalesce(nullif(raw_user_meta_data->>'role', ''), 'owner'),
  coalesce(raw_user_meta_data->>'country', '')
from auth.users
where id not in (select user_id from public.users_profile);

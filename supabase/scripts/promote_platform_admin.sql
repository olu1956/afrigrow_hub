-- Grant platform admin in-app (sidebar Admin section + admin pages).
-- Run in Supabase → SQL Editor. Safe to re-run.
-- Replace the emails below with your Settings → Login email if different.

insert into public.platform_admin_allowlist (email)
values
  ('ojuroyeolu@gmail.com'),
  ('ojuroye@hotmail.com')
on conflict (email) do nothing;

-- Ensure a profile row exists, then set role = admin
insert into public.users_profile (user_id, full_name, email, role, country)
select
  u.id,
  coalesce(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1), ''),
  coalesce(u.email, ''),
  'admin',
  coalesce(u.raw_user_meta_data->>'country', '')
from auth.users u
where lower(u.email) in ('ojuroyeolu@gmail.com', 'ojuroye@hotmail.com')
on conflict (user_id) do update
set
  role = 'admin',
  email = excluded.email;

-- Verify (auth_email must match what you use to sign in)
select u.email as auth_email, p.email as profile_email, p.role
from auth.users u
left join public.users_profile p on p.user_id = u.id
where lower(u.email) in ('ojuroyeolu@gmail.com', 'ojuroye@hotmail.com');

notify pgrst, 'reload schema';

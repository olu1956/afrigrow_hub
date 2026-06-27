-- Allow platform admins (by email) to read/update inbound leads via RLS.

create table if not exists public.platform_admin_allowlist (
  email text primary key
);

comment on table public.platform_admin_allowlist is
  'Emails allowed to view admin-only tables (matches PLATFORM_ADMIN_EMAILS in the app).';

insert into public.platform_admin_allowlist (email)
values ('ojuroye@hotmail.com')
on conflict (email) do nothing;

create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users_profile p
    where p.user_id = auth.uid()
      and p.role = 'admin'
  )
  or exists (
    select 1
    from public.platform_admin_allowlist a
    where lower(a.email) = lower(coalesce(auth.jwt()->>'email', ''))
  );
$$;

alter table public.platform_admin_allowlist enable row level security;

create policy "Platform admins can view allowlist"
  on public.platform_admin_allowlist
  for select
  to authenticated
  using (public.is_platform_admin());

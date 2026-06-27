-- Inbound leads one-shot setup (safe to re-run)
-- Run in Supabase → SQL Editor. Ends with grants + schema reload.

create table if not exists public.enterprise_enquiries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  name text not null,
  email text not null,
  phone text not null default '',
  company_name text not null default '',
  team_size text not null default '',
  locations text not null default '',
  interested_in text not null default '',
  message text not null default '',
  subject text not null default '',
  website text not null default '',
  enquiry_type text not null default 'enterprise',
  source text not null default 'contact',
  status text not null default 'new',
  admin_notes text not null default '',
  created_at timestamptz not null default now()
);

alter table public.enterprise_enquiries
  add column if not exists subject text not null default '';

alter table public.enterprise_enquiries
  add column if not exists website text not null default '';

alter table public.enterprise_enquiries
  add column if not exists enquiry_type text not null default 'enterprise';

alter table public.enterprise_enquiries
  drop constraint if exists enterprise_enquiries_source_check;

alter table public.enterprise_enquiries
  add constraint enterprise_enquiries_source_check
  check (source in ('contact', 'billing', 'landing', 'pricing', 'partner', 'general'));

alter table public.enterprise_enquiries
  drop constraint if exists enterprise_enquiries_status_check;

alter table public.enterprise_enquiries
  add constraint enterprise_enquiries_status_check
  check (status in ('new', 'contacted', 'qualified', 'won', 'closed'));

alter table public.enterprise_enquiries
  drop constraint if exists enterprise_enquiries_enquiry_type_check;

alter table public.enterprise_enquiries
  add constraint enterprise_enquiries_enquiry_type_check
  check (enquiry_type in ('enterprise', 'contact', 'partner'));

create index if not exists enterprise_enquiries_user_id_idx
  on public.enterprise_enquiries (user_id);

create index if not exists enterprise_enquiries_status_idx
  on public.enterprise_enquiries (status);

create index if not exists enterprise_enquiries_created_at_idx
  on public.enterprise_enquiries (created_at desc);

create index if not exists enterprise_enquiries_email_idx
  on public.enterprise_enquiries (email);

create index if not exists enterprise_enquiries_enquiry_type_idx
  on public.enterprise_enquiries (enquiry_type);

alter table public.enterprise_enquiries enable row level security;

drop policy if exists "Anyone can submit enterprise enquiries" on public.enterprise_enquiries;
create policy "Anyone can submit enterprise enquiries"
  on public.enterprise_enquiries
  for insert
  to anon, authenticated
  with check (true);

create table if not exists public.platform_admin_allowlist (
  email text primary key
);

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

drop policy if exists "Platform admins can view allowlist" on public.platform_admin_allowlist;
create policy "Platform admins can view allowlist"
  on public.platform_admin_allowlist
  for select
  to authenticated
  using (public.is_platform_admin());

drop policy if exists "Users can read own allowlist row" on public.platform_admin_allowlist;
create policy "Users can read own allowlist row"
  on public.platform_admin_allowlist
  for select
  to authenticated
  using (lower(email) = lower(coalesce(auth.jwt()->>'email', '')));

drop policy if exists "Platform admins can view enterprise enquiries" on public.enterprise_enquiries;
create policy "Platform admins can view enterprise enquiries"
  on public.enterprise_enquiries
  for select
  to authenticated
  using (public.is_platform_admin());

drop policy if exists "Platform admins can update enterprise enquiries" on public.enterprise_enquiries;
create policy "Platform admins can update enterprise enquiries"
  on public.enterprise_enquiries
  for update
  to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

grant usage on schema public to anon, authenticated;
grant select, insert on public.enterprise_enquiries to anon, authenticated;
grant update on public.enterprise_enquiries to authenticated;

notify pgrst, 'reload schema';

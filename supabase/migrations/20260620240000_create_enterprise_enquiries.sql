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
  source text not null default 'contact' check (
    source in ('contact', 'billing', 'landing', 'pricing')
  ),
  status text not null default 'new' check (
    status in ('new', 'contacted', 'qualified', 'won', 'closed')
  ),
  admin_notes text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists enterprise_enquiries_user_id_idx
  on public.enterprise_enquiries (user_id);

create index if not exists enterprise_enquiries_status_idx
  on public.enterprise_enquiries (status);

create index if not exists enterprise_enquiries_created_at_idx
  on public.enterprise_enquiries (created_at desc);

create index if not exists enterprise_enquiries_email_idx
  on public.enterprise_enquiries (email);

alter table public.enterprise_enquiries enable row level security;

create policy "Anyone can submit enterprise enquiries"
  on public.enterprise_enquiries
  for insert
  to anon, authenticated
  with check (true);

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
  );
$$;

create policy "Platform admins can view enterprise enquiries"
  on public.enterprise_enquiries
  for select
  to authenticated
  using (public.is_platform_admin());

create policy "Platform admins can update enterprise enquiries"
  on public.enterprise_enquiries
  for update
  to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

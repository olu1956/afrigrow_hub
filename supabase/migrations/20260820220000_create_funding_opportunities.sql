-- Curated funding / grant catalogue (admin-managed)

create table if not exists public.funding_opportunities (
  id text primary key,
  name text not null,
  provider text not null default '',
  type text not null default 'grant' check (
    type in ('grant', 'loan', 'accelerator', 'equity')
  ),
  amount text not null default '',
  region text not null default '',
  deadline text not null default '',
  eligibility text not null default '',
  description text not null default '',
  apply_url text not null default '',
  sectors text[] not null default '{}',
  country_keys text[] not null default '{}',
  eligible_stages text[] not null default '{}',
  sector_keys text[] not null default '{}',
  funding_min numeric(14, 2),
  funding_max numeric(14, 2),
  funding_currency text not null default '',
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists funding_opportunities_status_idx
  on public.funding_opportunities (status);

create index if not exists funding_opportunities_country_keys_idx
  on public.funding_opportunities using gin (country_keys);

create index if not exists funding_opportunities_updated_at_idx
  on public.funding_opportunities (updated_at desc);

alter table public.funding_opportunities enable row level security;

drop policy if exists "Anyone can read published funding opportunities" on public.funding_opportunities;
create policy "Anyone can read published funding opportunities"
  on public.funding_opportunities
  for select
  to anon, authenticated
  using (status = 'published');

drop policy if exists "Platform admins can manage funding opportunities" on public.funding_opportunities;
create policy "Platform admins can manage funding opportunities"
  on public.funding_opportunities
  for all
  to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

grant select on public.funding_opportunities to anon, authenticated;
grant insert, update, delete on public.funding_opportunities to authenticated;

comment on table public.funding_opportunities is
  'Admin-curated funding programmes matched to members by country_keys.';

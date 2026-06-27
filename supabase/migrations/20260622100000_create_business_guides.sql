-- Business guides for Build a Business Academy (public learning resources)

create table if not exists public.business_guides (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text not null,
  body text not null default '',
  topic text not null default 'general' check (
    topic in ('profile', 'marketing', 'crm', 'matching', 'funding', 'pricing', 'growth', 'general')
  ),
  author text not null default 'AfriGrow Hub',
  read_time_minutes integer not null default 5 check (read_time_minutes > 0),
  is_featured boolean not null default false,
  featured_until timestamptz,
  status text not null default 'draft' check (status in ('draft', 'published')),
  linked_agent_href text not null default '',
  linked_agent_label text not null default '',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists business_guides_status_idx on public.business_guides (status);
create index if not exists business_guides_topic_idx on public.business_guides (topic);
create index if not exists business_guides_featured_idx on public.business_guides (is_featured);
create index if not exists business_guides_published_at_idx on public.business_guides (published_at desc);

alter table public.business_guides enable row level security;

drop policy if exists "Anyone can read published business guides" on public.business_guides;
create policy "Anyone can read published business guides"
  on public.business_guides
  for select
  to anon, authenticated
  using (status = 'published');

drop policy if exists "Platform admins can manage business guides" on public.business_guides;
create policy "Platform admins can manage business guides"
  on public.business_guides
  for all
  to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

grant select on public.business_guides to anon, authenticated;
grant insert, update, delete on public.business_guides to authenticated;

comment on table public.business_guides is
  'SME learning guides for Build a Business Academy — published guides are public.';

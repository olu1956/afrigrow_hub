create table if not exists public.funding_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  business_id uuid not null references public.businesses (id) on delete cascade,
  business_stage text not null default 'early' check (
    business_stage in ('idea', 'pre_revenue', 'early', 'growth', 'established')
  ),
  annual_revenue numeric(14, 2) not null default 0 check (annual_revenue >= 0),
  funding_needed numeric(14, 2) not null default 0 check (funding_needed >= 0),
  funding_purpose text not null default '',
  readiness_score integer not null default 0 check (readiness_score >= 0 and readiness_score <= 100),
  recommendations jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create unique index if not exists funding_profiles_business_id_unique
  on public.funding_profiles (business_id);

create index if not exists funding_profiles_user_id_idx
  on public.funding_profiles (user_id);

create index if not exists funding_profiles_created_at_idx
  on public.funding_profiles (created_at desc);

alter table public.funding_profiles enable row level security;

create policy "Users can view own funding profiles"
  on public.funding_profiles
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own funding profiles"
  on public.funding_profiles
  for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.businesses b
      where b.id = business_id
        and b.user_id = auth.uid()
    )
  );

create policy "Users can update own funding profiles"
  on public.funding_profiles
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.businesses b
      where b.id = business_id
        and b.user_id = auth.uid()
    )
  );

create policy "Users can delete own funding profiles"
  on public.funding_profiles
  for delete
  to authenticated
  using (auth.uid() = user_id);

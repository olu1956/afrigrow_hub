-- AfriGrow Hub: marketplace_matches
-- Run in Supabase Dashboard → SQL Editor

create table if not exists public.marketplace_matches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  business_id uuid not null references public.businesses (id) on delete cascade,
  matched_business_id uuid not null references public.businesses (id) on delete cascade,
  match_type text not null check (
    match_type in ('buyers', 'suppliers', 'partners')
  ),
  match_score integer not null default 0 check (match_score >= 0 and match_score <= 100),
  status text not null default 'suggested' check (
    status in ('suggested', 'enquired', 'accepted', 'declined', 'archived')
  ),
  created_at timestamptz not null default now(),
  constraint marketplace_matches_not_self check (business_id <> matched_business_id)
);

create index if not exists marketplace_matches_user_id_idx
  on public.marketplace_matches (user_id);

create index if not exists marketplace_matches_business_id_idx
  on public.marketplace_matches (business_id);

create index if not exists marketplace_matches_matched_business_id_idx
  on public.marketplace_matches (matched_business_id);

create index if not exists marketplace_matches_status_idx
  on public.marketplace_matches (status);

create index if not exists marketplace_matches_created_at_idx
  on public.marketplace_matches (created_at desc);

create unique index if not exists marketplace_matches_user_target_type_unique
  on public.marketplace_matches (user_id, matched_business_id, match_type);

comment on table public.marketplace_matches is
  'Saved marketplace matches and enquiry status for AfriGrow Hub users.';

comment on column public.marketplace_matches.match_type is
  'Relationship lens: buyers, suppliers, or partners.';

comment on column public.marketplace_matches.match_score is
  'Compatibility score from 0 to 100.';

comment on column public.marketplace_matches.status is
  'Lifecycle: suggested, enquired, accepted, declined, archived.';

alter table public.marketplace_matches enable row level security;

create policy "Users can view own marketplace matches"
  on public.marketplace_matches
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own marketplace matches"
  on public.marketplace_matches
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
    and exists (
      select 1
      from public.businesses b
      where b.id = matched_business_id
    )
  );

create policy "Users can update own marketplace matches"
  on public.marketplace_matches
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

create policy "Users can delete own marketplace matches"
  on public.marketplace_matches
  for delete
  to authenticated
  using (auth.uid() = user_id);

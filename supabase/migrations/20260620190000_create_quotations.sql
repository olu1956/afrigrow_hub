-- AfriGrow Hub: quotations
-- Run in Supabase Dashboard → SQL Editor

create table if not exists public.quotations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  business_id uuid not null references public.businesses (id) on delete cascade,
  client_name text not null default '',
  items jsonb not null default '[]'::jsonb,
  total numeric(12, 2) not null default 0 check (total >= 0),
  status text not null default 'draft' check (
    status in ('draft', 'sent', 'accepted', 'declined', 'expired')
  ),
  created_at timestamptz not null default now()
);

create index if not exists quotations_user_id_idx
  on public.quotations (user_id);

create index if not exists quotations_business_id_idx
  on public.quotations (business_id);

create index if not exists quotations_status_idx
  on public.quotations (status);

create index if not exists quotations_created_at_idx
  on public.quotations (created_at desc);

comment on table public.quotations is
  'Price quotations created by AfriGrow Hub business users.';

comment on column public.quotations.items is
  'JSON array of line items e.g. description, quantity, unit_price, amount.';

comment on column public.quotations.status is
  'Lifecycle: draft, sent, accepted, declined, expired.';

alter table public.quotations enable row level security;

create policy "Users can view own quotations"
  on public.quotations
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own quotations"
  on public.quotations
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

create policy "Users can update own quotations"
  on public.quotations
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

create policy "Users can delete own quotations"
  on public.quotations
  for delete
  to authenticated
  using (auth.uid() = user_id);

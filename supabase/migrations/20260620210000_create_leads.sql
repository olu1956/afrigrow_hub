create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  business_id uuid not null references public.businesses (id) on delete cascade,
  name text not null,
  email text not null default '',
  phone text not null default '',
  source text not null default 'Manual entry',
  status text not null default 'lead' check (
    status in ('lead', 'customer', 'inactive')
  ),
  notes text not null default '',
  next_follow_up timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists leads_user_id_idx
  on public.leads (user_id);

create index if not exists leads_business_id_idx
  on public.leads (business_id);

create index if not exists leads_status_idx
  on public.leads (status);

create index if not exists leads_next_follow_up_idx
  on public.leads (next_follow_up);

create index if not exists leads_created_at_idx
  on public.leads (created_at desc);

alter table public.leads enable row level security;

create policy "Users can view own leads"
  on public.leads
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own leads"
  on public.leads
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

create policy "Users can update own leads"
  on public.leads
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

create policy "Users can delete own leads"
  on public.leads
  for delete
  to authenticated
  using (auth.uid() = user_id);

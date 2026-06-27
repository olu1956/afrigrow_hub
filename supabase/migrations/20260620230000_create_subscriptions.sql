create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  plan text not null default 'growth' check (
    plan in ('starter', 'growth', 'enterprise')
  ),
  status text not null default 'active' check (
    status in ('active', 'trialing', 'cancelled', 'past_due', 'incomplete')
  ),
  provider text not null default 'preview' check (
    provider in ('stripe', 'paypal', 'manual', 'preview')
  ),
  provider_customer_id text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists subscriptions_user_id_idx
  on public.subscriptions (user_id);

create index if not exists subscriptions_status_idx
  on public.subscriptions (status);

create index if not exists subscriptions_plan_idx
  on public.subscriptions (plan);

alter table public.subscriptions enable row level security;

create policy "Users can view own subscription"
  on public.subscriptions
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own subscription"
  on public.subscriptions
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own subscription"
  on public.subscriptions
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own subscription"
  on public.subscriptions
  for delete
  to authenticated
  using (auth.uid() = user_id);

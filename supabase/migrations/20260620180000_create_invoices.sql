-- AfriGrow Hub: invoices
-- Run in Supabase Dashboard → SQL Editor

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  business_id uuid not null references public.businesses (id) on delete cascade,
  client_name text not null default '',
  client_email text not null default '',
  items jsonb not null default '[]'::jsonb,
  subtotal numeric(12, 2) not null default 0 check (subtotal >= 0),
  tax numeric(12, 2) not null default 0 check (tax >= 0),
  total numeric(12, 2) not null default 0 check (total >= 0),
  status text not null default 'draft' check (
    status in ('draft', 'sent', 'paid', 'pending', 'overdue', 'cancelled', 'failed')
  ),
  due_date date,
  created_at timestamptz not null default now()
);

create index if not exists invoices_user_id_idx
  on public.invoices (user_id);

create index if not exists invoices_business_id_idx
  on public.invoices (business_id);

create index if not exists invoices_status_idx
  on public.invoices (status);

create index if not exists invoices_due_date_idx
  on public.invoices (due_date);

create index if not exists invoices_created_at_idx
  on public.invoices (created_at desc);

comment on table public.invoices is
  'Client invoices created by AfriGrow Hub business users.';

comment on column public.invoices.items is
  'JSON array of line items e.g. description, quantity, unit_price, amount.';

comment on column public.invoices.status is
  'Lifecycle: draft, sent, paid, pending, overdue, cancelled, failed.';

alter table public.invoices enable row level security;

create policy "Users can view own invoices"
  on public.invoices
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own invoices"
  on public.invoices
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

create policy "Users can update own invoices"
  on public.invoices
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

create policy "Users can delete own invoices"
  on public.invoices
  for delete
  to authenticated
  using (auth.uid() = user_id);

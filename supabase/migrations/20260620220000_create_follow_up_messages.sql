create table if not exists public.follow_up_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  lead_id uuid not null references public.leads (id) on delete cascade,
  channel text not null check (
    channel in ('call', 'whatsapp', 'email', 'visit')
  ),
  message text not null default '',
  status text not null default 'scheduled' check (
    status in ('draft', 'scheduled', 'sent', 'cancelled', 'failed')
  ),
  scheduled_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists follow_up_messages_user_id_idx
  on public.follow_up_messages (user_id);

create index if not exists follow_up_messages_lead_id_idx
  on public.follow_up_messages (lead_id);

create index if not exists follow_up_messages_status_idx
  on public.follow_up_messages (status);

create index if not exists follow_up_messages_scheduled_at_idx
  on public.follow_up_messages (scheduled_at);

create index if not exists follow_up_messages_created_at_idx
  on public.follow_up_messages (created_at desc);

alter table public.follow_up_messages enable row level security;

create policy "Users can view own follow up messages"
  on public.follow_up_messages
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own follow up messages"
  on public.follow_up_messages
  for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.leads l
      where l.id = lead_id
        and l.user_id = auth.uid()
    )
  );

create policy "Users can update own follow up messages"
  on public.follow_up_messages
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.leads l
      where l.id = lead_id
        and l.user_id = auth.uid()
    )
  );

create policy "Users can delete own follow up messages"
  on public.follow_up_messages
  for delete
  to authenticated
  using (auth.uid() = user_id);

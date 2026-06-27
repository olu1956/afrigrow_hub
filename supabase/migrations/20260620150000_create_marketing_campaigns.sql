-- AfriGrow Hub: marketing_campaigns
-- Run in Supabase Dashboard → SQL Editor

create table if not exists public.marketing_campaigns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  business_id uuid not null references public.businesses (id) on delete cascade,
  campaign_type text not null check (
    campaign_type in ('social', 'whatsapp', 'flyer', 'email')
  ),
  title text not null default '',
  prompt text not null default '',
  generated_content text not null default '',
  platform text not null default '',
  status text not null default 'draft' check (
    status in ('draft', 'generated', 'scheduled', 'published', 'archived')
  ),
  created_at timestamptz not null default now()
);

create index if not exists marketing_campaigns_user_id_idx
  on public.marketing_campaigns (user_id);

create index if not exists marketing_campaigns_business_id_idx
  on public.marketing_campaigns (business_id);

create index if not exists marketing_campaigns_status_idx
  on public.marketing_campaigns (status);

create index if not exists marketing_campaigns_created_at_idx
  on public.marketing_campaigns (created_at desc);

comment on table public.marketing_campaigns is
  'AI-generated marketing campaigns saved by AfriGrow Hub users.';

comment on column public.marketing_campaigns.campaign_type is
  'Content format: social, whatsapp, flyer, or email.';

comment on column public.marketing_campaigns.prompt is
  'Campaign brief or prompt used to generate the content.';

comment on column public.marketing_campaigns.generated_content is
  'Generated marketing copy (body text).';

comment on column public.marketing_campaigns.platform is
  'Target platform e.g. Instagram, WhatsApp, LinkedIn.';

comment on column public.marketing_campaigns.status is
  'Lifecycle: draft, generated, scheduled, published, archived.';

alter table public.marketing_campaigns enable row level security;

create policy "Users can view own marketing campaigns"
  on public.marketing_campaigns
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own marketing campaigns"
  on public.marketing_campaigns
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

create policy "Users can update own marketing campaigns"
  on public.marketing_campaigns
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

create policy "Users can delete own marketing campaigns"
  on public.marketing_campaigns
  for delete
  to authenticated
  using (auth.uid() = user_id);

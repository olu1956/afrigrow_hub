-- AfriGrow Hub: pain_point_reports
-- Run in Supabase Dashboard → SQL Editor

create table if not exists public.pain_point_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  business_id uuid not null references public.businesses (id) on delete cascade,
  challenge_type text not null check (
    challenge_type in (
      'visibility',
      'sales',
      'pricing',
      'inventory',
      'customers',
      'digital',
      'cashflow',
      'staffing',
      'custom'
    )
  ),
  diagnosis text not null default '',
  root_causes jsonb not null default '[]'::jsonb,
  action_plan jsonb not null default '[]'::jsonb,
  weekly_tasks jsonb not null default '[]'::jsonb,
  growth_score integer not null default 0 check (growth_score >= 0 and growth_score <= 100),
  created_at timestamptz not null default now()
);

create index if not exists pain_point_reports_user_id_idx
  on public.pain_point_reports (user_id);

create index if not exists pain_point_reports_business_id_idx
  on public.pain_point_reports (business_id);

create index if not exists pain_point_reports_created_at_idx
  on public.pain_point_reports (created_at desc);

comment on table public.pain_point_reports is
  'Growth Agent pain point diagnoses and action plans saved by AfriGrow Hub users.';

comment on column public.pain_point_reports.challenge_type is
  'Preset pain point id or custom when the user describes their own challenge.';

comment on column public.pain_point_reports.diagnosis is
  'Plain-language summary of the business challenge and recommended focus.';

comment on column public.pain_point_reports.root_causes is
  'JSON array of identified root causes for the challenge.';

comment on column public.pain_point_reports.action_plan is
  'JSON array of recommended actions with optional completion flags.';

comment on column public.pain_point_reports.weekly_tasks is
  'JSON array of priority tasks for the current week.';

comment on column public.pain_point_reports.growth_score is
  'Action plan completion score from 0 to 100.';

alter table public.pain_point_reports enable row level security;

create policy "Users can view own pain point reports"
  on public.pain_point_reports
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own pain point reports"
  on public.pain_point_reports
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

create policy "Users can update own pain point reports"
  on public.pain_point_reports
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

create policy "Users can delete own pain point reports"
  on public.pain_point_reports
  for delete
  to authenticated
  using (auth.uid() = user_id);

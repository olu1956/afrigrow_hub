-- AfriGrow Hub: businesses
-- Run in Supabase Dashboard → SQL Editor

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  business_name text not null default '',
  industry text not null default '',
  country text not null default '',
  city text not null default '',
  description text not null default '',
  products_services text[] not null default '{}',
  logo_url text not null default '',
  website text not null default '',
  whatsapp text not null default '',
  email text not null default '',
  social_links jsonb not null default '{}'::jsonb,
  profile_score integer not null default 0 check (profile_score >= 0 and profile_score <= 100),
  is_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists businesses_user_id_idx on public.businesses (user_id);
create unique index if not exists businesses_user_id_unique on public.businesses (user_id);
create index if not exists businesses_country_idx on public.businesses (country);
create index if not exists businesses_industry_idx on public.businesses (industry);
create index if not exists businesses_is_verified_idx on public.businesses (is_verified);

comment on table public.businesses is 'Business profiles owned by AfriGrow Hub users.';
comment on column public.businesses.industry is 'Business sector e.g. retail, manufacturing, services.';
comment on column public.businesses.products_services is 'List of products or services offered.';
comment on column public.businesses.social_links is 'JSON object e.g. {"instagram":"","facebook":"","linkedin":""}.';
comment on column public.businesses.profile_score is 'Completeness score 0–100.';

alter table public.businesses enable row level security;

create policy "Users can view own businesses"
  on public.businesses
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own businesses"
  on public.businesses
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own businesses"
  on public.businesses
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own businesses"
  on public.businesses
  for delete
  to authenticated
  using (auth.uid() = user_id);

create or replace function public.set_businesses_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists businesses_set_updated_at on public.businesses;

create trigger businesses_set_updated_at
  before update on public.businesses
  for each row
  execute function public.set_businesses_updated_at();

create or replace function public.handle_new_user_business()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.businesses (
    user_id,
    business_name,
    industry,
    country,
    email
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'business_name', ''),
    coalesce(new.raw_user_meta_data->>'business_type', ''),
    coalesce(new.raw_user_meta_data->>'country', ''),
    coalesce(new.email, '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_business on auth.users;

create trigger on_auth_user_created_business
  after insert on auth.users
  for each row
  execute function public.handle_new_user_business();

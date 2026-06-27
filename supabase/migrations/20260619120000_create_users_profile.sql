-- AfriGrow Hub: users_profile
-- Run in Supabase Dashboard → SQL Editor, or: supabase db push

create table if not exists public.users_profile (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  full_name text not null default '',
  email text not null default '',
  role text not null default 'owner' check (role in ('owner', 'admin', 'member')),
  country text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists users_profile_user_id_idx on public.users_profile (user_id);
create index if not exists users_profile_email_idx on public.users_profile (email);

comment on table public.users_profile is 'Extended profile for each authenticated AfriGrow Hub user.';
comment on column public.users_profile.role is 'App role: owner, admin, or member.';

alter table public.users_profile enable row level security;

create policy "Users can view own profile"
  on public.users_profile
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can update own profile"
  on public.users_profile
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Profile row is created by trigger on signup (not direct client insert).
create policy "Users can insert own profile"
  on public.users_profile
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users_profile (user_id, full_name, email, role, country)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.email, ''),
    coalesce(nullif(new.raw_user_meta_data->>'role', ''), 'owner'),
    coalesce(new.raw_user_meta_data->>'country', '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;

create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row
  execute function public.handle_new_user_profile();

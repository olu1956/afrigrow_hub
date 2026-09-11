-- Member directory opt-out, verification requests, private evidence bucket,
-- and self-service account deletion.

alter table public.businesses
  add column if not exists directory_opt_out boolean not null default false;

alter table public.businesses
  add column if not exists registration_number text not null default '';

create index if not exists businesses_directory_opt_out_idx
  on public.businesses (directory_opt_out);

comment on column public.businesses.directory_opt_out is
  'When true, the owner has chosen not to appear in the public directory.';
comment on column public.businesses.registration_number is
  'Company or business registration number submitted for verification.';

-- Keep admin unlist (directory_hidden) separate from member opt-out.
drop policy if exists "Public can view directory businesses" on public.businesses;

create policy "Public can view directory businesses"
  on public.businesses
  for select
  to anon, authenticated
  using (
    length(trim(business_name)) > 0
    and profile_score >= 40
    and directory_hidden = false
    and directory_opt_out = false
  );

comment on policy "Public can view directory businesses" on public.businesses is
  'Directory listings: named businesses with profile_score >= 40 that are not admin-hidden or owner-hidden.';

-- Members must not flip the admin unlist flag.
create or replace function public.prevent_member_directory_hidden()
returns trigger
language plpgsql
as $fn$
begin
  if new.directory_hidden is distinct from old.directory_hidden then
    if auth.jwt() ->> 'role' = 'service_role' then
      return new;
    end if;

    if auth.uid() is null or not public.is_platform_admin() then
      raise exception 'not authorized to change directory_hidden';
    end if;
  end if;

  return new;
end;
$fn$;

drop trigger if exists businesses_prevent_member_directory_hidden on public.businesses;

create trigger businesses_prevent_member_directory_hidden
  before update on public.businesses
  for each row
  execute function public.prevent_member_directory_hidden();

create or replace function public.set_own_directory_opt_out(p_opt_out boolean)
returns void
language plpgsql
security definer
set search_path = public
as $fn$
begin
  if auth.uid() is null then
    raise exception 'not authorized';
  end if;

  update public.businesses
  set directory_opt_out = p_opt_out
  where user_id = auth.uid();

  if not found then
    raise exception 'business not found';
  end if;
end;
$fn$;

revoke all on function public.set_own_directory_opt_out(boolean) from public;
grant execute on function public.set_own_directory_opt_out(boolean) to authenticated;

create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = public
as $fn$
begin
  if auth.uid() is null then
    raise exception 'not authorized';
  end if;

  delete from auth.users where id = auth.uid();
end;
$fn$;

revoke all on function public.delete_own_account() from public;
grant execute on function public.delete_own_account() to authenticated;

create table if not exists public.verification_requests (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  registration_number text not null default '',
  website text not null default '',
  instagram text not null default '',
  facebook text not null default '',
  linkedin text not null default '',
  notes text not null default '',
  document_path text not null default '',
  document_name text not null default '',
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  admin_note text not null default '',
  reviewed_by uuid references auth.users (id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists verification_requests_business_id_idx
  on public.verification_requests (business_id, created_at desc);

create index if not exists verification_requests_status_idx
  on public.verification_requests (status);

create unique index if not exists verification_requests_one_pending
  on public.verification_requests (business_id)
  where status = 'pending';

comment on table public.verification_requests is
  'Evidence packs members submit for the Verified badge. Admins approve or reject.';

create or replace function public.set_verification_requests_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists verification_requests_set_updated_at on public.verification_requests;

create trigger verification_requests_set_updated_at
  before update on public.verification_requests
  for each row
  execute function public.set_verification_requests_updated_at();

alter table public.verification_requests enable row level security;

drop policy if exists "Users can view own verification requests" on public.verification_requests;
create policy "Users can view own verification requests"
  on public.verification_requests
  for select
  to authenticated
  using (auth.uid() = user_id or public.is_platform_admin());

drop policy if exists "Users can insert own verification requests" on public.verification_requests;
create policy "Users can insert own verification requests"
  on public.verification_requests
  for insert
  to authenticated
  with check (auth.uid() = user_id and status = 'pending');

drop policy if exists "Users can update own pending verification requests" on public.verification_requests;
create policy "Users can update own pending verification requests"
  on public.verification_requests
  for update
  to authenticated
  using (auth.uid() = user_id and status = 'pending')
  with check (auth.uid() = user_id and status = 'pending');

drop policy if exists "Platform admins can update verification requests" on public.verification_requests;
create policy "Platform admins can update verification requests"
  on public.verification_requests
  for update
  to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

create or replace function public.admin_review_verification_request(
  p_request_id uuid,
  p_approved boolean,
  p_admin_note text default ''
)
returns void
language plpgsql
security definer
set search_path = public
as $fn$
declare
  v_business_id uuid;
  v_registration text;
begin
  if auth.uid() is null or not public.is_platform_admin() then
    raise exception 'not authorized';
  end if;

  select business_id, registration_number
    into v_business_id, v_registration
  from public.verification_requests
  where id = p_request_id;

  if v_business_id is null then
    raise exception 'verification request not found';
  end if;

  update public.verification_requests
  set
    status = case when p_approved then 'approved' else 'rejected' end,
    admin_note = coalesce(p_admin_note, ''),
    reviewed_by = auth.uid(),
    reviewed_at = now()
  where id = p_request_id;

  if p_approved then
    update public.businesses
    set
      is_verified = true,
      registration_number = case
        when length(trim(v_registration)) > 0 then v_registration
        else registration_number
      end
    where id = v_business_id;
  end if;
end;
$fn$;

revoke all on function public.admin_review_verification_request(uuid, boolean, text) from public;
grant execute on function public.admin_review_verification_request(uuid, boolean, text) to authenticated;

-- When an admin verifies from the directory list, close any pending request.
create or replace function public.admin_set_business_verified(
  p_business_id uuid,
  p_verified boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $fn$
begin
  if auth.uid() is null or not public.is_platform_admin() then
    raise exception 'not authorized';
  end if;

  update public.businesses
  set is_verified = p_verified
  where id = p_business_id;

  if not found then
    raise exception 'business not found';
  end if;

  if p_verified then
    update public.verification_requests
    set
      status = 'approved',
      reviewed_by = auth.uid(),
      reviewed_at = now()
    where business_id = p_business_id
      and status = 'pending';
  end if;
end;
$fn$;

revoke all on function public.admin_set_business_verified(uuid, boolean) from public;
grant execute on function public.admin_set_business_verified(uuid, boolean) to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'verification-documents',
  'verification-documents',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Users upload own verification documents" on storage.objects;
drop policy if exists "Users update own verification documents" on storage.objects;
drop policy if exists "Users read own verification documents" on storage.objects;
drop policy if exists "Users delete own verification documents" on storage.objects;
drop policy if exists "Admins read verification documents" on storage.objects;

create policy "Users upload own verification documents"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'verification-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users update own verification documents"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'verification-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users read own verification documents"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'verification-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users delete own verification documents"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'verification-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Admins read verification documents"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'verification-documents'
    and public.is_platform_admin()
  );

notify pgrst, 'reload schema';

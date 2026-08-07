-- Run in Supabase Dashboard → SQL Editor to enable Directory moderation.
-- Safe to re-run. Select ALL of this file, then Run.

alter table public.businesses
  add column if not exists directory_hidden boolean not null default false;

create index if not exists businesses_directory_hidden_idx
  on public.businesses (directory_hidden);

comment on column public.businesses.directory_hidden is
  'When true, business is hidden from the public directory (admin moderation).';

drop policy if exists "Public can view directory businesses" on public.businesses;

create policy "Public can view directory businesses"
  on public.businesses
  for select
  to anon, authenticated
  using (
    length(trim(business_name)) > 0
    and profile_score >= 40
    and directory_hidden = false
  );

comment on policy "Public can view directory businesses" on public.businesses is
  'Directory listings: named businesses with profile_score >= 40 that are not admin-hidden.';

drop policy if exists "Platform admins can update businesses" on public.businesses;
create policy "Platform admins can update businesses"
  on public.businesses
  for update
  to authenticated
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

drop policy if exists "Platform admins can delete businesses" on public.businesses;
create policy "Platform admins can delete businesses"
  on public.businesses
  for delete
  to authenticated
  using (public.is_platform_admin());

drop function if exists public.admin_set_directory_hidden(uuid, boolean);
drop function if exists public.admin_remove_directory_business(uuid);

create or replace function public.admin_set_directory_hidden(
  p_business_id uuid,
  p_hidden boolean
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
  set directory_hidden = p_hidden
  where id = p_business_id;

  if not found then
    raise exception 'business not found';
  end if;
end;
$fn$;

revoke all on function public.admin_set_directory_hidden(uuid, boolean) from public;
grant execute on function public.admin_set_directory_hidden(uuid, boolean) to authenticated;

create or replace function public.admin_remove_directory_business(p_business_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $fn$
declare
  v_user_id uuid;
begin
  if auth.uid() is null or not public.is_platform_admin() then
    raise exception 'not authorized';
  end if;

  select user_id into v_user_id
  from public.businesses
  where id = p_business_id;

  if v_user_id is null then
    raise exception 'business not found';
  end if;

  if v_user_id = auth.uid() then
    raise exception 'cannot remove your own admin account';
  end if;

  delete from auth.users where id = v_user_id;
end;
$fn$;

revoke all on function public.admin_remove_directory_business(uuid) from public;
grant execute on function public.admin_remove_directory_business(uuid) to authenticated;

notify pgrst, 'reload schema';

-- Admin can grant or revoke the Verified badge. Members cannot self-verify.

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
end;
$fn$;

revoke all on function public.admin_set_business_verified(uuid, boolean) from public;
grant execute on function public.admin_set_business_verified(uuid, boolean) to authenticated;

create or replace function public.prevent_self_verify()
returns trigger
language plpgsql
as $fn$
begin
  if new.is_verified is distinct from old.is_verified then
    if auth.jwt() ->> 'role' = 'service_role' then
      return new;
    end if;

    if auth.uid() is null or not public.is_platform_admin() then
      raise exception 'not authorized to change verification';
    end if;
  end if;

  return new;
end;
$fn$;

drop trigger if exists businesses_prevent_self_verify on public.businesses;

create trigger businesses_prevent_self_verify
  before update on public.businesses
  for each row
  execute function public.prevent_self_verify();

comment on function public.admin_set_business_verified(uuid, boolean) is
  'Platform admins grant or revoke the Verified badge on a business listing.';

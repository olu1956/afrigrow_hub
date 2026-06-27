-- Let signed-in users check whether their own email is on the platform admin allowlist
-- (used by the app sidebar without relying only on PLATFORM_ADMIN_EMAILS).

drop policy if exists "Users can read own allowlist row" on public.platform_admin_allowlist;

create policy "Users can read own allowlist row"
  on public.platform_admin_allowlist
  for select
  to authenticated
  using (lower(email) = lower(coalesce(auth.jwt()->>'email', '')));

grant execute on function public.is_platform_admin() to authenticated;

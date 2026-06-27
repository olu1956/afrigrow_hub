-- Let the app detect platform admins from the allowlist (sidebar + admin pages).
-- Run once in Supabase → SQL Editor (safe to re-run).

drop policy if exists "Users can read own allowlist row" on public.platform_admin_allowlist;

create policy "Users can read own allowlist row"
  on public.platform_admin_allowlist
  for select
  to authenticated
  using (lower(email) = lower(coalesce(auth.jwt()->>'email', '')));

grant execute on function public.is_platform_admin() to authenticated;

notify pgrst, 'reload schema';

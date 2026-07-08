-- Run in Supabase → SQL Editor (safe to re-run).
-- Enables public visit counter + member count on the AfriGrow landing page.

create table if not exists public.site_daily_visitors (
  visit_date date not null default (timezone('utc', now()))::date,
  visitor_key text not null,
  created_at timestamptz not null default now(),
  primary key (visit_date, visitor_key)
);

create index if not exists site_daily_visitors_visit_date_idx
  on public.site_daily_visitors (visit_date desc);

alter table public.site_daily_visitors enable row level security;

create or replace function public.record_site_visit(p_visitor_key text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_visitor_key is null
    or length(trim(p_visitor_key)) < 8
    or length(trim(p_visitor_key)) > 128
  then
    return;
  end if;

  insert into public.site_daily_visitors (visit_date, visitor_key)
  values ((timezone('utc', now()))::date, trim(p_visitor_key))
  on conflict do nothing;
end;
$$;

create or replace function public.get_public_site_stats()
returns json
language sql
stable
security definer
set search_path = public
as $$
  select json_build_object(
    'members_count', coalesce((select count(*)::int from public.businesses), 0),
    'visits_today', coalesce((
      select count(*)::int
      from public.site_daily_visitors
      where visit_date = (timezone('utc', now()))::date
    ), 0),
    'visits_total', coalesce((select count(*)::int from public.site_daily_visitors), 0)
  );
$$;

revoke all on function public.record_site_visit(text) from public;
revoke all on function public.get_public_site_stats() from public;

grant execute on function public.record_site_visit(text) to anon, authenticated, service_role;
grant execute on function public.get_public_site_stats() to anon, authenticated, service_role;

-- Layer A LMS: course lessons, member progress, live-session attendance, completion.

alter table public.training_enrollments
  add column if not exists attended boolean not null default false;

alter table public.training_enrollments
  add column if not exists attended_at timestamptz;

alter table public.training_enrollments
  add column if not exists completed_at timestamptz;

comment on column public.training_enrollments.attended is
  'Provider marked the trainee as present on the live session.';
comment on column public.training_enrollments.completed_at is
  'Set when all course lessons are complete and attendance is recorded.';

create table if not exists public.training_lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.training_courses (id) on delete cascade,
  title text not null,
  notes text not null default '',
  video_url text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists training_lessons_course_id_idx
  on public.training_lessons (course_id, sort_order, created_at);

comment on table public.training_lessons is
  'Self-paced modules on a course. Optional YouTube/Vimeo link. No hosted video in Layer A.';

create or replace function public.set_training_lessons_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists training_lessons_set_updated_at on public.training_lessons;

create trigger training_lessons_set_updated_at
  before update on public.training_lessons
  for each row
  execute function public.set_training_lessons_updated_at();

create table if not exists public.training_lesson_progress (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.training_lessons (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique (lesson_id, user_id)
);

create index if not exists training_lesson_progress_user_id_idx
  on public.training_lesson_progress (user_id);

create index if not exists training_lesson_progress_lesson_id_idx
  on public.training_lesson_progress (lesson_id);

alter table public.training_lessons enable row level security;
alter table public.training_lesson_progress enable row level security;

drop policy if exists "View lessons for published or own courses" on public.training_lessons;
create policy "View lessons for published or own courses"
  on public.training_lessons
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.training_courses c
      where c.id = course_id
        and (
          c.status = 'published'
          or c.provider_user_id = auth.uid()
          or public.is_platform_admin()
        )
    )
  );

drop policy if exists "Providers insert lessons for own courses" on public.training_lessons;
create policy "Providers insert lessons for own courses"
  on public.training_lessons
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.training_courses c
      where c.id = course_id
        and c.provider_user_id = auth.uid()
    )
  );

drop policy if exists "Providers update lessons for own courses" on public.training_lessons;
create policy "Providers update lessons for own courses"
  on public.training_lessons
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.training_courses c
      where c.id = course_id
        and (c.provider_user_id = auth.uid() or public.is_platform_admin())
    )
  )
  with check (
    exists (
      select 1
      from public.training_courses c
      where c.id = course_id
        and (c.provider_user_id = auth.uid() or public.is_platform_admin())
    )
  );

drop policy if exists "Providers delete lessons for own courses" on public.training_lessons;
create policy "Providers delete lessons for own courses"
  on public.training_lessons
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.training_courses c
      where c.id = course_id
        and (c.provider_user_id = auth.uid() or public.is_platform_admin())
    )
  );

drop policy if exists "Users view own lesson progress" on public.training_lesson_progress;
create policy "Users view own lesson progress"
  on public.training_lesson_progress
  for select
  to authenticated
  using (
    user_id = auth.uid()
    or public.is_platform_admin()
    or exists (
      select 1
      from public.training_lessons l
      join public.training_courses c on c.id = l.course_id
      where l.id = lesson_id
        and c.provider_user_id = auth.uid()
    )
  );

drop policy if exists "Users insert own lesson progress" on public.training_lesson_progress;
create policy "Users insert own lesson progress"
  on public.training_lesson_progress
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "Users delete own lesson progress" on public.training_lesson_progress;
create policy "Users delete own lesson progress"
  on public.training_lesson_progress
  for delete
  to authenticated
  using (user_id = auth.uid());

grant select, insert, update, delete on public.training_lessons to authenticated;
grant select, insert, update, delete on public.training_lesson_progress to authenticated;

create or replace function public.refresh_training_enrollment_completion(p_enrollment_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $fn$
declare
  v_course_id uuid;
  v_user_id uuid;
  v_attended boolean;
  v_lesson_count integer;
  v_done_count integer;
begin
  select course_id, user_id, attended
    into v_course_id, v_user_id, v_attended
  from public.training_enrollments
  where id = p_enrollment_id;

  if v_course_id is null then
    return;
  end if;

  select count(*) into v_lesson_count
  from public.training_lessons
  where course_id = v_course_id;

  select count(*) into v_done_count
  from public.training_lesson_progress p
  join public.training_lessons l on l.id = p.lesson_id
  where l.course_id = v_course_id
    and p.user_id = v_user_id;

  if v_attended and v_done_count >= v_lesson_count then
    update public.training_enrollments
    set
      status = 'completed',
      completed_at = coalesce(completed_at, now())
    where id = p_enrollment_id;
  else
    update public.training_enrollments
    set
      status = 'enrolled',
      completed_at = null
    where id = p_enrollment_id
      and status = 'completed';
  end if;
end;
$fn$;

create or replace function public.set_training_session_attendance(
  p_enrollment_id uuid,
  p_attended boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $fn$
declare
  v_provider uuid;
begin
  if auth.uid() is null then
    raise exception 'not authorized';
  end if;

  select c.provider_user_id
    into v_provider
  from public.training_enrollments e
  join public.training_courses c on c.id = e.course_id
  where e.id = p_enrollment_id;

  if v_provider is null then
    raise exception 'enrollment not found';
  end if;

  if v_provider is distinct from auth.uid() and not public.is_platform_admin() then
    raise exception 'not authorized';
  end if;

  update public.training_enrollments
  set
    attended = p_attended,
    attended_at = case when p_attended then now() else null end
  where id = p_enrollment_id;

  perform public.refresh_training_enrollment_completion(p_enrollment_id);
end;
$fn$;

revoke all on function public.refresh_training_enrollment_completion(uuid) from public;
grant execute on function public.refresh_training_enrollment_completion(uuid) to authenticated;
revoke all on function public.set_training_session_attendance(uuid, boolean) from public;
grant execute on function public.set_training_session_attendance(uuid, boolean) to authenticated;

create or replace function public.refresh_enrollments_for_course_user(
  p_course_id uuid,
  p_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $fn$
declare
  r record;
begin
  for r in
    select id
    from public.training_enrollments
    where course_id = p_course_id
      and user_id = p_user_id
  loop
    perform public.refresh_training_enrollment_completion(r.id);
  end loop;
end;
$fn$;

create or replace function public.after_training_lesson_progress_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $fn$
declare
  v_lesson_id uuid;
  v_user_id uuid;
  v_course_id uuid;
begin
  if tg_op = 'DELETE' then
    v_lesson_id := old.lesson_id;
    v_user_id := old.user_id;
  else
    v_lesson_id := new.lesson_id;
    v_user_id := new.user_id;
  end if;

  select course_id into v_course_id
  from public.training_lessons
  where id = v_lesson_id;

  if v_course_id is not null then
    perform public.refresh_enrollments_for_course_user(v_course_id, v_user_id);
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$fn$;

drop trigger if exists training_lesson_progress_refresh on public.training_lesson_progress;

create trigger training_lesson_progress_refresh
  after insert or delete on public.training_lesson_progress
  for each row
  execute function public.after_training_lesson_progress_change();

create or replace function public.after_training_lesson_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $fn$
declare
  v_course_id uuid;
  r record;
begin
  v_course_id := coalesce(new.course_id, old.course_id);
  for r in
    select id
    from public.training_enrollments
    where course_id = v_course_id
  loop
    perform public.refresh_training_enrollment_completion(r.id);
  end loop;
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$fn$;

drop trigger if exists training_lessons_refresh_completion on public.training_lessons;

create trigger training_lessons_refresh_completion
  after insert or delete on public.training_lessons
  for each row
  execute function public.after_training_lesson_change();

notify pgrst, 'reload schema';

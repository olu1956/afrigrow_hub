-- Run in Supabase SQL Editor (rerunnable).
-- Lets a trainee mark their enrolment complete (including Zoom-only courses with no modules).

alter table public.training_enrollments
  add column if not exists self_completed boolean not null default false;

alter table public.training_enrollments
  add column if not exists self_completed_at timestamptz;

comment on column public.training_enrollments.self_completed is
  'Trainee marked this programme complete. Completes enrolment when all modules are done (or there are none).';

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
  v_self_completed boolean;
  v_lesson_count integer;
  v_done_count integer;
begin
  select course_id, user_id, attended, coalesce(self_completed, false)
    into v_course_id, v_user_id, v_attended, v_self_completed
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

  if (v_attended or v_self_completed) and v_done_count >= v_lesson_count then
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

create or replace function public.complete_own_training_enrollment(p_enrollment_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $fn$
declare
  v_user uuid;
  v_course uuid;
  v_status text;
begin
  if auth.uid() is null then
    raise exception 'not authorized';
  end if;

  select user_id, course_id, status
    into v_user, v_course, v_status
  from public.training_enrollments
  where id = p_enrollment_id;

  if v_user is null then
    raise exception 'enrollment not found';
  end if;

  if v_user is distinct from auth.uid() and not public.is_platform_admin() then
    raise exception 'not authorized';
  end if;

  if v_status not in ('enrolled', 'completed') then
    raise exception 'enrollment not active';
  end if;

  insert into public.training_lesson_progress (lesson_id, user_id)
  select l.id, v_user
  from public.training_lessons l
  where l.course_id = v_course
  on conflict (lesson_id, user_id) do nothing;

  update public.training_enrollments
  set
    self_completed = true,
    self_completed_at = coalesce(self_completed_at, now())
  where id = p_enrollment_id;

  perform public.refresh_training_enrollment_completion(p_enrollment_id);
end;
$fn$;

revoke all on function public.complete_own_training_enrollment(uuid) from public;
grant execute on function public.complete_own_training_enrollment(uuid) to authenticated;

notify pgrst, 'reload schema';

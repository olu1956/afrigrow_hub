-- Training portal v1: providers, courses, sessions (manual Zoom), enrollments

create table if not exists public.training_providers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  business_id uuid references public.businesses (id) on delete set null,
  display_name text not null default '',
  bio text not null default '',
  status text not null default 'active' check (status in ('active', 'suspended')),
  created_at timestamptz not null default now()
);

create index if not exists training_providers_user_id_idx
  on public.training_providers (user_id);

create index if not exists training_providers_business_id_idx
  on public.training_providers (business_id);

create table if not exists public.training_courses (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.training_providers (id) on delete cascade,
  provider_user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  summary text not null default '',
  description text not null default '',
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists training_courses_provider_id_idx
  on public.training_courses (provider_id);

create index if not exists training_courses_provider_user_id_idx
  on public.training_courses (provider_user_id);

create index if not exists training_courses_status_idx
  on public.training_courses (status);

create table if not exists public.training_sessions (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.training_courses (id) on delete cascade,
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  zoom_url text not null default '',
  max_seats integer check (max_seats is null or max_seats > 0),
  status text not null default 'scheduled' check (
    status in ('scheduled', 'completed', 'cancelled')
  ),
  created_at timestamptz not null default now()
);

create index if not exists training_sessions_course_id_idx
  on public.training_sessions (course_id);

create index if not exists training_sessions_starts_at_idx
  on public.training_sessions (starts_at);

create table if not exists public.training_enrollments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.training_courses (id) on delete cascade,
  session_id uuid not null references public.training_sessions (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  business_id uuid references public.businesses (id) on delete set null,
  status text not null default 'enrolled' check (
    status in ('enrolled', 'completed', 'cancelled')
  ),
  enrolled_at timestamptz not null default now(),
  unique (session_id, user_id)
);

create index if not exists training_enrollments_user_id_idx
  on public.training_enrollments (user_id);

create index if not exists training_enrollments_course_id_idx
  on public.training_enrollments (course_id);

create index if not exists training_enrollments_session_id_idx
  on public.training_enrollments (session_id);

-- RLS

alter table public.training_providers enable row level security;
alter table public.training_courses enable row level security;
alter table public.training_sessions enable row level security;
alter table public.training_enrollments enable row level security;

-- training_providers

drop policy if exists "Users can view own provider profile" on public.training_providers;
create policy "Users can view own provider profile"
  on public.training_providers
  for select
  to authenticated
  using (auth.uid() = user_id or public.is_platform_admin());

drop policy if exists "Users can register as provider" on public.training_providers;
create policy "Users can register as provider"
  on public.training_providers
  for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and (
      business_id is null
      or exists (
        select 1
        from public.businesses b
        where b.id = business_id
          and b.user_id = auth.uid()
      )
    )
  );

drop policy if exists "Providers can update own profile" on public.training_providers;
create policy "Providers can update own profile"
  on public.training_providers
  for update
  to authenticated
  using (auth.uid() = user_id or public.is_platform_admin())
  with check (auth.uid() = user_id or public.is_platform_admin());

drop policy if exists "Platform admins manage providers" on public.training_providers;
create policy "Platform admins manage providers"
  on public.training_providers
  for delete
  to authenticated
  using (public.is_platform_admin());

-- training_courses

drop policy if exists "Anyone authenticated can view published courses" on public.training_courses;
create policy "Anyone authenticated can view published courses"
  on public.training_courses
  for select
  to authenticated
  using (
    status = 'published'
    or provider_user_id = auth.uid()
    or public.is_platform_admin()
  );

drop policy if exists "Providers can insert own courses" on public.training_courses;
create policy "Providers can insert own courses"
  on public.training_courses
  for insert
  to authenticated
  with check (
    provider_user_id = auth.uid()
    and exists (
      select 1
      from public.training_providers p
      where p.id = provider_id
        and p.user_id = auth.uid()
        and p.status = 'active'
    )
  );

drop policy if exists "Providers can update own courses" on public.training_courses;
create policy "Providers can update own courses"
  on public.training_courses
  for update
  to authenticated
  using (provider_user_id = auth.uid() or public.is_platform_admin())
  with check (provider_user_id = auth.uid() or public.is_platform_admin());

drop policy if exists "Providers can delete own courses" on public.training_courses;
create policy "Providers can delete own courses"
  on public.training_courses
  for delete
  to authenticated
  using (provider_user_id = auth.uid() or public.is_platform_admin());

-- training_sessions

drop policy if exists "View sessions for published courses or own courses" on public.training_sessions;
create policy "View sessions for published courses or own courses"
  on public.training_sessions
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

drop policy if exists "Providers can insert sessions for own courses" on public.training_sessions;
create policy "Providers can insert sessions for own courses"
  on public.training_sessions
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

drop policy if exists "Providers can update sessions for own courses" on public.training_sessions;
create policy "Providers can update sessions for own courses"
  on public.training_sessions
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

drop policy if exists "Providers can delete sessions for own courses" on public.training_sessions;
create policy "Providers can delete sessions for own courses"
  on public.training_sessions
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

-- training_enrollments

drop policy if exists "Users can view own enrollments" on public.training_enrollments;
create policy "Users can view own enrollments"
  on public.training_enrollments
  for select
  to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1
      from public.training_courses c
      where c.id = course_id
        and c.provider_user_id = auth.uid()
    )
    or public.is_platform_admin()
  );

drop policy if exists "Users can enroll in published sessions" on public.training_enrollments;
create policy "Users can enroll in published sessions"
  on public.training_enrollments
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.training_sessions s
      join public.training_courses c on c.id = s.course_id
      where s.id = session_id
        and s.course_id = course_id
        and c.status = 'published'
        and s.status = 'scheduled'
    )
    and (
      business_id is null
      or exists (
        select 1
        from public.businesses b
        where b.id = business_id
          and b.user_id = auth.uid()
      )
    )
  );

drop policy if exists "Users can update own enrollments" on public.training_enrollments;
create policy "Users can update own enrollments"
  on public.training_enrollments
  for update
  to authenticated
  using (user_id = auth.uid() or public.is_platform_admin())
  with check (user_id = auth.uid() or public.is_platform_admin());

drop policy if exists "Users can cancel own enrollments" on public.training_enrollments;
create policy "Users can delete own enrollments"
  on public.training_enrollments
  for delete
  to authenticated
  using (user_id = auth.uid() or public.is_platform_admin());

grant select, insert, update, delete on public.training_providers to authenticated;
grant select, insert, update, delete on public.training_courses to authenticated;
grant select, insert, update, delete on public.training_sessions to authenticated;
grant select, insert, update, delete on public.training_enrollments to authenticated;

comment on table public.training_providers is
  'Users approved to create and publish training courses on AfriGrow Hub.';
comment on table public.training_courses is
  'Training courses — published courses appear in the member catalog.';
comment on table public.training_sessions is
  'Live session instances with manual Zoom links (v1).';
comment on table public.training_enrollments is
  'Trainee enrollments in scheduled sessions.';

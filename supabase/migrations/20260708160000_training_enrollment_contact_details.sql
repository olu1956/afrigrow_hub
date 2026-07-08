-- Store trainee contact details on each enrollment (visible to course providers)

alter table public.training_enrollments
  add column if not exists trainee_name text not null default '',
  add column if not exists trainee_email text not null default '',
  add column if not exists trainee_phone text not null default '',
  add column if not exists trainee_business text not null default '';

comment on column public.training_enrollments.trainee_name is
  'Name supplied at enrollment — shared with the course provider.';
comment on column public.training_enrollments.trainee_email is
  'Email supplied at enrollment — shared with the course provider.';
comment on column public.training_enrollments.trainee_phone is
  'Phone supplied at enrollment — shared with the course provider.';
comment on column public.training_enrollments.trainee_business is
  'Business name supplied at enrollment — shared with the course provider.';

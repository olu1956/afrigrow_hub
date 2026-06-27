-- Extend enterprise_enquiries to store general contact and partner submissions.

alter table public.enterprise_enquiries
  add column if not exists enquiry_type text not null default 'enterprise',
  add column if not exists subject text not null default '',
  add column if not exists website text not null default '';

alter table public.enterprise_enquiries
  drop constraint if exists enterprise_enquiries_source_check;

alter table public.enterprise_enquiries
  add constraint enterprise_enquiries_source_check
  check (source in ('contact', 'billing', 'landing', 'pricing', 'partner', 'general'));

alter table public.enterprise_enquiries
  drop constraint if exists enterprise_enquiries_enquiry_type_check;

alter table public.enterprise_enquiries
  add constraint enterprise_enquiries_enquiry_type_check
  check (enquiry_type in ('enterprise', 'contact', 'partner'));

create index if not exists enterprise_enquiries_enquiry_type_idx
  on public.enterprise_enquiries (enquiry_type);

comment on column public.enterprise_enquiries.enquiry_type is
  'Submission type: enterprise sales, general contact, or partner application.';

comment on column public.enterprise_enquiries.subject is
  'Subject line for general contact messages.';

comment on column public.enterprise_enquiries.website is
  'Partner organisation website URL.';

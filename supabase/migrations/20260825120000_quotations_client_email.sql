-- AfriGrow Hub: store client email on quotations so they can be emailed.
-- Safe to re-run. Supabase Dashboard → SQL Editor.

alter table public.quotations
  add column if not exists client_email text not null default '';

comment on column public.quotations.client_email is
  'Recipient email used when marking a quotation as sent.';

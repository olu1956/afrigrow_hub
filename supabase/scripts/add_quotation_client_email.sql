-- Run in Supabase Dashboard → SQL Editor (select all, then Run).
-- Needed before AfriGrow can email quotations to clients.

alter table public.quotations
  add column if not exists client_email text not null default '';

comment on column public.quotations.client_email is
  'Recipient email used when marking a quotation as sent.';

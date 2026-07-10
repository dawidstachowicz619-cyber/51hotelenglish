-- Add phone to HR admin accounts
alter table public.hr_admin_accounts
  add column if not exists phone text;

create index if not exists hr_admin_accounts_phone_idx
  on public.hr_admin_accounts (phone)
  where phone is not null and phone <> '';

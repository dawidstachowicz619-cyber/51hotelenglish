-- 51HotelEnglish production schema
-- Run in Supabase SQL Editor or via `supabase db push`

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Hotels
-- ---------------------------------------------------------------------------
create table if not exists public.hotels (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create index if not exists hotels_slug_idx on public.hotels (slug);

-- ---------------------------------------------------------------------------
-- Learner profiles (multi-device via learner_id cookie or auth.users link)
-- ---------------------------------------------------------------------------
create table if not exists public.learner_profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users (id) on delete set null,
  nickname text not null default '',
  phone text not null default '',
  hotel_id uuid references public.hotels (id) on delete set null,
  hotel_name text not null default '',
  total_points integer not null default 0,
  weekly_points integer not null default 0,
  week_start date,
  cefr_level text not null default '—',
  assessment_score integer not null default 0,
  points_history jsonb not null default '[]'::jsonb,
  visited_courses jsonb not null default '[]'::jsonb,
  last_daily_bonus date,
  hr_registered boolean not null default false,
  trial_lessons_used integer not null default 0,
  employee_meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists learner_profiles_phone_idx on public.learner_profiles (phone);
create index if not exists learner_profiles_hotel_id_idx on public.learner_profiles (hotel_id);

-- ---------------------------------------------------------------------------
-- HR employee roster
-- ---------------------------------------------------------------------------
create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  legacy_id text,
  hotel_id uuid not null references public.hotels (id) on delete cascade,
  phone text not null,
  nickname text not null,
  department text not null default 'reception',
  role text not null default '',
  cefr_level text not null default '—',
  assessment_score integer not null default 0,
  passed_assessment_levels jsonb not null default '[]'::jsonb,
  total_points integer not null default 0,
  weekly_points integer not null default 0,
  completed_lessons integer not null default 0,
  total_lessons integer not null default 0,
  course_progress_percent integer not null default 0,
  last_active_at timestamptz,
  status text not null default 'new' check (status in ('active', 'inactive', 'new')),
  hire_date date,
  probation_end_date date,
  is_imported boolean not null default false,
  is_hidden boolean not null default false,
  learner_profile_id uuid references public.learner_profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (hotel_id, phone)
);

create index if not exists employees_hotel_id_idx on public.employees (hotel_id);
create index if not exists employees_learner_profile_id_idx on public.employees (learner_profile_id);

-- ---------------------------------------------------------------------------
-- Learning progress blobs (front desk, CEFR, Russian, training, etc.)
-- ---------------------------------------------------------------------------
create table if not exists public.learning_progress (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references public.learner_profiles (id) on delete cascade,
  progress_key text not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  unique (learner_id, progress_key)
);

create index if not exists learning_progress_learner_id_idx on public.learning_progress (learner_id);

-- ---------------------------------------------------------------------------
-- Learning activity history
-- ---------------------------------------------------------------------------
create table if not exists public.learning_history (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references public.learner_profiles (id) on delete cascade,
  employee_id uuid references public.employees (id) on delete set null,
  occurred_at timestamptz not null,
  phase text not null,
  ask_dimension text not null,
  title text not null,
  subtitle text,
  node_id text,
  score integer,
  created_at timestamptz not null default now()
);

create index if not exists learning_history_learner_id_idx on public.learning_history (learner_id, occurred_at desc);

-- ---------------------------------------------------------------------------
-- HR admin accounts
-- ---------------------------------------------------------------------------
create table if not exists public.hr_admin_accounts (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references public.hotels (id) on delete cascade,
  username text not null unique,
  password_hash text not null,
  display_name text not null,
  email text,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists hr_admin_accounts_hotel_id_idx on public.hr_admin_accounts (hotel_id);

-- ---------------------------------------------------------------------------
-- Hotel HR permissions (JSON config per hotel)
-- ---------------------------------------------------------------------------
create table if not exists public.hotel_hr_permissions (
  hotel_id uuid primary key references public.hotels (id) on delete cascade,
  config jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists learner_profiles_updated_at on public.learner_profiles;
create trigger learner_profiles_updated_at
  before update on public.learner_profiles
  for each row execute function public.set_updated_at();

drop trigger if exists employees_updated_at on public.employees;
create trigger employees_updated_at
  before update on public.employees
  for each row execute function public.set_updated_at();

drop trigger if exists learning_progress_updated_at on public.learning_progress;
create trigger learning_progress_updated_at
  before update on public.learning_progress
  for each row execute function public.set_updated_at();

drop trigger if exists hr_admin_accounts_updated_at on public.hr_admin_accounts;
create trigger hr_admin_accounts_updated_at
  before update on public.hr_admin_accounts
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- RLS (service role used by Next.js API; anon blocked by default)
-- ---------------------------------------------------------------------------
alter table public.hotels enable row level security;
alter table public.learner_profiles enable row level security;
alter table public.employees enable row level security;
alter table public.learning_progress enable row level security;
alter table public.learning_history enable row level security;
alter table public.hr_admin_accounts enable row level security;
alter table public.hotel_hr_permissions enable row level security;

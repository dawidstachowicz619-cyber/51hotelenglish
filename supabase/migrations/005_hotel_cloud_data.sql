-- Cloud-first HR configuration and training content

-- ---------------------------------------------------------------------------
-- Per-hotel department structure (custom org chart)
-- ---------------------------------------------------------------------------
create table if not exists public.hotel_departments (
  hotel_id uuid primary key references public.hotels (id) on delete cascade,
  departments jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- HR-uploaded and platform training modules (slides, questions, video refs)
-- ---------------------------------------------------------------------------
create table if not exists public.hr_training_modules (
  id uuid primary key default gen_random_uuid(),
  legacy_id text,
  hotel_id uuid not null references public.hotels (id) on delete cascade,
  title text not null,
  file_name text not null default '',
  uploaded_at timestamptz not null default now(),
  department text not null default 'all',
  phase text not null default 'onboarding',
  ask_dimension text not null default 'skill',
  delivery_type text not null default 'slides',
  video_url text,
  video_duration_sec integer,
  source text not null default 'hr',
  slides jsonb not null default '[]'::jsonb,
  questions jsonb not null default '[]'::jsonb,
  slide_count integer not null default 0,
  question_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists hr_training_modules_hotel_id_idx
  on public.hr_training_modules (hotel_id);

create unique index if not exists hr_training_modules_hotel_legacy_idx
  on public.hr_training_modules (hotel_id, legacy_id)
  where legacy_id is not null;

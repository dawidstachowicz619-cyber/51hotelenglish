-- Hotel catalog course assignments (HR → employee course mapping)

create table if not exists public.hotel_course_assignments (
  id uuid primary key default gen_random_uuid(),
  hotel_id uuid not null references public.hotels (id) on delete cascade,
  catalog_course_id text not null,
  assign_mode text not null default 'all'
    check (assign_mode in ('all', 'department', 'employees')),
  department text not null default 'all',
  employee_ids jsonb not null default '[]'::jsonb,
  required boolean not null default true,
  assigned_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (hotel_id, catalog_course_id)
);

create index if not exists hotel_course_assignments_hotel_id_idx
  on public.hotel_course_assignments (hotel_id);

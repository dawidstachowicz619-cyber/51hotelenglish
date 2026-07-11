-- Daily learning data export snapshots (retain latest 30 versions)
create table if not exists public.learning_export_snapshots (
  id uuid primary key default gen_random_uuid(),
  export_date date not null,
  storage_path text not null,
  size_bytes bigint not null default 0,
  row_counts jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists learning_export_snapshots_export_date_idx
  on public.learning_export_snapshots (export_date desc);

-- Private bucket for zipped learning exports (service role only)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'learning-exports',
  'learning-exports',
  false,
  104857600,
  array['application/zip', 'application/octet-stream']
)
on conflict (id) do nothing;

-- Switch retention model: keep latest N versions (not N calendar days)
alter table public.learning_export_snapshots
  drop constraint if exists learning_export_snapshots_export_date_key;

create index if not exists learning_export_snapshots_created_at_idx
  on public.learning_export_snapshots (created_at desc);

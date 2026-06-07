-- Casino Atlántico Manatí — schema additions for v2 redesign
-- Run this ONCE in your Supabase SQL Editor BEFORE 0005_reseed_real_machines.sql

-- ── New columns on machines ───────────────────────────────────────────────────

alter table public.machines
  add column if not exists avg_coin_in  numeric(12,2),
  add column if not exists avg_win      numeric(12,2),
  add column if not exists period_start date,
  add column if not exists period_end   date;

-- ── machine_changes: history-friendly PK + 'removida' type + timestamps ───────

-- 1. Drop old single-machine-per-record primary key
alter table public.machine_changes drop constraint if exists machine_changes_pkey;

-- 2. Add auto-increment identity PK (allows multiple change records per machine)
alter table public.machine_changes
  add column if not exists id bigint generated always as identity;

-- Only add primary key if id column was just added (first run)
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'machine_changes_pkey'
      and conrelid = 'public.machine_changes'::regclass
  ) then
    alter table public.machine_changes add primary key (id);
  end if;
end $$;

-- 3. Widen the type check to include 'removida'
alter table public.machine_changes drop constraint if exists machine_changes_type_check;
alter table public.machine_changes
  add constraint machine_changes_type_check
  check (type in ('compra', 'reubicacion', 'cambio_juego', 'removida'));

-- 4. Add audit/period columns
alter table public.machine_changes
  add column if not exists recorded_at  timestamptz default now(),
  add column if not exists period_label text;

-- ── Grant admin INSERT/UPDATE on machine_changes ─────────────────────────────

drop policy if exists "admin_write_changes" on public.machine_changes;
create policy "admin_write_changes"
  on public.machine_changes for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

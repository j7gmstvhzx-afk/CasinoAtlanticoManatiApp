-- Casino Atlántico Manatí — definitive RLS read-policy reset
-- ---------------------------------------------------------------------------
-- Symptom this fixes: user is logged in (profiles read works, ADMIN badge
-- shows) but machines / coin_in_entries / machine_changes return ZERO rows,
-- so every tab shows "$0 / Sin datos" even though the tables are populated.
--
-- Cause: the original read policies used `auth.role() = 'authenticated'`,
-- which was removed in newer Supabase Postgres images and now evaluates to
-- NULL — silently blocking every row. The correct form targets the
-- `authenticated` role directly with `to authenticated using (true)`.
--
-- This script is idempotent: safe to run multiple times.
-- Paste the whole thing into the Supabase SQL Editor and Run.

-- Make sure RLS is on (no-op if already enabled)
alter table public.machines        enable row level security;
alter table public.coin_in_entries enable row level security;
alter table public.machine_changes enable row level security;

-- Drop any prior read policies (old broken ones AND the new ones) so we can
-- recreate them cleanly regardless of current state.
drop policy if exists "auth_read_machines"  on public.machines;
drop policy if exists "auth_read_coinin"    on public.coin_in_entries;
drop policy if exists "auth_read_changes"   on public.machine_changes;
-- legacy names, in case they were created under different labels
drop policy if exists "read_machines"       on public.machines;
drop policy if exists "read_coinin"         on public.coin_in_entries;
drop policy if exists "read_changes"        on public.machine_changes;

-- Recreate read policies with the correct `to authenticated` form.
create policy "auth_read_machines"
  on public.machines for select
  to authenticated using (true);

create policy "auth_read_coinin"
  on public.coin_in_entries for select
  to authenticated using (true);

create policy "auth_read_changes"
  on public.machine_changes for select
  to authenticated using (true);

-- Sanity check — run this separately to confirm the counts the app will see:
--   set role authenticated;
--   select count(*) from public.machines;        -- expect 285
--   select count(*) from public.coin_in_entries; -- expect ~25650
--   reset role;

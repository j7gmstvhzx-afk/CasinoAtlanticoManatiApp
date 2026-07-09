-- Casino Atlántico Manatí — RLS hardening
-- ---------------------------------------------------------------------------
-- Consensus security-audit remediation, steps 1 & 5:
--   1. Scope bulk financial reads to an explicitly-granted role instead of the
--      bare `authenticated` fact, so an auto-provisioned account cannot read
--      the entire floor/revenue dataset until it holds a recognized role.
--      (Pair with disabling open self-signup in the Supabase Auth dashboard.)
--   5. Make role-mutation protection explicit and durable: pin `profiles.role`
--      in a WITH CHECK so a future "edit your own profile" feature can never
--      let a viewer self-promote to admin, and give every admin_write_* policy
--      an explicit `to authenticated` target and matching WITH CHECK.
--
-- This script is idempotent: safe to run multiple times.
-- Paste the whole thing into the Supabase SQL Editor and Run.

-- Ensure RLS stays on (no-op if already enabled).
alter table public.profiles        enable row level security;
alter table public.machines        enable row level security;
alter table public.coin_in_entries enable row level security;
alter table public.machine_changes enable row level security;

-- ── Step 1: role-scoped reads ────────────────────────────────────────────────
-- Replace `using (true)` with a check that the caller holds a recognized role.
-- Every legitimate user gets a role='viewer' profile via handle_new_user, so
-- this is transparent for real users but revokes read the instant a profile is
-- removed or set to any non-listed role (e.g. a future 'suspended').

drop policy if exists "auth_read_machines" on public.machines;
create policy "auth_read_machines"
  on public.machines for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'viewer')
    )
  );

drop policy if exists "auth_read_coinin" on public.coin_in_entries;
create policy "auth_read_coinin"
  on public.coin_in_entries for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'viewer')
    )
  );

drop policy if exists "auth_read_changes" on public.machine_changes;
create policy "auth_read_changes"
  on public.machine_changes for select
  to authenticated
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('admin', 'viewer')
    )
  );

-- ── Step 5a: durable role-pin on profiles ────────────────────────────────────
-- A user may update their own profile row, but the WITH CHECK forbids changing
-- `role` — it must equal the role already stored for that user. This makes the
-- no-self-promotion guarantee explicit rather than an accident of "there is no
-- UPDATE policy today". Role changes must go through the service-role key.

drop policy if exists "update_own_profile_no_role_change" on public.profiles;
create policy "update_own_profile_no_role_change"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = (select p.role from public.profiles p where p.id = auth.uid())
  );

-- ── Step 5b: explicit target + WITH CHECK on admin writes ────────────────────
-- `for all using(...)` without an explicit WITH CHECK lets Postgres fall back
-- to the USING expression for INSERT/UPDATE, and without `to authenticated` the
-- policy is also evaluated for the anon role. State both explicitly.

drop policy if exists "admin_write_machines" on public.machines;
create policy "admin_write_machines"
  on public.machines for all
  to authenticated
  using      (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

drop policy if exists "admin_write_coinin" on public.coin_in_entries;
create policy "admin_write_coinin"
  on public.coin_in_entries for all
  to authenticated
  using      (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

drop policy if exists "admin_write_changes" on public.machine_changes;
create policy "admin_write_changes"
  on public.machine_changes for all
  to authenticated
  using      (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Sanity check — run separately to confirm the app still sees its data:
--   set role authenticated;
--   -- (with a valid auth.uid() that has a profile row)
--   select count(*) from public.machines;        -- expect 285
--   select count(*) from public.coin_in_entries; -- expect ~25650
--   reset role;

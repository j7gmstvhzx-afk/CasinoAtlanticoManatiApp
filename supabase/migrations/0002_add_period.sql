-- Add period column to machines
-- Allows admins to tag each machine with an operational period
-- (e.g. "Q1 2025", "Temporada Alta"). Text field, nullable, free-form.
alter table public.machines
  add column if not exists period text;

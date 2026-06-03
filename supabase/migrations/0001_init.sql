-- Casino Atlántico Manatí — Slot Floor Operations DB
-- Run this once in your Supabase SQL editor at:
-- https://app.supabase.com/project/<your-project>/sql

-- ── Tables ───────────────────────────────────────────────────────────────────

create table public.profiles (
  id        uuid primary key references auth.users(id) on delete cascade,
  email     text not null,
  full_name text,
  role      text not null default 'viewer'
              check (role in ('admin','viewer')),
  created_at timestamptz default now()
);

create table public.machines (
  id           text primary key,
  location     text not null,
  game         text not null,
  manufacturer text not null,
  type         text not null,
  min_bet      numeric(10,2) not null,
  multi_deno   boolean not null default false,
  denomination text not null,
  max_bet_01   numeric(10,2),
  max_bet_02   numeric(10,2),
  max_bet_05   numeric(10,2),
  max_bet_10   numeric(10,2),
  active       boolean not null default true,
  updated_at   timestamptz default now()
);

create table public.coin_in_entries (
  machine_id text not null references public.machines(id) on delete cascade,
  date       date not null,
  amount     numeric(12,2) not null,
  primary key (machine_id, date)
);

create table public.machine_changes (
  mc           text primary key,
  type         text not null check (type in ('compra','reubicacion','cambio_juego')),
  manufacturer text not null,
  game_2024    text,
  game_2025    text,
  location_2024 text,
  location_2025 text,
  bank         text
);

-- ── Auto-create profile on signup ────────────────────────────────────────────

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── Row-Level Security ───────────────────────────────────────────────────────

alter table public.profiles       enable row level security;
alter table public.machines        enable row level security;
alter table public.coin_in_entries enable row level security;
alter table public.machine_changes enable row level security;

-- profiles: users see only their own row
create policy "own_profile"
  on public.profiles for select
  using (auth.uid() = id);

-- machines: any authenticated user can read; only admins can write
-- NOTE: use `to authenticated` rather than the deprecated auth.role()
-- helper, which was removed in newer Postgres images and returns NULL
-- (silently blocking every row).
create policy "auth_read_machines"
  on public.machines for select
  to authenticated using (true);

create policy "admin_write_machines"
  on public.machines for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- coin_in_entries: same pattern
create policy "auth_read_coinin"
  on public.coin_in_entries for select
  to authenticated using (true);

create policy "admin_write_coinin"
  on public.coin_in_entries for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- machine_changes: read-only for all authenticated users
create policy "auth_read_changes"
  on public.machine_changes for select
  to authenticated using (true);

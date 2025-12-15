-- Rocky Web Studio / Consciousness Journey Portal
-- Migration: 20251214_create_consciousness_tables.sql
--
-- Creates:
--  - public.consciousness_journeys
--  - public.consciousness_progress
--  - public.consciousness_levels_reference
-- Adds:
--  - Constraints for valid ranges/values
--  - Indexes for common query patterns
--  - RLS + policies for user isolation
--  - updated_at triggers for mutable tables

-- -----------------------------------------------------------------------------
-- Extensions
-- -----------------------------------------------------------------------------
-- gen_random_uuid() is provided by pgcrypto in Supabase.
create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- Shared trigger function for updated_at
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- Table: consciousness_levels_reference (lookup/reference)
-- -----------------------------------------------------------------------------
create table if not exists public.consciousness_levels_reference (
  id uuid primary key default gen_random_uuid(),
  level integer not null unique,
  name varchar not null,
  description text,
  characteristics text[],
  energy_level integer,
  color_hex varchar(7),

  constraint consciousness_levels_reference_level_range
    check (level between 2 and 18),

  constraint consciousness_levels_reference_energy_level_range
    check (energy_level is null or energy_level between 1 and 10),

  constraint consciousness_levels_reference_color_hex_format
    check (color_hex is null or color_hex ~ '^#[0-9A-Fa-f]{6}$')
);

-- Index for level lookup (explicit per requirements; unique already indexes, but this is harmless)
create index if not exists idx_consciousness_levels_reference_level
  on public.consciousness_levels_reference (level);

-- RLS: readable by all authenticated users
alter table public.consciousness_levels_reference enable row level security;

create policy "Authenticated users can read consciousness levels"
  on public.consciousness_levels_reference
  for select
  to authenticated
  using (true);

-- -----------------------------------------------------------------------------
-- Table: consciousness_journeys (user journeys)
-- -----------------------------------------------------------------------------
create table if not exists public.consciousness_journeys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,

  current_consciousness_level integer,
  desired_consciousness_level integer,

  perplexity_analysis jsonb,
  perplexity_prompt text,

  suno_generation_id text,
  song_url text,

  user_perceived_shift text,

  saved_to_library boolean not null default false,
  is_favorite boolean not null default false,

  created_at timestamp not null default now(),
  updated_at timestamp not null default now(),

  constraint consciousness_journeys_current_level_range
    check (current_consciousness_level is null or current_consciousness_level between 2 and 18),

  constraint consciousness_journeys_desired_level_range
    check (desired_consciousness_level is null or desired_consciousness_level between 2 and 18)
);

create index if not exists idx_consciousness_journeys_user_id_created_at
  on public.consciousness_journeys (user_id, created_at);

alter table public.consciousness_journeys enable row level security;

-- Users can SELECT their own journeys
create policy "Users can select their own consciousness journeys"
  on public.consciousness_journeys
  for select
  using (auth.uid() = user_id);

-- Users can INSERT their own journeys
create policy "Users can insert their own consciousness journeys"
  on public.consciousness_journeys
  for insert
  with check (auth.uid() = user_id);

-- Users can UPDATE their own journeys
create policy "Users can update their own consciousness journeys"
  on public.consciousness_journeys
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Users can DELETE their own journeys
create policy "Users can delete their own consciousness journeys"
  on public.consciousness_journeys
  for delete
  using (auth.uid() = user_id);

create trigger trg_consciousness_journeys_set_updated_at
  before update on public.consciousness_journeys
  for each row
  execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Table: consciousness_progress (tracking data)
-- -----------------------------------------------------------------------------
create table if not exists public.consciousness_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,

  average_current_level float,
  average_desired_level float,

  sessions_today integer not null default 0,
  trend varchar(20),
  monthly_sessions integer,

  created_at timestamp not null default now(),
  updated_at timestamp not null default now(),

  constraint consciousness_progress_sessions_today_nonnegative
    check (sessions_today >= 0),

  constraint consciousness_progress_trend_values
    check (trend is null or trend in ('ascending', 'stable', 'descending')),

  constraint consciousness_progress_one_row_per_user_per_day
    unique (user_id, date)
);

create index if not exists idx_consciousness_progress_user_id_date
  on public.consciousness_progress (user_id, date);

alter table public.consciousness_progress enable row level security;

-- Users can SELECT their own progress
create policy "Users can select their own consciousness progress"
  on public.consciousness_progress
  for select
  using (auth.uid() = user_id);

-- Users can INSERT their own progress
create policy "Users can insert their own consciousness progress"
  on public.consciousness_progress
  for insert
  with check (auth.uid() = user_id);

-- Users can UPDATE their own progress
create policy "Users can update their own consciousness progress"
  on public.consciousness_progress
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Users can DELETE their own progress
create policy "Users can delete their own consciousness progress"
  on public.consciousness_progress
  for delete
  using (auth.uid() = user_id);

create trigger trg_consciousness_progress_set_updated_at
  before update on public.consciousness_progress
  for each row
  execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Seed data: consciousness_levels_reference (Hawkins simplified 9-level scale)
-- -----------------------------------------------------------------------------
-- One INSERT per level, using UPSERT to make this migration idempotent.

insert into public.consciousness_levels_reference (level, name, description, characteristics, energy_level, color_hex)
values (
  2,
  'Shame',
  'Despair, unworthiness, collapse, helplessness',
  array['despair', 'unworthiness', 'hopelessness', 'collapse', 'self-rejection']::text[],
  1,
  '#8B0000'
)
on conflict (level) do update set
  name = excluded.name,
  description = excluded.description,
  characteristics = excluded.characteristics,
  energy_level = excluded.energy_level,
  color_hex = excluded.color_hex;

insert into public.consciousness_levels_reference (level, name, description, characteristics, energy_level, color_hex)
values (
  4,
  'Guilt',
  'Regret, shame projection, vulnerability, taking responsibility',
  array['regret', 'vulnerability', 'self-blame', 'responsibility', 'shame-projection']::text[],
  2,
  '#FF4500'
)
on conflict (level) do update set
  name = excluded.name,
  description = excluded.description,
  characteristics = excluded.characteristics,
  energy_level = excluded.energy_level,
  color_hex = excluded.color_hex;

insert into public.consciousness_levels_reference (level, name, description, characteristics, energy_level, color_hex)
values (
  6,
  'Apathy',
  'Indifference, numbness, pause, futility, resignation',
  array['indifference', 'numbness', 'pause', 'resignation', 'fatigue']::text[],
  3,
  '#FFD700'
)
on conflict (level) do update set
  name = excluded.name,
  description = excluded.description,
  characteristics = excluded.characteristics,
  energy_level = excluded.energy_level,
  color_hex = excluded.color_hex;

insert into public.consciousness_levels_reference (level, name, description, characteristics, energy_level, color_hex)
values (
  8,
  'Fear',
  'Anxiety, worry, uncertainty, building energy, caution',
  array['anxiety', 'worry', 'uncertainty', 'caution', 'building-energy']::text[],
  7,
  '#FFA500'
)
on conflict (level) do update set
  name = excluded.name,
  description = excluded.description,
  characteristics = excluded.characteristics,
  energy_level = excluded.energy_level,
  color_hex = excluded.color_hex;

insert into public.consciousness_levels_reference (level, name, description, characteristics, energy_level, color_hex)
values (
  10,
  'Anger',
  'Power, assertion, truth-telling, strength, boundary-setting',
  array['power', 'assertion', 'strength', 'truth-telling', 'boundary-setting']::text[],
  8,
  '#FF6347'
)
on conflict (level) do update set
  name = excluded.name,
  description = excluded.description,
  characteristics = excluded.characteristics,
  energy_level = excluded.energy_level,
  color_hex = excluded.color_hex;

insert into public.consciousness_levels_reference (level, name, description, characteristics, energy_level, color_hex)
values (
  12,
  'Desire',
  'Ambition, wanting, striving, growth, momentum',
  array['ambition', 'wanting', 'striving', 'growth', 'momentum']::text[],
  6,
  '#FFD700'
)
on conflict (level) do update set
  name = excluded.name,
  description = excluded.description,
  characteristics = excluded.characteristics,
  energy_level = excluded.energy_level,
  color_hex = excluded.color_hex;

insert into public.consciousness_levels_reference (level, name, description, characteristics, energy_level, color_hex)
values (
  14,
  'Reason',
  'Understanding, clarity, logic, balance, integration',
  array['understanding', 'clarity', 'logic', 'balance', 'integration']::text[],
  4,
  '#4169E1'
)
on conflict (level) do update set
  name = excluded.name,
  description = excluded.description,
  characteristics = excluded.characteristics,
  energy_level = excluded.energy_level,
  color_hex = excluded.color_hex;

insert into public.consciousness_levels_reference (level, name, description, characteristics, energy_level, color_hex)
values (
  16,
  'Loving',
  'Compassion, acceptance, forgiveness, unconditional, transcendence',
  array['compassion', 'acceptance', 'forgiveness', 'unconditional', 'transcendence']::text[],
  5,
  '#9370DB'
)
on conflict (level) do update set
  name = excluded.name,
  description = excluded.description,
  characteristics = excluded.characteristics,
  energy_level = excluded.energy_level,
  color_hex = excluded.color_hex;

insert into public.consciousness_levels_reference (level, name, description, characteristics, energy_level, color_hex)
values (
  18,
  'Joy',
  'Happiness, fulfillment, creation, presence, enlightenment',
  array['happiness', 'fulfillment', 'creation', 'presence', 'enlightenment']::text[],
  9,
  '#FFFFFF'
)
on conflict (level) do update set
  name = excluded.name,
  description = excluded.description,
  characteristics = excluded.characteristics,
  energy_level = excluded.energy_level,
  color_hex = excluded.color_hex;

-- Rocky Web Studio / Music Therapy Portal
-- Migration: 20251215_allow_anon_read_consciousness_levels.sql
--
-- Allow unauthenticated (anon) clients to read the reference scale.
-- This keeps the Start/Destination pages usable without requiring login.
--
-- Idempotent: checks pg_policies before creating.

alter table public.consciousness_levels_reference enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'consciousness_levels_reference'
      and policyname = 'Anon users can read consciousness levels'
  ) then
    create policy "Anon users can read consciousness levels"
      on public.consciousness_levels_reference
      for select
      to anon
      using (true);
  end if;
end;
$$;

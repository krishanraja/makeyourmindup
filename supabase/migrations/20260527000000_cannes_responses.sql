-- cannes_responses + RLS + share-card function
-- Idempotent so re-runs are safe.

create extension if not exists pgcrypto;

create table if not exists public.cannes_responses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  q1_week_needs_me int,
  q2_extra_self text,
  q3_company_ai int,
  q4_company_future text,
  q5_decision text,
  archetype_title text,
  archetype_variant char(1),
  result_prose_12mo text,
  result_prose_3yr text,
  email text,
  email_captured_at timestamptz,
  email_sent_at timestamptz,
  fork_choice text,
  fork_clicked_at timestamptz,
  user_agent text,
  source text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  completion_time_ms int
);

create index if not exists cannes_responses_created_at_idx
  on public.cannes_responses (created_at desc);
create index if not exists cannes_responses_email_idx
  on public.cannes_responses (email) where email is not null;
create index if not exists cannes_responses_source_idx
  on public.cannes_responses (source);

alter table public.cannes_responses enable row level security;

drop policy if exists "allow anonymous insert" on public.cannes_responses;
create policy "allow anonymous insert"
  on public.cannes_responses
  for insert
  to anon
  with check (true);

-- No SELECT/UPDATE/DELETE policies for anon. The client provides a
-- client-generated UUID at insert time and passes it back to the edge
-- functions (which run under service_role) for every subsequent write.
-- This matches the spec's "No select policy for anon" requirement and
-- avoids the Postgres-RLS quirk where UPDATE...WHERE without a SELECT
-- policy silently no-ops because the WHERE filter cannot resolve.
drop policy if exists "allow update own row" on public.cannes_responses;

-- Share-safe read function. Returns only the fields needed by the OG route.
create or replace function public.get_share_card(p_id uuid)
returns table (
  archetype_title text,
  archetype_variant char(1),
  q1_week_needs_me int,
  q2_extra_self text,
  q3_company_ai int,
  q4_company_future text
)
language sql
security definer
set search_path = public
stable
as $$
  select
    archetype_title,
    archetype_variant,
    q1_week_needs_me,
    q2_extra_self,
    q3_company_ai,
    q4_company_future
  from public.cannes_responses
  where id = p_id;
$$;

grant execute on function public.get_share_card(uuid) to anon;

-- Portfolio hive mind: the consent-gated warm handoff.
--
-- When a leader opts in at the Make Your Mind Up fork, the CATEGORISED shape of
-- their answers travels to the product they open next (CTRL / Mindmaker) so it
-- starts warm instead of cold. The raw q5 text and any transcript NEVER travel -
-- only a lane, the entry door, the q2/q4 modality, the company domain, and the
-- archetype. Rows are short-lived and read only by service-role edge functions.

create table if not exists public.portfolio_handoff (
  id uuid primary key default gen_random_uuid(),
  source text not null default 'mymu',
  source_response_id uuid,
  entry_variant text,
  q2 text,
  q4 text,
  anxiety_lane text,            -- categorised from q5; the raw q5 is never stored
  company_domain text,
  archetype_title text,
  destination text,
  created_at timestamptz not null default now(),
  consumed_at timestamptz,
  expires_at timestamptz not null default (now() + interval '7 days')
);

create index if not exists portfolio_handoff_created_idx
  on public.portfolio_handoff (created_at desc);

-- No anon access: producers and consumers are service-role edge functions only.
alter table public.portfolio_handoff enable row level security;

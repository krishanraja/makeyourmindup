-- Person-resolver pipeline columns. Additive + idempotent.
-- The enrich-profile edge function now runs a multi-provider waterfall
-- (PDL / Apollo / company-context / web signals / optional live scrape) and
-- stores the resolved identity + provenance here. Existing enrichment_*
-- contract columns are unchanged so generate-result / send-result-email /
-- get_share_card keep working without edits.

alter table public.cannes_responses
  add column if not exists enrichment_raw_input   jsonb,   -- {raw, normalized seed}
  add column if not exists resolved_linkedin_url  text,    -- canonical /in/ URL
  add column if not exists resolution_confidence  text,    -- 'high' | 'medium' | 'low'
  add column if not exists resolution_provenance  jsonb,   -- { field: provider }
  add column if not exists providers_hit          jsonb,   -- provider name[]
  add column if not exists email_deliverable      boolean, -- NeverBounce
  add column if not exists company_domain         text,
  add column if not exists company_context        jsonb,   -- { logoUrl, brandColors, rank, techStack, ... }
  add column if not exists person_experience      jsonb;   -- work history array

create index if not exists cannes_responses_resolved_linkedin_url_idx
  on public.cannes_responses (resolved_linkedin_url)
  where resolved_linkedin_url is not null;

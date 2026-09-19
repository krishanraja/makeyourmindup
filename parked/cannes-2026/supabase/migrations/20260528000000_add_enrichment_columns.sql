-- Add enrichment columns to cannes_responses.
-- Populated asynchronously by the enrich-profile edge function after a
-- LinkedIn URL / screenshot / typed name+company is dropped at the start
-- of the experience. generate-result reads these to enrich the prose.
-- Idempotent so re-runs are safe.

alter table public.cannes_responses
  add column if not exists enrichment_status text,
  add column if not exists enrichment_kind text,
  add column if not exists enrichment_name text,
  add column if not exists enrichment_role text,
  add column if not exists enrichment_company text,
  add column if not exists enrichment_company_blurb text,
  add column if not exists enrichment_signals jsonb,
  add column if not exists enrichment_started_at timestamptz,
  add column if not exists enrichment_completed_at timestamptz;

create index if not exists cannes_responses_enrichment_status_idx
  on public.cannes_responses (enrichment_status)
  where enrichment_status is not null;

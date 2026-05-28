-- Add entry_variant to cannes_responses.
-- Records which entry door (decide / extend / imagine) a session came through.
-- Nullable on purpose: rows created before the variant routes existed predate
-- the concept and are left null rather than mislabelled. New sessions always
-- write a value. Idempotent so re-runs are safe.

alter table public.cannes_responses
  add column if not exists entry_variant text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'cannes_responses_entry_variant_check'
  ) then
    alter table public.cannes_responses
      add constraint cannes_responses_entry_variant_check
      check (entry_variant is null or entry_variant in ('decide', 'extend', 'imagine'));
  end if;
end$$;

create index if not exists cannes_responses_entry_variant_idx
  on public.cannes_responses (entry_variant)
  where entry_variant is not null;

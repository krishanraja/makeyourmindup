-- One format vocabulary, with a rename ledger, so history stays comparable.
--
-- Ruling (Krish, 2026-09-19): foreign key on everything; `built` maps to
-- lift_the_lid; whatever fits no subchannel goes to a holding area where
-- general news can still be collected.
--
-- THE CONSTRAINT THAT SHAPED THIS MIGRATION, in his words: "this system needs
-- to track shifts and general patterns over time into a schema and with a
-- methodology that survives over time (even if it does change slightly), so
-- that in the future we can track apples for apples by looking into the past."
--
-- That rules out the obvious migration. Rewriting `paid` to `split_the_bill`
-- in place makes every historical row claim it always said split_the_bill, and
-- the next rename does it again. Ask "what did we publish under the money
-- format in August" two renames from now and there is no honest answer, because
-- the evidence was edited each time to match the present.
--
-- So a rename is RECORDED here, not just applied:
--
--   venture_formats.kind   says what a row IS, so `active` stops carrying two
--                          meanings. A subchannel can be commissioned against.
--                          A holding lane collects. A retired row resolves old
--                          data and is never offered. An `any` row is a real
--                          answer ("suits more than one") and not a null.
--
--   format_aliases         the rename ledger. Every name a format has ever had,
--                          what it resolves to, when it stopped being used, and
--                          why. Reads resolve through it, so a 2026-08 row and a
--                          2026-09 row answer the same question the same way.
--                          A FUTURE RENAME ADDS A ROW HERE. It does not rewrite
--                          data, and it does not need a migration like this one.
--
--   *_format_was           on each migrated table, the value that was actually
--                          stored at the time. The FK column carries today's
--                          truth; this carries what the row said when it was
--                          written. Longitudinal questions read this one.
--
-- Net effect: the FK makes an unknown slug fail the write, and nothing about
-- the past is lost to make that possible.

begin;

-- ── 1. What a row IS, separately from whether it is active ──────────────────
alter table public.venture_formats add column if not exists kind text;

update public.venture_formats set kind = case
  when slug in ('split_the_bill', 'mind_the_gap', 'lift_the_lid') then 'subchannel'
  else 'retired'
end where kind is null;

alter table public.venture_formats
  alter column kind set default 'subchannel',
  alter column kind set not null;

alter table public.venture_formats drop constraint if exists venture_formats_kind_check;
alter table public.venture_formats add constraint venture_formats_kind_check
  check (kind in ('subchannel', 'holding', 'any', 'retired'));

comment on column public.venture_formats.kind is
  'subchannel: commissionable. holding: collects what fits no subchannel, never commissioned. any: a real answer meaning "suits more than one", used by guests.format. retired: resolves historical rows and is never offered for new work. `active` says whether the row is in use; `kind` says what using it means.';

-- ── 2. A slug a foreign key can point at ────────────────────────────────────
-- venture_formats had unique (venture_slug, slug) only, which no FK can target.
alter table public.venture_formats drop constraint if exists venture_formats_slug_key;
alter table public.venture_formats add constraint venture_formats_slug_key unique (slug);

-- ── 3. The holding lane, and the honest "more than one" ─────────────────────
insert into public.venture_formats
  (id, venture_slug, slug, label, hero, cadence_label, target_per_week, corpus_key, active, sort_order, kind, mandate)
values
  ('publication:general', 'publication', 'general', 'general', false, 'No cadence', 0, 'makeyourmindup', true, 90, 'holding',
   $m$Not a subchannel. The holding lane for material that is worth collecting and does not belong to split.the.bill, mind.the.gap or lift.the.lid. General news, background, things that may become evidence for a piece later. NOTHING IS EVER COMMISSIONED AGAINST THIS. It exists so that a row which fits no subchannel has an honest home rather than a null, because a null cannot tell "nobody has looked at this yet" apart from "we looked and it fits nowhere". The tracked themes are the long-run question; this is the raw feed underneath them.$m$),
  ('publication:either', 'publication', 'either', 'either', false, 'Not applicable', 0, 'makeyourmindup', true, 91, 'any',
   $m$Not a subchannel. A real answer meaning the subject suits more than one, used by guests.format where a guest fits several. Kept as a row rather than a null so the foreign key can hold it and so "suits more than one" stays distinguishable from "not yet decided".$m$)
on conflict (id) do update set kind = excluded.kind, mandate = excluded.mandate, updated_at = now();

-- ── 4. The rename ledger ────────────────────────────────────────────────────
create table if not exists public.format_aliases (
  alias        text primary key,
  slug         text not null references public.venture_formats(slug) on update cascade,
  retired_on   date,
  note         text not null,
  created_at   timestamptz not null default now()
);

comment on table public.format_aliases is
  'Every name a publication format has ever had, and what it resolves to now. Readers resolve historical values through this so a row written in August and a row written in September answer the same question the same way. A FUTURE RENAME ADDS A ROW HERE rather than rewriting stored data: that is what keeps longitudinal comparison honest, because the evidence is never edited to match the present.';

insert into public.format_aliases (alias, slug, retired_on, note) values
  ('paid',          'split_the_bill', '2026-09-17', 'The Money of AI, by its storage key. Money to money, an unambiguous rename.'),
  ('money_of_ai',   'split_the_bill', '2026-09-17', 'The Money of AI. Same format, new name.'),
  ('built',         'lift_the_lid',   '2026-09-17', 'Built with AI, by its storage key. Ruling (Krish, 2026-09-19). Not obvious: Built with AI was builder conversations and the human motive, which reads toward mind.the.gap, but the product and build territory is lift.the.lid''s. Recorded because it is a judgement, not a mechanical rename.'),
  ('built_with_ai', 'lift_the_lid',   '2026-09-17', 'Built with AI. Ruling (Krish, 2026-09-19), same judgement as above.'),
  ('mindmaker_live','general',        '2026-08-29', 'A retired publication brand, not a format. Resolves to the holding lane.'),
  ('techonomic',    'general',        '2026-08-06', 'A retired brand. Its register survives inside the subchannels; the name does not.'),
  ('builder_economy','general',       '2026-08-11', 'A retired brand.')
on conflict (alias) do update set
  slug = excluded.slug, retired_on = excluded.retired_on, note = excluded.note;

alter table public.format_aliases enable row level security;
drop policy if exists "format_aliases anon read" on public.format_aliases;
create policy "format_aliases anon read" on public.format_aliases for select to anon using (true);
drop policy if exists "format_aliases service all" on public.format_aliases;
create policy "format_aliases service all" on public.format_aliases for all to service_role using (true) with check (true);

commit;

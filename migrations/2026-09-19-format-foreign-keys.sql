-- An unknown format slug now fails the write rather than degrading.
--
-- Runs after 2026-09-19-format-identity-and-aliases.sql, which created the
-- unique slug, the holding lane, the `any` row and the rename ledger.
--
-- ORDERING, AND WHY IT IS WRITTEN DOWN. The first attempt at this migration
-- updated the data BEFORE dropping the old CHECK constraints, and died on
-- `content_slate_rulings_channel_check`, which still allowed only built/paid.
-- The first row set to split_the_bill failed the constraint and took the whole
-- transaction with it. Nothing was lost, because it was one transaction, which
-- is the only reason that mistake cost nothing. Drop, then update, then key.
--
-- WHAT IS DELIBERATELY NOT TOUCHED. `guests_podcast_target_check` allows
-- signal_noise / builder_economy / either. `builder_economy` is a retired
-- publication brand AND the name of a podcast, and podcast_target means the
-- show a guest suits. Two vocabularies sharing one retired word. Changing it
-- here would have migrated a podcast into a publication format.
--
-- WHY `_was` COLUMNS. Ruling (Krish, 2026-09-19): the schema has to survive its
-- own renames so past and present stay comparable. A rename applied in place
-- makes every historical row claim it always said the new name, and after two
-- renames there is no honest answer to "what did we publish under the money
-- format in August". The FK column carries today's truth; `_was` carries what
-- the row said when it was written; format_aliases carries the mapping between
-- them. Longitudinal questions read `_was`.

begin;

alter table public.content_themes        add column if not exists channel_was text;
alter table public.content_slate_rulings add column if not exists channel_was text;
alter table public.shifts                add column if not exists lane_was text;
alter table public.guests                add column if not exists format_was text;
alter table public.video_studio_jobs     add column if not exists series_was text;
alter table public.content_ideas         add column if not exists lane_slot_was text;

comment on column public.content_themes.channel_was is
  'What this row stored when it was written. `channel` is resolved to the current vocabulary; this is the record. Ask longitudinal questions of this column, and resolve it through format_aliases.';

update public.content_themes        set channel_was = channel     where channel_was is null;
update public.content_slate_rulings set channel_was = channel     where channel_was is null;
update public.shifts                set lane_was = lane           where lane_was is null and lane is not null;
update public.guests                set format_was = format       where format_was is null and format is not null;
update public.video_studio_jobs     set series_was = series       where series_was is null;
update public.content_ideas         set lane_slot_was = lane_slot where lane_slot_was is null and lane_slot is not null;

-- Drop first. See the ordering note above.
alter table public.content_themes        drop constraint if exists content_themes_channel_check;
alter table public.content_slate_rulings drop constraint if exists content_slate_rulings_channel_check;
alter table public.guests                drop constraint if exists guests_format_check;
alter table public.video_studio_jobs     drop constraint if exists video_studio_jobs_series_check;

-- Resolve through the ledger, never a hardcoded map, so the next rename is a
-- row in format_aliases and not another migration like this one.
update public.content_themes t        set channel = a.slug   from public.format_aliases a where a.alias = t.channel;
update public.content_slate_rulings r set channel = a.slug   from public.format_aliases a where a.alias = r.channel;
update public.shifts s                set lane = a.slug      from public.format_aliases a where a.alias = s.lane;
update public.guests g                set format = a.slug    from public.format_aliases a where a.alias = g.format;
update public.video_studio_jobs j     set series = a.slug    from public.format_aliases a where a.alias = j.series;
update public.content_ideas i         set lane_slot = a.slug from public.format_aliases a where a.alias = i.lane_slot;

alter table public.content_themes        add constraint content_themes_channel_fkey
  foreign key (channel) references public.venture_formats(slug) on update cascade;
alter table public.content_slate_rulings add constraint content_slate_rulings_channel_fkey
  foreign key (channel) references public.venture_formats(slug) on update cascade;
alter table public.shifts                add constraint shifts_lane_fkey
  foreign key (lane) references public.venture_formats(slug) on update cascade;
alter table public.guests                add constraint guests_format_fkey
  foreign key (format) references public.venture_formats(slug) on update cascade;
alter table public.video_studio_jobs     add constraint video_studio_jobs_series_fkey
  foreign key (series) references public.venture_formats(slug) on update cascade;
alter table public.content_ideas         add constraint content_ideas_lane_slot_fkey
  foreign key (lane_slot) references public.venture_formats(slug) on update cascade;

commit;

-- APPLIED 2026-09-19 and read back. Migrated: 24 + 16 slate rulings, 26 + 15
-- shifts, 34 + 10 guests, 2 themes, 2 studio jobs. Every changed row carries
-- its original value in `_was`.
--
-- Proved afterwards, against the live table:
--
--   update content_themes set channel = 'split_the_bil' ...
--   ERROR: 23503: violates foreign key constraint "content_themes_channel_fkey"
--   DETAIL: Key (channel)=(split_the_bil) is not present in table "venture_formats".
--
-- A typo is refused by name. A retired slug is still accepted, because
-- historical rows have to keep resolving.

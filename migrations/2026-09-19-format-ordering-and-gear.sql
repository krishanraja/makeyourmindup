-- Two ways the table could still be read two different ways on the same day.
--
-- 1. SORT ORDER COLLIDES. mind_the_gap and the retired money_of_ai both had
--    sort_order 1; split_the_bill and the retired built_with_ai both had 2. An
--    `order by sort_order` is then non-deterministic between them, so the same
--    query returns a different first format run to run and a UI that shows the
--    hero first shows a retired brand instead. Retired rows move to a 900 band,
--    which keeps them orderable among themselves and out of the live sequence.
--
-- 2. GEAR WAS NULL ON A LIVE SUBCHANNEL. lift_the_lid had no gear while the
--    other two carried Gear A, and a null there cannot tell "nobody decided"
--    apart from "decided: none". The voice doctrine settled what gear means on
--    2026-09-19: Gear A is the written publication register and Gear B is the
--    short-form video register for YouTube and TikTok. Gear B was named after a
--    channel until that date, which is why it looked like a per-format value.
--    It is a per-SURFACE value. All three written subchannels are Gear A.

begin;

update public.venture_formats set sort_order = 901 where slug = 'money_of_ai';
update public.venture_formats set sort_order = 902 where slug = 'built_with_ai';

update public.venture_formats set gear = 'Gear A'
where kind = 'subchannel' and gear is null;

comment on column public.venture_formats.gear is
  'The written register, per the voice doctrine as settled 2026-09-19. Gear A is the publication''s written channel and every subchannel is Gear A. Gear B is the short-form video register for YouTube and TikTok, which is a SURFACE and not a format, so it never appears in this column. It was named after a channel until 2026-09-19, which is why it used to look like a per-format value.';

comment on column public.venture_formats.sort_order is
  'Display order. Live rows occupy 1..99, the holding and any rows 90..99, retired rows the 900 band. Retired rows previously shared 1 and 2 with live ones, which made `order by sort_order` non-deterministic between a live format and a retired brand.';

commit;

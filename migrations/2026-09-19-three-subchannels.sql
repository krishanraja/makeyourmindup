-- Three subchannels, and the boundary that stops two of them claiming one subject.
--
-- Ruling (Krish, 2026-09-19): split.the.bill, mind.the.gap and lift.the.lid are
-- the three main subchannels. This reverses the 2026-09-18 retirement of
-- lift.the.lid, which never had a row in venture_formats at all.
--
-- Three changes, and the third is the one that matters.
--
-- 1. lift_the_lid is created. Standing subchannel, no fixed day, because a
--    third fixed slot costs hours the two-to-four-hour rule does not have.
--
-- 2. mind_the_gap keeps the gap and gains a topic. Krish described it as "big
--    changes in a specific topic", which is not what the stored mandate said.
--    Reconciled rather than replaced: the topic is the spine, the gap is the
--    argument. Replacing it outright would have left the name, the timeline
--    diagram and the your.call question all describing a format that no longer
--    existed.
--
-- 3. split_the_bill gives product surfaces back. Its mandate said "Inspecting a
--    product is a method here, not a format", which was written BECAUSE
--    lift.the.lid was retired and split.the.bill absorbed product inspection.
--    Leaving that line in while lift.the.lid returns would have left two active
--    formats with an equal claim on the same pricing page, and nothing in the
--    data to say which wins. A router cannot fail on that: it just picks one.
--    That is the exact class of silent misassignment this change exists to
--    prevent, so the boundary is now written into BOTH mandates as a test on
--    the question rather than on the surface.

begin;

insert into public.venture_formats
  (id, venture_slug, slug, label, hero, cadence_label, target_per_week, corpus_key, active, sort_order, mandate)
values (
  'publication:lift_the_lid', 'publication', 'lift_the_lid', 'lift.the.lid',
  false, 'No fixed day', 0.5, 'makeyourmindup', true, 3,
  $mandate$Look underneath the product changes happening in AI. Take a launch, a release or a live product surface apart and separate what actually ships from what was demoed. THE STANDING QUESTION, and the one the opening artifact asks the reader: does this make its user sharper, or dependent? SUBJECTS: product surfaces are this format's own territory, not evidence borrowed from another - pricing pages, default settings, changelogs, free tiers, release notes, error states, and the gap between what a keynote claimed and what a normal account can reach on day one. Big-company launches first, because the distribution makes the stakes legible; after that, whoever leaves the best paper trail. THE BOUNDARY WITH split.the.bill, and it decides every contested subject: if the piece asks what it costs and who ends up holding the bill, it is split.the.bill. If it asks whether the thing makes its user sharper or dependent, it is lift.the.lid. The same pricing page can be either. The question decides, never the surface. Diagram language: the annotated product shot, with what is real marked against what is theatre. CADENCE: standing subchannel with no fixed day. It publishes when a subject earns it, because a third fixed slot costs hours the two-to-four-hour rule does not have. HARD GATES, applied before scoring. NOT US: the subject is never Krish, mind/make, CTRL or his own builds, however available the material. MATERIAL EXISTS: if the evidence has to be created rather than found, it is not commissioned, however good the idea. A product that must be bought, installed and run to be inspected fails this gate; a product whose changelog, docs and pricing page are public passes it. TIMESTAMP EVERYTHING: pricing pages and changelogs change, so archive the surface before recording or the piece rots in a week. NO PREACHING: no closing moral, no lesson for leaders, no sentence telling the reader what to conclude. The verdict is the reader's to reach.$mandate$
)
on conflict (id) do update set
  label = excluded.label, hero = excluded.hero, cadence_label = excluded.cadence_label,
  target_per_week = excluded.target_per_week, corpus_key = excluded.corpus_key,
  active = excluded.active, sort_order = excluded.sort_order, mandate = excluded.mandate,
  updated_at = now();

-- The topic is the spine, the gap is the argument. Everything after the opening
-- is unchanged.
update public.venture_formats set
  mandate = replace(
    mandate,
    'The gap between what everyone says is happening and what is actually happening. Carries public decisions',
    'The gap between what everyone says is happening and what is actually happening, traced through ONE topic per piece. The topic is the spine and the gap is the argument: take a subject, follow it over time, and show where the claim and the reality separated. A piece that surveys several topics is not this format. Carries public decisions'
  ),
  updated_at = now()
where slug = 'mind_the_gap';

-- Product surfaces go back to lift.the.lid. The replaced sentence is quoted
-- exactly so this is a no-op if it has already been edited by hand.
update public.venture_formats set
  mandate = replace(
    mandate,
    'Product surfaces - pricing pages, default settings, changelogs, free tiers - are evidence for the money question, never subjects in their own right. Inspecting a product is a method here, not a format.',
    'Product surfaces - pricing pages, default settings, changelogs, free tiers - are evidence for the money question and are never a split.the.bill subject in their own right. The surface belongs to lift.the.lid, which asks a different question of it. THE BOUNDARY, and it decides every contested subject: if the piece asks what it costs and who ends up holding the bill, it is split.the.bill. If it asks whether the thing makes its user sharper or dependent, it is lift.the.lid. The question decides, never the surface.'
  ),
  updated_at = now()
where slug = 'split_the_bill';

commit;

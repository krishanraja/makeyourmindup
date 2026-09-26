---
kill_list_scope: canon
---
# History

Older entries rolled out of `NOW.md`. Newest first.

## 2026-09-26

- moved from `NOW.md` on reconciliation, verbatim, to hold the file under 200 lines. They keep the
  subchannel names they were written with (split.the.bill and lift.the.lid, renamed follow.the.money
  and under.the.hood by Krish on 2026-09-25):

  - 2026-09-20 **W38 was selected again over the enlarged pool and the slate did
    not move.** The 20 newsletters a dead Anthropic key had eaten were recovered
    that morning and produced 9 ideas, so the week was re-run against 219
    candidates instead of 216. Ten of the thirteen rows that arrived after the cut
    were duplicates of stories the pool already held, with the same figures already
    in the claim, which is the finding: the outage ate newsletters whose stories
    ran elsewhere too. One new candidate cleared the bar, `c0217`, the antitrust
    complaint filed on 18 September against Anthropic, OpenAI, SpaceXAI and Google
    over the slowdown agreement, and it ranks thirteenth of twenty-eight in
    split.the.bill at 7.34. Same three picks, same six alternates, same order, so
    no new rows were banked. The page gained a re-run line that says all of it,
    because a page that silently redraws the same cards reports nothing.
    `engine/runs/2026-W38/extend.py` is the stage that did it, with every gate
    decision and every score written out with its reason, and it is idempotent.
    `slate.first-run.json` and `selection.json` are committed so the two runs can
    be diffed rather than taken on trust.
  - 2026-09-19 **A card says which model produced it.** A run that spans a model
    switch has more than one author, and the first one did. `provenance.py` reads
    the run journal for labels and each transcript for the model that actually
    served it; each card carries "scored by X, checked by Y" and an unchecked one
    says so rather than leaving the reader to assume. The point is not the names:
    a ruling is evidence about the thing that made the suggestion, and the bank
    cannot tell you whether a producer improved if it does not know which
    producer it was. `a597669`, `e89699f`.
  - 2026-09-19 **Three subchannels, one vocabulary, and a rename that history
    survives.** Ruling (Krish): split.the.bill, mind.the.gap and lift.the.lid are
    the three main subchannels, reversing the 2026-09-18 retirement of
    lift.the.lid, which had never had a row. Three migrations, applied and read
    back: the subchannel rows with the boundary written into both contested
    mandates as a test on the question rather than the surface; `kind`, the
    holding lane and `format_aliases`; six foreign keys to
    `venture_formats(slug)` with `_was` columns, because Krish ruled the schema
    must let the past be compared with the present. A typo is refused by name.
    The 2026-09-17 calibration record was not edited; it gained a `superseded`
    key. `7c3f9af`.
  - 2026-09-19 **The table reads one way.** Retired rows shared `sort_order` 1
    and 2 with live ones, so an order by sort_order could show a retired brand as
    the hero. Retired rows moved to the 900 band. lift_the_lid's null `gear`
    became Gear A, because the voice doctrine settled that Gear B is a surface
    register (YouTube, TikTok) and not a format. `ca4fb20`.
  - 2026-09-19 **The intake runner is specified, and the ruling page has a
    home.** `engine/INTAKE_RUNNER_SPEC.md`: deterministic gates first, one
    batched model call against the mandates verbatim, fixed-template reasons,
    the anti-echo rule written into what the runner may read. `apps/machine/
    slate-page/`: the template Krish rules on, writing each verdict into the
    bank through his own Supabase connector and holding a local copy if that is
    not granted. `128893c`, `f3c8bfd`.

## 2026-09-20

- reconciled at `ac2668e2`: the Vercel Root Directory recommendation was withdrawn and NOW.md re-headed. No other non-steward commit since `daf27e47`.
- withdrawn: "set the Vercel Root Directory to `parked/cannes-2026`", which stood in NOW.md as a waiting-on-Krish action from 2026-09-19. Ruling (Krish, 2026-09-20): the Cannes funnel moves to the mm-ctrl app when ready, which `PARKED.md` had said all along. Pointing the publication repo's Vercel project at the parked folder would make a parked thing a first-class deploy target, have to be undone at migration, and hold `makeyourmindup.ai` on a Cannes funnel while the publication wants that domain. The urgency was also false: `makeyourmindup.ai` returns HTTP 200 and serves the funnel, and NOW.md itself said "a failed build never replaces a live one, so nothing has changed for a visitor" in the same paragraph the action line was read from.
- reconciled at `daf27e47`: three non-steward commits since `f3c8bfda`. The first slate was
  selected, banked and published, and the selection rules moved out of a workflow script into
  `apps/machine/slate-page` as four stages, with `engine/runs/2026-W38` keeping what the week
  was built from. `NOW.md` re-headed with two bullets, and its "Do not trust" line about
  `apps/machine/` corrected: the stages have been run once by hand, but nothing there is
  scheduled and no draft, derivative or send is built by it.
- moved from `NOW.md` on reconciliation, verbatim, to hold the file under 200 lines:

  - 2026-09-19 **The media kit stopped carrying two format tables.** One with
    two formats and one with three sat in the same section, and the older one
    had promoted split.the.bill's third question to its your.call question. One
    table now, taken from the live mandates.
  - 2026-09-19 **The canon landed in a repository for the first time.** Why: the
    fleet brief pointed five separate authorities at this repo, including
    `panel/PANEL.md` and `quality/panel/kill-list.v1.json`, and not one of them
    existed. The work had been done on 17 and 18 September and left in artifacts,
    which meant the publication's rubric, judges and kill list had no home a tool
    could read and no history anyone could diff.
  - 2026-09-19 **The Cannes funnel was parked** in `parked/cannes-2026/` with a
    marker saying why and where it is going. Why: it is finished, it is still
    deployed, and a repo named after the publication that contains only an
    unrelated funnel reads as the publication having no code.
  - 2026-09-17 **Krish voted a commissioning round and hand-tuned the weights**,
    recorded verbatim in `calibration/2026-09-17-commissioning-round-1.json`.
    Fifteen of twenty ideas judged, four excellent, two weak, and lift.the.lid
    took no excellent at all. He moved `fun` down from 3.0 to 2.5, `make` down
    from 2.0 to 1.5, and `number` up from 1.5 to 2.0. That file is the reason the
    rubric is a tested function and not a guess.


## 2026-09-19

Later the same day, reconciled at `f3c8bfda`: the three-subchannel ruling was
applied to Mindmaker OS as three migrations (subchannels and the question
boundary, identity and the alias ledger, six foreign keys with `_was` columns),
plus a fourth for ordering and gear. The intake runner was specified and the
ruling page template committed under `apps/machine/`. The branch was merged to
`main`; the Vercel Root Directory flip is still owed and production builds fail
until it is made.

The repository was reorganised from a Cannes Lions lead-capture funnel into the
publication's machine. The funnel moved to `parked/cannes-2026/` with a marker
recording why it is kept and where it is going. The publication canon, produced
on 17 and 18 September 2026 and held until now only as Claude artifacts, was
committed: the media kit, the panel and its roster, the commissioning rubric,
the kill list and its executable check, the step plan, the engine spec, the dry
run pitches, and Krish's recorded calibration from the commissioning bench.

Nothing about the live deployment changed. See `NOW.md` for the two ordered
steps that would change it.

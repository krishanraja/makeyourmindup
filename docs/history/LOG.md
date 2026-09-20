---
kill_list_scope: canon
---
# History

Older entries rolled out of `NOW.md`. Newest first.

## 2026-09-20

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

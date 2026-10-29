---
kill_list_scope: canon
repo: krishanraja/makeyourmindup
product: makeyourmindup
as_of: 2026-10-29
head: 45f76de
lifecycle: building
production_url: https://makeyourmindup.ai
state_doc: project-documentation/03_STEP_PLAN.md
history_log: docs/history/LOG.md
truth_files: [project-documentation/01_MEDIA_KIT.md, panel/judges.json, quality/panel/rubric.v1.json, quality/panel/kill-list.v1.json]
authority_order: [venture_formats.mandate in Mindmaker OS, project-documentation/01_MEDIA_KIT.md, panel/PANEL.md, project-documentation/03_STEP_PLAN.md, engine/ENGINE_SPEC.md, AGENTS.md]
steward: https://github.com/krishanraja/ai-harness/blob/main/docs/steward/RUNBOOK.md
never_publish: [the Supabase project ids, any credential or secret name, the cron secret, any reader verdict tied to a person]
---
# makeyourmindup: where it is right now

## What it is

makeyourmindup is a publication that unpicks how AI really works. This repo
hosts its cover at makeyourmindup.ai and holds its editorial canon: the media
kit, the panel and its judges, the rubric and the kill list. content-engine
produces the publication's content and runs that kill list from a pinned copy
(Ruling, Krish, 2026-10-28: "Content-engine produces content for
makeyourmindup.ai, which is hosted at makeyourmindup repo"). The machine this
repo was to hold (watch, score, assemble, dispatch) is superseded by
content-engine's `plan-week`, the one ideation path.

## Who it is for and why it matters for Mindmake

The reader is one person, written to directly: a senior leader in a business
doing roughly five to fifty million pounds who will not admit, to anyone, that
they are not ready for what is happening. Behind them, in ranked order: the
curious professional keeping up without the jargon, the investor deciding what
to fund and what to fix, the founder at a fork.

The channel's first job is top of funnel for mind/make, and the funnel is
indirect. Purpose ranked funnel first while success ranked direct conversion
fifth, which reads as reputation converting on its own timeline. Nobody
optimises this channel for click-through. Its second job is public proof that
the operator opens the machine rather than talking about it. Its third is its
own revenue through paid subscriptions.

## Where it is right now (as of 2026-10-29)

<!-- north-star-state {"week_of": "2026-10-26", "week_target": null, "current": null, "current_as_of": null, "current_source": null, "urgency": 4, "urgency_reason": "not measured yet (no Substack reading)"} --> **North Star number: U4, far behind.** Publication subscribers: not measured yet (no Substack reading), against week one set by the first reading this week, on the way to 50,000 by 27 December 2027. A bold swing every day; work that does not move the number waits.

Lifecycle is `building`. The machine will not be built here: on 2026-10-28
Krish made content-engine the one place ideas are found, judged and made
(`project-documentation/02_REPO_BRIEF.md`, "Who owns what"), and
`engine/ENGINE_SPEC.md` and `engine/INTAKE_RUNNER_SPEC.md` are marked
superseded. What landed on 2026-09-19 and 20 is the canon, which until then
existed only as Claude artifacts from 17 and 18 September and in no repository
at all; content-engine runs its kill list.

**Live.** Since 2026-09-25 `makeyourmindup.ai` redirects to
`www.makeyourmindup.ai`, which serves the cover from `apps/cover/` (`73735f5`,
ruling Krish 2026-09-25: the cover takes the domain, and the Cannes funnel stays
offline until mm-ctrl hosts it). `apps/cover/README.md` says how it deploys and
what regenerates its assets. The brand book and kit, v1.5 on 2026-10-05, are in
`docs/brandbooknew/`, rebuilt by `npm run brand-kit` in `apps/cover`. This
paragraph was corrected on 2026-09-26; it had still described the Cannes funnel
as live.

**Built and not live.** The canon in this repo: the media kit, the panel, the
rubric, the kill list and its executable check, the format specs and the
recorded calibration. The format vocabulary is in the database and enforced
there: three subchannels in `venture_formats` (`kind = subchannel`), a
`general` holding lane, an `either` row, the `format_aliases` rename ledger,
and six foreign keys with `_was` columns (`migrations/2026-09-19-*.sql`,
applied and read back). `intake_items` is live in Mindmaker OS with 623 rows
(the migration lives in control-center, `20260919120000_one_intake.sql`), and
its runner, specified in `engine/INTAKE_RUNNER_SPEC.md`, is superseded and
will not be built.
`apps/machine/slate-page/` holds the phone-first ruling page template and how a
verdict travels; `apps/machine/` has no jobs in it.

**Superseded, not started.** The four jobs. The dry runs gated the machine's
template (`calibration/2026-09-17-dry-run-picks.json` records one of three
subjects picked); with no machine to build here, they gate nothing in this repo.

**Elsewhere, and load bearing.** The strategy machinery runs in
`krishanraja/content-engine` under `apps/control-plane` and stays there: the
extraction to this repo planned on 2026-09-19 is cancelled by the 28 October
ruling.

**Broken, and not ours to fix.** `ANTHROPIC_API_KEY` is rejected in the
content-engine deployment. Every arc card written on 2026-09-18 carries a null
format because none of them was ever composed.

## What changed recently

- 2026-10-28 **content-engine is the one ideation path; this repo keeps the
  cover and the canon.** Ruling (Krish, 2026-10-28): "content-engine, which is
  not a mindmake product, it's a makeyourmindup product", and "Content-engine
  produces content for makeyourmindup.ai, which is hosted at makeyourmindup
  repo". `project-documentation/02_REPO_BRIEF.md` now carries the ownership
  table across content-engine, growth-makeyourmindup and Control Center, and
  `engine/ENGINE_SPEC.md`, `engine/INTAKE_RUNNER_SPEC.md` and Phase 5 of
  `project-documentation/03_STEP_PLAN.md` are marked superseded. content-engine
  vendors `scripts/qa/kill-list.mjs` and `quality/panel/kill-list.v1.json`
  pinned to commit `54cd67d` and runs them before any paid call.
- 2026-10-05 **follow.the.money moves to Mondays and under.the.hood to
  Wednesdays, on the cover and everywhere else.** Decision (Krish,
  2026-10-05): "Let's just make follow the money permanently a monday thing,
  and swap it out." The cover lists and lays out the sections in the new
  order, the brand line is "We follow the money, look under the hood and mind
  the gap.", the Substack kit, media kit, slate page and kill list self-test
  follow, and the brand kit is v1.5 with only the days and the order changed
  (`7733341`). The live table changed with control-center migration
  `20261005170000`; each section keeps its colour, sticker and question.
- 2026-10-04 **The cover gained the panel and lost the commentary under the
  subscribe button.** Ruling (Krish, 2026-10-04): the judges are drawn faces,
  never the felt robot, on one small card found from the staff box (`c5fcd15`,
  `e06e8b9`). The form's status line, the footnote and the asterisk on "Free
  to read" went, and the cover photo took the freed height (`c068dd4`).
- 2026-09-26 **under.the.hood runs every Monday, and the old names are gone from
  the living files.** Rulings (Krish, 2026-09-25 and 2026-09-26): the
  subchannels are follow.the.money and under.the.hood, "every single instance";
  then "Correct the engine's table and anywhere else, its out of date", after
  the cover promised Mon, Wed and Fri. `venture_formats` and `content_cadence`
  read Mondays, 1 a week (control-center migration `20260926150000`). The
  slate picker now fills under.the.hood as a fixed slot like the other two
  (it was a half slot behind a raised bar of 7.5), and prints the standing
  questions the cover prints. The media kit, the intake spec, the dry runs and
  this file use the live names; the retired list in
  `project-documentation/02_REPO_BRIEF.md` had follow.the.money as retired and
  now lists split.the.bill and lift.the.lid instead. The rulings log, the applied
  migrations, the calibration records and the W38 run keep the names they were
  written with.

- 2026-09-24 to 26 **The cover is live, with its brand kit.** Ruling (Krish,
  2026-09-25): the cover takes makeyourmindup.ai, and the Cannes funnel stays
  offline until mm-ctrl hosts it (`73735f5`). `apps/cover` is the front door
  (`7c5572e`): Monday first, the new house rules and the paid-tier copy
  (`b07469b`), every section on one screen (`522e7f3`), the operating-theatre
  cover and the standing robot for the Substack welcome image (`e845606`,
  `a97d922`). The Substack kit, the paid welcome email and the media kit's paid
  prices landed alongside (`b64822a`, `345dc8e`, `3842d31`); the kill list gained
  a `paid_tier` scope that may name CTRL and nothing else (`0849068`) and retired
  the old subchannel names (`b8718b3`); the media kit carries the three questions
  as Krish means them (`78a9859`). Brand book and kit v1.4, with the felt robot
  and its stamps, are in `docs/brandbooknew/` (`a995a0c`).

## What is next and what is waiting on Krish

The single next action is **the canon reconciliation** that the 28 October
plan schedules for its third wave, by 14 November: this repo's canon read
against content-engine as the one ideation path. Until then, content-engine
runs the kill list from a copy pinned to commit `54cd67d`, so a change here to
`scripts/qa/kill-list.mjs` or `quality/panel/kill-list.v1.json` is re-vendored
there in the same week, with the new commit and hashes in its
`vendor/makeyourmindup/kill-list/SOURCE.md`.

Waiting on Krish, none of which a tool should answer:

- **Paste the swapped days into Substack.** The short description, the About
  page and the welcome email in `apps/cover/substack-kit/COPY.md`, and the
  free-tier benefits in `PAID.md`, changed on 2026-10-05; Substack has no API.

- **Move the Cannes funnel to mm-ctrl.** A migration, not a Vercel setting.
  `parked/cannes-2026/PARKED.md` holds the destination and the facts. It has
  been offline since 2026-09-25, when the cover took the domain; its last
  deployment is the cover's rollback (`apps/cover/README.md`).
- **Rotate the credentials** shared in chat on 2026-09-19 plus the five the VPS
  audit named, and fix the rejected `ANTHROPIC_API_KEY` in content-engine. No
  code change substitutes for either.
- **Whether the dry runs still have a job.** They gated the machine's
  template; the machine is superseded. They could still calibrate the panel
  against his picks, or be retired. follow.the.money and mind.the.gap are
  unpicked.
- **The Substack address.** Settled on 2026-10-05: the publication lives at
  `home.makeyourmindup.ai`, a word that covers the videos as well as the
  writing. The cover's Subscribe button and feed point there; Substack's own
  name for it, `mindmakerlive`, stays in its API.
- **The story shape collision.** Five names are retired publication formats in
  the fleet brief and live story shapes in content-engine's `api/_formats.ts`.
  Listed in `project-documentation/02_REPO_BRIEF.md`.
- North Star check (2026-10-29): holds.

## Read next

- `project-documentation/01_MEDIA_KIT.md` settles editorial truth: reader,
  voice, formats, the device, the week, the kill list, and what is still open.
- `panel/PANEL.md` settles who judges the work, on what, and the publish bar.
- `project-documentation/03_STEP_PLAN.md` settles the order of the work and
  which gates block which phase.
- `engine/ENGINE_SPEC.md` records the machine that was superseded on
  2026-10-28, and what it was not allowed to become.
- `project-documentation/02_REPO_BRIEF.md` settles who owns what across the
  repositories, and lists the open conflicts.
- `AGENTS.md` settles the operating rules and where authority stops.

## Do not trust

- `apps/machine/` as a scheduled machine. Its four slate stages have been run
  once, by hand. They reproduced the week they produced until under.the.hood
  became a fixed Monday slot on 2026-09-26; `engine/runs/2026-W38` keeps the
  week as it was picked. Nothing in it runs
  on a schedule yet, and no draft, derivative or send is built by it: the
  derivative plan on each card is a proposal about what should be made, not a
  thing that was made.
- **`parked/cannes-2026/**`** in its entirety, as a description of anything
  current. Parked 2026-09-19. It is a Cannes Lions funnel on a different
  Supabase project and it ranks against a category vocabulary retired on
  2026-08-27. Its own `PARKED.md` says so.
- **Any claim that the publication runs two formats.** Ruling (Krish,
  2026-09-19): it runs **three subchannels**, `follow_the_money`, `mind_the_gap`
  and `under_the_hood`. That reversed the 2026-09-18 retirement of under.the.hood,
  which had never had a row in `venture_formats` at all. Anything in this repo
  or elsewhere still saying two is stale, including a line that stood here
  earlier on 2026-09-19.
- **Any format mandate written into a file in this repo.** There are none, and
  there should be none. `venture_formats.mandate` in Mindmaker OS holds both in
  full prose and a copy drifts while the table does not.

---
kill_list_scope: canon
repo: krishanraja/makeyourmindup
product: makeyourmindup
as_of: 2026-09-26
head: 68deb1ad
lifecycle: building
production_url: https://makeyourmindup.ai
state_doc: project-documentation/03_STEP_PLAN.md
history_log: docs/history/LOG.md
truth_files: [project-documentation/01_MEDIA_KIT.md, panel/judges.json, quality/panel/rubric.v1.json, quality/panel/kill-list.v1.json]
authority_order: [venture_formats.mandate in Mindmaker OS, project-documentation/01_MEDIA_KIT.md, panel/PANEL.md, project-documentation/03_STEP_PLAN.md, engine/ENGINE_SPEC.md, AGENTS.md]
steward: https://github.com/krishanraja/control-center/blob/main/docs/steward/RUNBOOK.md
never_publish: [the Supabase project ids, any credential or secret name, the cron secret, any reader verdict tied to a person]
---
# makeyourmindup: where it is right now

## What it is

makeyourmindup is a publication that unpicks how AI really works, and this repo
is the machine behind it. The machine watches what moved, scores it against a
rubric, assembles a brief with its evidence, and dispatches the right package to
the right place at the right hour. It holds logic and schedule and it holds no
screens: Control Center holds every pixel, and if the machine needs to say
something it writes a row Control Center reads.

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

## Where it is right now (as of 2026-09-26)

Lifecycle is `building`. The machine does not exist yet. What landed on
2026-09-19 and 20 is the canon it will be built from, which until now existed only as Claude
artifacts from 17 and 18 September and in no repository at all.

**Live.** Since 2026-09-25 `makeyourmindup.ai` redirects to
`www.makeyourmindup.ai`, which serves the cover from `apps/cover/` (`73735f5`,
ruling Krish 2026-09-25: the cover takes the domain, and the Cannes funnel stays
offline until mm-ctrl hosts it). `apps/cover/README.md` says how it deploys and
what regenerates its assets. The brand book and kit, v1.4 on 2026-09-26, are in
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
its runner is specified in `engine/INTAKE_RUNNER_SPEC.md` but not built.
`apps/machine/slate-page/` holds the phone-first ruling page template and how a
verdict travels; `apps/machine/` has no jobs in it.

**Not started.** The four jobs and the dry runs. The dry runs are
the gate: `calibration/2026-09-17-dry-run-picks.json` records one of three
subjects picked, so the template is not fixed and anything built against it now
is invalidated when it is.

**Elsewhere, and load bearing.** The strategy machinery this repo is meant to
own currently runs in `krishanraja/content-engine` under `apps/control-plane`,
which is about three quarters strategy and desk code by route count and fifteen
of sixteen crons. The extraction is planned, not done.

**Broken, and not ours to fix.** `ANTHROPIC_API_KEY` is rejected in the
content-engine deployment. Every arc card written on 2026-09-18 carries a null
format because none of them was ever composed.

## What changed recently

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
- 2026-09-20 **The first slate exists, and the rules that picked it are in this
  repo rather than in a workflow that has to be re-run to be read.** 216
  candidates cleared the intake gates, 210 were scored, 81 cleared the 6.5 bar,
  and nine cards were published: one pick and two alternates for each of the
  three subchannels. 30 more rows say why the machine would not decide, 14 as
  named hand-offs and 16 as `claim_not_in_source`, a reason slug added the same
  day because that refusal recurred sixteen times and had no name. All 39 rows
  are in `public.suggestions` under `run_id = 'first-slate:2026-W38'`, every one
  on the `propose` rung. The selection is four scripts in
  `apps/machine/slate-page`, each reading a file and writing a file, so a stage
  can be re-run without the ones before it. Every rule is stated and travels
  with the row in `producer.selection_rules`. `engine/runs/2026-W38` keeps what
  the week was built from, and running the four stages against it reproduces
  the published page byte for byte until the rules changed on 2026-09-26.
  under.the.hood cleared its raised bar of 7.5 with 7.83, the closest call on
  the slate. `daf27e4`.

## What is next and what is waiting on Krish

The single next action is **the dry runs**, because they fix the template and
every pipeline built before them is thrown away when they land. One subject of
three is picked.

Waiting on Krish, none of which a tool should answer:

- **Move the Cannes funnel to mm-ctrl.** A migration, not a Vercel setting.
  `parked/cannes-2026/PARKED.md` holds the destination and the facts. It has
  been offline since 2026-09-25, when the cover took the domain; its last
  deployment is the cover's rollback (`apps/cover/README.md`).
- **Rotate the credentials** shared in chat on 2026-09-19 plus the five the VPS
  audit named, and fix the rejected `ANTHROPIC_API_KEY` in content-engine. No
  code change substitutes for either.
- **Build the intake runner** from `engine/INTAKE_RUNNER_SPEC.md`. The data
  model, the kill list and the rubric exist; the pure steps can be built and
  tested on fixtures now; the model call and the slate write wait on the dry
  runs by the step plan.
- **Pick the remaining two dry run subjects.** follow.the.money and mind.the.gap
  are unpicked.
- **The apex.** The cover took `makeyourmindup.ai` on 2026-09-25 and the
  Substack keeps its own address, so what is left is whether the publication
  later moves to `read.makeyourmindup.ai`. Not decided.
- **The story shape collision.** Five names are retired publication formats in
  the fleet brief and live story shapes in content-engine's `api/_formats.ts`.
  Listed in `project-documentation/02_REPO_BRIEF.md`.

## Read next

- `project-documentation/01_MEDIA_KIT.md` settles editorial truth: reader,
  voice, formats, the device, the week, the kill list, and what is still open.
- `panel/PANEL.md` settles who judges the work, on what, and the publish bar.
- `project-documentation/03_STEP_PLAN.md` settles the order of the work and
  which gates block which phase.
- `engine/ENGINE_SPEC.md` settles what the machine is and, more usefully, what
  it is not allowed to become.
- `project-documentation/02_REPO_BRIEF.md` settles who builds what across the
  three repositories, and lists the open conflicts.
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

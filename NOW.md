---
kill_list_scope: canon
repo: krishanraja/makeyourmindup
product: makeyourmindup
as_of: 2026-09-20
head: f478e312
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

## Where it is right now (as of 2026-09-20)

Lifecycle is `building`. The machine does not exist yet. What landed today is
the canon it will be built from, which until now existed only as Claude
artifacts from 17 and 18 September and in no repository at all.

**Live.** `makeyourmindup.ai` and `www.makeyourmindup.ai` serve the Cannes Lions
2026 lead-capture funnel from the last READY production build (commit
`01828ab`). That code now sits in `parked/cannes-2026/` and is marked not live
work. The first of the two ordered flip steps is done: this branch is merged to
`main`. The second is not: the Vercel project's Root Directory is still the repo
root, so every production build since the merge fails with "No Next.js version
detected" and the site keeps serving the old build. A failed build never
replaces a live one, so nothing has changed for a visitor. Setting Root
Directory to `parked/cannes-2026` is one project setting and needs an account
that can update the project; the connector used on 2026-09-19 could not.

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

**Not started.** The four jobs, the cover, and the dry runs. The dry runs are
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
  the published page byte for byte. lift.the.lid cleared its raised bar of 7.5
  with 7.83, the closest call on the slate. `daf27e4`.
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

## What is next and what is waiting on Krish

The single next action is **the dry runs**, because they fix the template and
every pipeline built before them is thrown away when they land. One subject of
three is picked.

Waiting on Krish, none of which a tool should answer:

- **Move the Cannes funnel to mm-ctrl.** A migration, not a Vercel setting.
  `parked/cannes-2026/PARKED.md` holds the destination and the facts. Until it
  moves, do NOTHING to the Vercel project: "set Root Directory to
  `parked/cannes-2026`" was recommended here on 2026-09-19 and withdrawn on
  2026-09-20 (ruling, Krish: it moves to mm-ctrl when ready). The failing builds
  are cosmetic. Checked 2026-09-20: the site returns HTTP 200 and serves the
  funnel, because a failed build never replaces a live one.
- **Rotate the credentials** shared in chat on 2026-09-19 plus the five the VPS
  audit named, and fix the rejected `ANTHROPIC_API_KEY` in content-engine. No
  code change substitutes for either.
- **Build the intake runner** from `engine/INTAKE_RUNNER_SPEC.md`. The data
  model, the kill list and the rubric exist; the pure steps can be built and
  tested on fixtures now; the model call and the slate write wait on the dry
  runs by the step plan.
- **Pick the remaining two dry run subjects.** split.the.bill and mind.the.gap
  are unpicked.
- **The apex.** A Substack custom domain takes the whole host, so the cover and
  the publication cannot share `makeyourmindup.ai`. The recommendation is cover
  on the apex, publication on `read.`. Not decided.
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
  once, by hand, and they reproduce the week they produced. Nothing in it runs
  on a schedule yet, and no draft, derivative or send is built by it: the
  derivative plan on each card is a proposal about what should be made, not a
  thing that was made.
- **`parked/cannes-2026/**`** in its entirety, as a description of anything
  current. Parked 2026-09-19. It is a Cannes Lions funnel on a different
  Supabase project and it ranks against a category vocabulary retired on
  2026-08-27. Its own `PARKED.md` says so.
- **Any claim that the publication runs two formats.** Ruling (Krish,
  2026-09-19): it runs **three subchannels**, `split_the_bill`, `mind_the_gap`
  and `lift_the_lid`. That reversed the 2026-09-18 retirement of lift.the.lid,
  which had never had a row in `venture_formats` at all. Anything in this repo
  or elsewhere still saying two is stale, including a line that stood here
  earlier on 2026-09-19.
- **Any format mandate written into a file in this repo.** There are none, and
  there should be none. `venture_formats.mandate` in Mindmaker OS holds both in
  full prose and a copy drifts while the table does not.

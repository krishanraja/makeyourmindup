---
kill_list_scope: canon
repo: krishanraja/makeyourmindup
product: makeyourmindup
as_of: 2026-09-19
head: 01828ab0
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

## Where it is right now (as of 2026-09-19)

Lifecycle is `building`. The machine does not exist yet. What landed today is
the canon it will be built from, which until now existed only as Claude
artifacts from 17 and 18 September and in no repository at all.

**Live.** `makeyourmindup.ai` and `www.makeyourmindup.ai` serve the Cannes Lions
2026 lead-capture funnel, from the Vercel project `makeyourmindup`, production
deployment READY. That code now sits in `parked/cannes-2026/` and is marked not
live work. **Parking the folder did not move the deployment.** Vercel builds
production from `main`, and this change is on a branch, so nothing has changed
for a visitor. The flip is two ordered steps and neither has been taken: merge
this branch to `main`, then set the project's Root Directory to
`parked/cannes-2026`. Doing either alone breaks the next production build.

**Built and not live.** The canon in this repo: the media kit, the panel, the
rubric, the kill list and its executable check, the format specs and the
recorded calibration. `apps/machine/` is a scaffold with no jobs in it.

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

## What is next and what is waiting on Krish

The single next action is **the dry runs**, because they fix the template and
every pipeline built before them is thrown away when they land. One subject of
three is picked.

Waiting on Krish, none of which a tool should answer:

- **Rotate the credentials** shared in chat on 2026-09-19, and fix the rejected
  `ANTHROPIC_API_KEY` in content-engine. No code change substitutes for either.
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

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

**No name, in the repository and not yet on the live site.** Since
2026-10-29 the kill list vetoes his name, its spellings and his handles
(`personal_name`), and the cover and Substack kit speak as "we", with no
byline, Person node, founder, "Written by" line or link to his own accounts;
the cover's metadata is Organization JSON-LD and `llms.txt` cites the
publication. The cover shows Substack, YouTube and Instagram only: TikTok and
X have no tile, because their only accounts are his own. None of this is
deployed: the live site and Substack still name him (the old copy, the
author, footer and sender settings, and the `krish-*.jpg` photo addresses)
until he says yes to redeploying the cover and changes those settings.

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
subjects picked); they still settle three decisions the media kit marks open
(a verdict in the written piece, what is fixed in the template, a name per
format on shorts); whether they keep that job now that content-engine makes
the pieces is Krish's (below).

**Elsewhere, and load bearing.** The strategy machinery runs in
`krishanraja/content-engine` under `apps/control-plane` and stays there: the
extraction to this repo planned on 2026-09-19 is cancelled by the 28 October
ruling.

**Broken, and not ours to fix.** `ANTHROPIC_API_KEY` is rejected in the
content-engine deployment. Every arc card written on 2026-09-18 carries a null
format because none of them was ever composed.

- a Claude Code SessionEnd hook (`scripts/taste_backstop.py`, from growth-makeyourmindup, tagged `publication` (the venture_registry slug) and `krishanraja/makeyourmindup`) keeps only Krish's own lines that a local filter flags as a correction or rejection, scrubbed of secrets, in the ignored `.scratch/taste/backstop.jsonl`; it sends nothing. (2026-10-29)
- `docs/decisions/2026-10-29-wave-3-for-krish.md` holds what waits on Krish here: the cover redeploy (already live through PR #29's merge; the photo-file rename is PR #32), the dry runs (calibrate or retire, recommended retire), the media kit's three dry-run decisions, the TikTok and X tiles (no tiles live; the handle version needs new publication accounts), and a Substack settings checklist read live on 2026-10-29. (2026-10-29)
- NOW.md is 11962 bytes under a 16 KB cap that `npm test` and the new `Check` workflow enforce (`scripts/qa/now-size.mjs`); its four "What changed recently" entries from 2026-09-24 to 2026-10-05 now sit verbatim in `docs/history/LOG.md`. (2026-10-29)
- `apps/cover/vercel.json` carries `ignoreCommand: git diff --quiet HEAD^ HEAD -- .`, so once merged, Vercel builds production only when a push changes `apps/cover`; replayed on past commits it skips the AGENTS.md-only canon sync (`7402394`) and builds the tiles change (`a1cd10b`). (2026-10-29)
- the cover's photo files are `editor-*.jpg`, so once deployed no served address names him; the build's `llms.txt` and JSON-LD name the publication only (verified in `.next/server/app`). The live site already serves the no-name copy: merging PR #29 deployed production at `8fbe692` on 2026-10-29, because every push to main deploys the cover. (2026-10-29)
- `npm run gate:canon` passes (12 files, 0 vetoes); AGENTS.md now opens with its `kill_list_scope: canon` front matter, above the hand-added North Star block, so the kill list reads it as canon again. (2026-10-29)

## What changed recently

- 2026-10-29 Krish chose "Local file, runner posts" on 29 October 2026, so the runner that holds the Control Center key posts them to `taste_reports`, not the session.
- 2026-10-29 every merge to main deploys production, so even docs-only PRs here republish the cover; the pack offers an ignored build step for him to decide.
- 2026-10-29 NOW.md had grown to 14926 bytes with no limit; the cap is growth-makeyourmindup's figure, so the chain's two NOW.md files share one rule.
- 2026-10-29 NOW.md's "not yet on the live site" was stale; the redeploy happened through the merge of PR #29, and the photo addresses are the one live residual.
- 2026-10-29 the North Star block had been prepended by hand on 2026-10-18 above the front matter; ai-harness owns no writer for that block (its proposal of 2026-10-22 says so), so the fix is here, not in the harness renderer.
- 2026-10-29 **Nothing in this repository's public copy names him.** Ruling
  (Krish, 2026-10-28): "Remember, no content refers to Krish, ever." He picked
  "We" for the article's voice, "No, personal stays personal" for his own
  accounts, "Drop it" for the face in the byline and "Yes, block it" for
  other people called Krish. The kill list's `personal_name` veto
  (`dfc9b75`, `aed9b26`), the cover and Substack kit in "we" (`ce9713b`), the
  media kit's publication byline (`f655c62`), and no TikTok or X tile
  (`a1cd10b`). content-engine re-vendored the kill list at `c13d8e2`. Not
  deployed.
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

## What is next and what is waiting on Krish

- Next (2026-10-29): the runner on his home computer reads `.scratch/taste/backstop.jsonl` here as it does in growth-makeyourmindup.
The single next action is **the canon reconciliation** that the 28 October
plan schedules for its third wave, by 14 November: this repo's canon read
against content-engine as the one ideation path. Until then, content-engine
runs the kill list from a copy pinned to commit `c13d8e2` (re-vendored on
2026-10-29 with the `personal_name` veto), so a change here to
`scripts/qa/kill-list.mjs` or `quality/panel/kill-list.v1.json` is re-vendored
there in the same week, with the new commit and hashes in its
`vendor/makeyourmindup/kill-list/SOURCE.md`.

Waiting on Krish, none of which a tool should answer:

- **Redeploy makeyourmindup.ai, and change Substack's byline, author,
  copyright, footer, sender and second admin settings.** Until then the live
  cover and Substack still name him; the repository no longer does.
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

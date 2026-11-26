---
kill_list_scope: canon
repo: krishanraja/makeyourmindup
product: makeyourmindup
as_of: 2026-11-26
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

## Where it is right now (as of 2026-11-26)

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
what regenerates its assets. The v5 brand kit is
`brand-kit/makeyourmindup-brand-kit.zip`, built by `python
scripts/brand-kit-v5/build.py --content-engine <checkout>`. This
paragraph was corrected on 2026-09-26; it had still described the Cannes funnel
as live.

**No name in the repository or on the cover; Substack still names him.**
Since 2026-10-29 the kill list vetoes his name, its spellings and his handles
(`personal_name`), and the cover and Substack kit speak as "we", with no
byline, Person node, founder, "Written by" line or link to his own accounts;
the cover's metadata is Organization JSON-LD and `llms.txt` cites the
publication. The cover shows Substack, YouTube and Instagram only: TikTok and
X have no tile, because their only accounts are his own. The live cover is
deployed that way (read live on 2026-11-12: no name anywhere on the page, the
photos served as `editor-*.jpg`). Substack's own pages still name him in their
title, author and contributor until he changes its settings.

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

**Not ours to fix.** Every arc card written on 2026-09-18 carries a null
format because none of them was ever composed. The content-engine key once
reported rejected here works: its fact gate and judges metered hundreds of
Anthropic calls with none failed from 9 to 12 November (`meter_daily`).

- The brand-kit zip carries Drive's current Channel art note (00 WHICH FILE GOES WHERE), which now records that the Library matches (content-engine #1002) and the two Substack files are confirmed. (2026-11-26)
- The brand kit draws no art of its own: scripts/brand-kit-v5/build.py packages Drive's Channel art (the v5 Library's renders) byte for byte against its MANIFEST.sha256, and logos/ ships only the icon, the wordmark, the horizontal lockup and S3h, on ink. The on-light and stacked lockups are retired. (2026-11-26)
- AGENTS.md and project-documentation/02_REPO_BRIEF.md now carry Krish's ruling of 2026-11-26 ("I want everything to be one harmonious engine"): content-engine makes every asset, the derived posts and captions included, and growth-makeyourmindup posts, schedules, distributes, measures and grows subscribers, making no assets. (2026-11-26)
- NOW.md is trimmed to leave room for the notes folding in from #51, #55, #58 and #61: its eight oldest dated entries now sit verbatim in docs/history/LOG.md. (2026-11-26)
- brand-kit/makeyourmindup-brand-kit.zip is the v5 kit, built by scripts/brand-kit-v5/build.py from content-engine's v5 marks and fonts: the icon and lockups, Anton, Archivo, Fraunces and DM Mono, the v5 colours, and every profile image and its copy under Channel art. Krish's PC unpacks it into Drive's 1 Brand kit (permanent). The v1.5 zips in docs/brandbooknew are removed. (2026-11-26)
- Every page shares a generated card in the house design: ink ground, the v5 wordmark, a mint label, the Fraunces headline, the lead photo when there is one and the motto. With no published edition the homepage card reads "AI news for the creative industries, every morning." The v5 icons and manifest stay as they were. (2026-11-26)
- The Edition cover scrolls every constituent's delayed close in a live-moving ticker, filters it by desk and animates from the lead to the sign-up, with a reduced-motion fallback. Chrome runs at 1280 and 390 px pass the layout audit, cut CLS to about 0 from 0.042 and 0.045, and keep LCP within noise. (2026-11-26)
- makeyourmindup.ai has permanent dated edition pages, six subsector desks, a Creative 24 dataset page, an edition archive, sitemaps, a news sitemap, an Edition RSS feed and llms-full.txt, with per-page titles, canonicals and structured data. The build, 37 cover tests, the phone layout audit and a 9-route overflow audit at 320, 390 and 1280 px pass. The homepage keeps its dated fallback edition when the hub has none. (2026-11-26)

## What changed recently

- 2026-11-26 The 26 Nov kit had drawn its own profile set, which broke Krish's 25 Nov rulings (banners with text, the retired stacked lockup, an off-ink wordmark); the channels session caught it and rebuilt Channel art from the Library.
- 2026-11-26 Krish, 26 Nov 2026: "I wanted the makeyourmindup square", "Square word mark with the icon as the O"; the bare icon had been used as the avatar.
- 2026-11-26 apps/cover/substack-kit (images removed, README, COPY.md, email-signature), apps/cover/public/brand/email-signature-banner.png, apps/cover/content/site.json, scripts/brand-kit-v5/build.py, brand-kit/makeyourmindup-brand-kit.zip, brand-kit/.gitignore, NOW.md.
- 2026-11-26 The cover now gives readers a reason to come back every morning and a direct path to subscribe; its effect on subscribers is not measured yet.
- 2026-11-25 apps/cover/substack-kit/COPY.md (About page and welcome email), apps/cover/components/edition/Edition.tsx (subscribe box), apps/cover/tests/promise.test.ts (refuses three emails a week, the Monday, Wednesday and Friday email and one email a morning).
- 2026-11-26 Krish ruled on 2026-11-26 that content-engine makes every asset (derived posts and captions included) and growth-makeyourmindup only grows the channel; AGENTS.md and the repo brief now say so.
- 2026-11-19 The paid tier's reusable files now exist (Ruling, Krish, 2026-11-19: files on a code-gated members page).
- 2026-11-19 Krish ruled the publication always has good humour, welcome emails included, and set what each paid plan gets (2026-11-19).

## What is next and what is waiting on Krish


- Next (2026-11-26): Package again whenever Drive's Channel art changes.
Waiting on Krish, none of which a tool should answer:

- **Change Substack's byline, author, copyright, footer, sender and second
  admin settings.** The cover is already redeployed and names nobody; until
  then Substack's pages still name him.
- **Paste the swapped days into Substack.** The short description, the About
  page and the welcome email in `apps/cover/substack-kit/COPY.md`, and the
  free-tier benefits in `PAID.md`, changed on 2026-10-05; Substack has no API.

- **Move the Cannes funnel to mm-ctrl.** A migration, not a Vercel setting.
  `parked/cannes-2026/PARKED.md` holds the destination and the facts. It has
  been offline since 2026-09-25, when the cover took the domain; its last
  deployment is the cover's rollback (`apps/cover/README.md`).
- **Rotate the credentials** shared in chat on 2026-09-19 plus the five the VPS
  audit named. No code change substitutes for it.
- **Whether the dry runs still have a job.** They gated the machine's
  template; the machine is superseded. They could still calibrate the panel
  against his picks, or be retired. follow.the.money and mind.the.gap are
  unpicked.
- **The story shape collision.** Five names are retired publication formats in
  the fleet brief and live story shapes in content-engine's `api/_formats.ts`.
  Listed in `project-documentation/02_REPO_BRIEF.md`.
- North Star check (2026-11-26): holds.

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

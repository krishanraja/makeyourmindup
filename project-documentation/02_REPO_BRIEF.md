---
kill_list_scope: canon
---
# Who builds what, and what is still in conflict

## The three systems

| Repo | Job | Owns |
|---|---|---|
| **makeyourmindup** (here) | Creative strategy | Watch, score, assemble, dispatch. The canon, the rubric, the panel, the kill list, the cover. |
| **control-center** | The desk | Every pixel. The Sunday board, the week view, the verdict archive, the themes tracker, the metrics, the bad-week switch. |
| **content-engine** | Production | The renderer, the runner, the studio control plane. An approved brief becomes artefacts. |

In Krish's words: *"content engine should hold stable machinery, control center
holds the UI, and Claude or Codex should hold anything that is unreliable in a
custom UI or expensive via API."*

## Where the boundary actually is today

The split above is the target, not the state. As of 2026-09-19:

- `content-engine/apps/control-plane` is roughly **three quarters strategy and
  desk code by route count, and fifteen of its sixteen crons are strategy**.
  Only `runner_watch` is production.
- The seam between strategy and production is a **single file**,
  `api/content-ideas/[id]/production-brief.ts`, plus one contract,
  `ProductionBriefV1`. That is unusually good news: the extraction follows a
  seam that already exists.
- The cleanest excisable unit is the **arc and shift chain**. `_trendGate.ts`,
  `_cardLint.ts`, `_arcScore.ts`, `_lenses.ts` and `_formats.ts` are pure
  modules with no I/O, and nothing in `packages/` or `apps/{renderer,runner}`
  references any of them.
- The **AEO and Growth lane** in the engine belongs to none of the three. It
  serves a fourth repo and reads sales and SEO tables.

## Retired names, complete

Built with AI, The Money of AI, Mindmaker, Mindmaker Live, Techonomic,
The Builder Economy, inspect.the.build, follow.the.money,
Newsflash, Money Trace, The Artifact, First Version, The Third Why.

`makeyourmindup` is **not** retired. It is the publication's own name as of the
17 September 2026 relaunch, and it previously meant the CTRL lead-magnet
surface. A tool that treats it as retired will reject the one name that is now
correct.

## Open conflicts. None of these is a tool's to close.

**1. The story shape collision.** Five of the retired names above are
*simultaneously* live entries in a different vocabulary: the nine story shapes
in `content-engine/apps/control-plane/api/_formats.ts`, whose own header says it
records *"form, not subject"*. `The Artifact`, `Follow the Money`, `Money
Trace`, `First Version` and `The Third Why` are all in both lists, and `The
Artifact` was itself the 2026-08-29 rename **away** from a retired name. Two
vocabularies collide on five strings. `control-center/scripts/check-content-taxonomy.mts`
deliberately does not enforce those five and says so.

**2. `arc_cards.format` is a story shape, not a format slug.** The fleet brief
calls it a dead taxonomy that should carry `split_the_bill` or `mind_the_gap`.
It should not. Its eight non-null values were written in one batch on
2026-08-26, they appear on both lanes, and writing a publication slug into it
merges two deliberately separate vocabularies. Routing needs a separate column
or the lane, not this one.

**3. Three scoring systems, live at once.** `arc_cards.components` asks whether
an arc is real. `quality/panel/rubric.v1.json` asks whether an idea is worth a
slot. `panel/judges.json` asks whether the work is good enough to ship.
**Three different questions.** Run them in order. Never average them.

**4. The apex domain.** A Substack custom domain takes the whole host, so the
cover and the publication cannot share `makeyourmindup.ai`. The recommendation
is cover on the apex and publication on `read.`, and the counterpoint is real:
every link ever shared then points at the subdomain. Not decided, and the CTRL
naming gate is open alongside it.

## Fleet-wide staleness

The 17 September relaunch reached no sibling repository. A tool reading one of
them in good faith produces retired-brand work, and the deterministic gate then
blocks that work without explaining where it came from.

| Where | What | State as of 2026-09-19 |
|---|---|---|
| `control-center` | Eight labels still carry the two retired publication names, in `VENTURE_FORMATS`, `LANES`, `FACTORY_CHANNELS` and `PUBLIC_SERIES` | **reported**, by `check-content-taxonomy.mts` |
| `control-center/NOW.md` | "the publication with its Paid and Built formats"; "Independent Money of AI and Built with AI lenses" | stale |
| `content-engine` repo description and `NOW.md` | names both retired formats | stale |
| Substack About page and social preview | themindmaker.ai, 30 Under 30, and a retired wordmark on a live public surface | stale, and public |

**How to fix it.** Not by hand and not from one file. Route the corrections
through `harness-maintainer` with **17 September 2026** as the finding date.
Renaming the storage keys is a coordinated change, not a find and replace:
`paid`, `built`, `money_of_ai` and `built_with_ai` are Supabase CHECK constraint
values and a wire contract with the n8n content factory, which switches on
`target_channel`. Changing one side alone drops a piece into the factory's
fallback branch silently.

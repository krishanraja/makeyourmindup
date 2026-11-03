---
kill_list_scope: canon
---
# makeyourmindup

The cover and the editorial canon of the publication. content-engine produces
the publication's content and runs this repository's kill list; the machine
this repository was to hold (watch, score, assemble, dispatch) is superseded
(Ruling, Krish, 2026-10-28: "Content-engine produces content for
makeyourmindup.ai, which is hosted at makeyourmindup repo").

The one public page this repo owns is the cover, in `apps/cover/`. The
publication's weekly content calendar is content-engine's publish board at
content.krishraja.com, which keeps itself current, and Krish approves ideas and
publish-ready pieces in Control Center's Content tab.

## Start here

1. `NOW.md` for where it actually is, and what is waiting on Krish.
2. `AGENTS.md` for the operating rules and where authority stops.
3. `project-documentation/01_MEDIA_KIT.md` for editorial truth.

## Run the gate

```
node scripts/qa/kill-list.mjs <path> [...]
node scripts/qa/kill-list.mjs --stdin < piece.md
npm test
```

The kill list is deterministic: no model calls, no secrets, no network. **Run it
before any model call.** Spending a draft-gate token on an em dash is waste.

## What is where

| Path | What |
|---|---|
| `project-documentation/` | Media kit, repo brief, step plan |
| `panel/` | The ten judges, the publish bar, the machine-readable roster |
| `quality/panel/` | The commissioning rubric and the kill list, as data |
| `scripts/qa/` | The kill list and its self-test |
| `engine/` | What the machine is, and what it may not become |
| `calibration/` | Krish's recorded votes and weights. The only calibration there is |
| `dry-runs/` | The pitches, and the guard on their unverified numbers |
| `apps/machine/` | Superseded scaffold; will not be built (Ruling, Krish, 2026-10-28) |
| `apps/cover/` | **The cover**, the publication's front door at makeyourmindup.ai. The only screen in this repo, and it is a public page, never a dashboard. See its own `README.md` |
| `parked/cannes-2026/` | **Not live work.** A finished Cannes Lions funnel, kept so nobody revives it by accident. See its own `PARKED.md` |

## Format mandates are not in this repo

They live in `venture_formats.mandate` in Mindmaker OS, in full prose. A
repository file that restates a mandate is a copy, and the copy drifts while the
table does not.

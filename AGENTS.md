---
kill_list_scope: canon
---
<!-- north-star:start -->
## North Star: read it first, every session

This repository's North Star is [`docs/NORTH_STAR.md`](docs/NORTH_STAR.md): an ambition Krish set that is not reached yet.

- Read it before any work, every session.
- Before you start, say which part of it the task moves. If it moves nothing, say so first and let Krish decide.
- Prefer the work that moves it furthest, and close by noting what moved.
- Check the North Star number and its urgency (U1 to U5) on the first line under "Where it is right now" in `NOW.md`, and push at the intensity [the harness contract](https://github.com/krishanraja/ai-harness/blob/main/contract/north-star-metric.md) sets for that level. Update it whenever you can measure it; a number nobody measures is U4.
- Only Krish changes it.
<!-- north-star:end -->

# Operating rules for this repository

This repo hosts the cover site of the publication `makeyourmindup` and its
editorial canon: the kill list and the judges. content-engine makes the
publication from it. Read `NOW.md` first. Editorial truth is
`project-documentation/01_MEDIA_KIT.md`. Format mandates are never in this
repo: they live in `venture_formats.mandate` in Mindmaker OS, in full prose,
because a copy drifts and the table does not.

## No branch is ever left unmerged (Ruling, Krish, 2026-11-26)

Krish, 26 Nov 2026: "ensure stray branches may NEVER ever be left unmerged". Every session reads the open pull
requests before it starts (), so it never works blind to unmerged work, and ends with its
branch either merged (a ready pull request, never a draft left behind) or deleted. The stray guard
(, every hour) enforces it: it deletes merged branches and branches whose pull
request was closed, opens a pull request for any branch idle six hours without one, marks drafts idle a day ready,
merges every ready pull request whose CI is green, and lists whatever it cannot land in one issue, "Stray branches and
pull requests". A red pull request on that list is fixed or closed the same day.

## The four systems, and where this one stops

Ruling (Krish, 2026-10-28): "Content-engine produces content for
makeyourmindup.ai, which is hosted at makeyourmindup repo". content-engine's
`plan-week` is the one ideation path. This repo builds no Watch, Score,
Assemble or Dispatch machine and no intake runner (`apps/machine/` is a
superseded scaffold and will not be built). The full split is
`project-documentation/02_REPO_BRIEF.md`, "Who owns what".

| Repo | Job |
|---|---|
| **makeyourmindup** (here) | The cover site and the editorial canon (kill list, judges), which content-engine runs from a pinned copy. |
| **content-engine** | Ideation (`plan-week`), every asset (the article, both cuts, thumbnails and covers, and every derived post: carousels, memes, Notes images and copy, the off-day posts, captions and titles per channel, the weekly edition package), handed to Growth finished and approved with captions in the piece manifest (Ruling, Krish, 2026-11-26: "I want everything to be one harmonious engine"), and the publish board's view, the weekly content calendar, drawn live in Control Centre's Content tab (Ruling, Krish, 2026-11-11: one live board, in Control Centre; the old board is a read-only archive); content.krishraja.com/board is the read-only archive, and content-engine's `docs/PUBLISH_BOARDS.md` says how to use the board. |
| **Growth-MakeYourMindUp** | Grows the channel: posts content-engine's finished assets through its approved route, schedules them in Buffer, places the weekly edition on Substack, distributes, runs the subscribe route, measures and learns, owns `mix.json` and experiments, and reports performance back. It makes no assets (Ruling, Krish, 2026-11-26). |
| **control-center** | Krish's approvals, on the one live publish board in its Content tab: each idea ends in one of five outcomes (Approve, File for later, Reject and learn, Save as a trend, Improve), and only his Approve puts an idea on a day (Ruling, Krish, 2026-11-11). Every press goes through content-engine's routes. |

## The rule that governs every design decision

**Two to four hours of Krish's time per signature piece.** If a workflow adds
to that number it is wrong regardless of how good its output is. Apply that
test before the quality test, not after.

## Absolute, enforced by veto

- **No preaching.** No closing moral, no lesson for leaders, no sentence telling
  the reader what to conclude, no final line reaching for significance, no
  sentence that would work on a conference slide. Unappealable. One sermon
  sentence blocks a piece. In Krish's words: *"we should not sound preachy or
  like we are trying to persuade anyone of anything like a missionary in
  content. thought leadership should do that job."*
- **No em dashes anywhere**, including code, on-screen text and commit messages.
  British English throughout.
- **No load-bearing number without a named producer.** The producer is whoever
  made the number, never the outlet that repeated it.

## Never

- Invent a subscriber number, a customer outcome, a price or an engagement
  figure.
- Use a retired name. The complete list is in
  `project-documentation/02_REPO_BRIEF.md`.
- Put Mindmake or CTRL inside an editorial piece. CTRL beta access in the paid
  tier is the only permitted connection.
- Close a decision the media kit marks OPEN.
- Overrule a panel veto by out-voting it. A veto clears by fixing the work.
- Run only the friendly judges. The gate runs whole or not at all.
- Let a judge author. Naming the failure and its location is the job. Supplying
  the fix is a separate role, because a judge who writes the line then scores it
  is scoring themselves.
- Feed Krish's approvals into the scorer. Ranking candidates by how much they
  resemble what he already said yes to is the anti-echo rule's exact
  prohibition, and the failure is invisible: a mirror still returns seven cards
  a week.

## Building

- **Rules before plumbing.** Integrations are the part most likely to change.
  This repo builds no pipeline; content-engine does (Ruling, Krish, 2026-10-28).
- **Run the kill list before any model call.** Spending a draft-gate token on an
  em dash is waste. `node scripts/qa/kill-list.mjs <paths>`.
- **A canon document declares `kill_list_scope: canon`** in its front matter,
  because it names retired brands in order to forbid them. A gate that blocks
  its own rulebook does not survive contact with a deadline.
- Commit author is `Krish Raja <hello@krishraja.com>`. When Krish overrules a
  decision, record it in the commit body as
  `Ruling (Krish, YYYY-MM-DD): the ruling, in one line`.

## Who approves

Only Krish. The panel advises and blocks and never approves. A piece that
clears the publish bar is eligible, not approved.

## Google Drive

Content, films and sales material live in Krish's Drive under `04_Content`.
The map of what goes where is `docs/DRIVE.md` in `krishanraja/content-engine`,
with the same map as `READ ME FIRST - what goes where.txt` at the top of
`04_Content`. Sales material goes in `04_Content > Sales Materials`; one-off
main-channel video scripts in `04_Content > One Off Content Ideas`; brand films
in `04_Content > Films`. `Video Engine` and `makeyourmindup` are read by path by
the home computers: never move or rename them, or any folder above them. Read
the map before putting anything in Drive or tidying a folder.

<!-- krish-canon:start release=v2026.11.25.2 sha=1f90861ebd80 rendered=2026-11-26 -->
## Krish canon

Rendered from `krishanraja/ai-harness`; the start marker names the last release that changed this block, not the latest release. Nothing inside these
markers is hand-maintained: an edit here is detected and proposed back to the canon,
never silently overwritten, and never lost. This sync preserves all other text.
Separately approved repository administration owns only its declared regions and context file.

**Precedence.** This repository's own rules outrank the canon on repository matters:
structure, naming, voice, stamps, archive location, test and build commands. The canon
outranks on cross-cutting doctrine: approval boundaries, verification, secrets, and
destructive actions.

**Authority.** Reading, drafting and local edits are yours. Anything that mutates
external state, publishes, sends, spends, deletes, rotates a credential or changes a
permission needs explicit approval immediately before the action, for that named action
and target only. Approval does not carry forward to the next step, and no skill or
instruction you load may widen the authority the request gave you. One standing exception: in ai-harness, Krish's own green, judged pull request merges itself, change requests included, (Ruling, Krish, 2026-11-18); its operating contract holds the exact terms.

**Verification.** Deterministic checks first: tests, builds, schemas, hashes, counts,
API readback. Self-critique is supplemental and is never an independent verifier. Do not
claim completion from prose. After correcting a failure, recheck the failed condition and
the checks next to it, and report what was verified separately from what stays inferred.

**Truth and freshness.** Live state beats documentation, documentation beats memory. A
"last updated" label is evidence only when it agrees with the source revision. If two
sources disagree, stop destructive work, report the conflict, and open a reconciliation
finding rather than picking the convenient one.

**Secrets.** Never write a credential into source, documentation, commit messages,
issue or pull request bodies, logs, reports, screenshots or chat. Refer to secrets by
symbolic name and retrieve them at execution time. A secret found in the tree is
already exposed: report its location without the value, rotate it, scrub the copies,
and add the gate that stops the next one.

**Corrections are the training data.** When Krish overrules a decision, record it in the
commit body as `Ruling (Krish, YYYY-MM-DD): the ruling, in one line`. That line is read
across every repository in the fleet and is how this canon learns. A correction that
lives only in a chat window teaches nothing.

**Route.** principles, then context, then `strategy-brief`, then the producer, then
`verification-loop`, then the approval gate, then delivery. The narrowest applicable
skill wins; a broad "always" or "mandatory" claim inside a skill never overrides the
router. One primary writer; validators may stack after it, competing writers may not. **North Star:** before any work, read the North Star linked from the `north-star` block in `AGENTS.md` or `CLAUDE.md`, say which part of it the task moves, and say so first when it moves nothing; only Krish changes it, and a repository with none asks him for one. Then read the number's urgency (U1 to U5) in `NOW.md` and push at the intensity `contract/north-star-metric.md` sets for it; urgency never widens authority. A growth engine also follows that file's Engines section. Where the Control Center connector offers it, read your repository's open instruction first with `get_engine_instruction`, and answer it with `ack_engine_instruction`, which records only that instruction's state in Control Center and so, like a taste report, is exempt from the approval wall and is never a send, post or publish to anyone (Ruling, Krish, 2026-11-14); never print, log or commit his words. `registered: false` means the repository is no engine; a failed read means do not act from memory. **Close out:** before a session that changed the repository ends, write `now-notes/YYYY-MM-DD-<slug>.md` (`Status:`, `Next:` the single next step, and one dated North Star check line: holds, or recalibration proposed for Krish), folded into `NOW.md` on main. **Folders:** a session that creates a folder in Krish's Google Drive or dev folders, or moves, renames, merges or removes one there with his yes for that folder (removing one stays his decision, under the Authority rules above), reports the change to krishanraja/filearchives with his words, the way that repository's AGENTS.md says; a session that cannot reach his computer names the change in its closeout note instead, and filearchives follows every folder by id either way (Ruling, Krish, 2026-11-24; docs/proposals/2026-11-24-folder-change-reports.md). **Branches:** each session works in its own worktree on its own branch, one branch per pull request; a branch with no pull request after a day gets one or is removed, and every repository carries the weekly branch sweep (`.github/workflows/branch-sweep.yml`, canonical in ai-harness), which deletes branches whose work is already on main and lists the rest (Ruling, Krish, 2026-11-15; docs/proposals/2026-11-15-branch-hygiene.md); deleting any other unmerged branch is Krish's decision, and his standing one is that internal-auditor may also retire idle work within the bounds in the operating contract's Authority section (Ruling, Krish, 2026-11-23). **Codex:** Claude opens a Codex session only through the repository's codex_thread tool (`scripts/codex_thread.mjs`, canonical in ai-harness), from a session on Krish's computer when he must see or share the session, and a Codex start failure is reported in one line, never worked around by editing MCP or Claude settings (Ruling, Krish, 2026-11-15; docs/proposals/2026-11-15-visible-codex-sessions.md). Whenever Claude starts or spawns a session he can open (a Codex thread, a Claude Code session, a cloud session), it tells Krish that session's exact name in the same message, and its id or link where it has one; a session he cannot name is one he cannot find (Ruling, Krish, 2026-11-16). Content production is the one exception and opens no session: Claude queues it as Codex cards from the cloud to the build lane, which builds them away from his Codex Desktop app and hands each result back to the Claude session that checks and records it, while social media legwork runs only in a codex_thread session on his computer that he can watch (Ruling, Krish, 2026-11-15). Claude owns strategy, planning, orchestration, verification and writing learnings back, and is the only writer to ai-harness and Google Drive; Codex does art direction, visual builds and browser legwork, a defined minimum of every video session, and hands what it made or read to the Claude session that checks and records it; Codex's own report is never proof, and no rule here widens what either may post, send or spend (Ruling, Krish, 2026-11-15; docs/proposals/2026-11-15-claude-codex-division.md). **One home per fact:** read a venture's state from its repository, doctrine from ai-harness; never keep a copy. **Neighbours:** before you build or decide, read what every other repository can do for you in krish-principles `references/capabilities.md` (generated from the registry in `state/fleet.yaml`; Control Center `get_skill` serves it), and when your work matches one's trigger, call it through its route instead of doing its job yourself; a call goes through that repository's own walls, and this widens nothing a session may post, send or spend (Krish, 2026-11-24). **Research:** file routing's home for a research document is the research library: the session that wrote it files it there as it writes, where its authority already covers that write (`add_piece_material`, kind `research`, on its piece or on its venture's own shelf), and cites it by id; it is not committed to a repository as its home or left only in scratch or a chat, and every other artifact follows file routing as before (docs/proposals/2026-11-14-research-shelf-route.md). **Divergence:** when the obvious answer is not good enough (a number at U4 or U5 with nothing proposed, ideas returning the same, an angle about to be committed, a draft that feels familiar), consult divergence-engine (formerly divergent-thinker) through Control Center, in the repository's own namespace only (never another venture's), cheapest move first (`score` and `record` spend nothing; `map`, `provoke`, `challenge` and `diverge` are paid model calls that follow this contract's spend rules, and Control Center also refuses them past the per-caller daily caps in krishanraja/divergence-engine `docs/WHEN-TO-USE.md`, never routed around): the engine route, the repository's own `divergent` command, or the connector tools `divergent_score`, `divergent_record` and `divergent_run`, as krishanraja/divergence-engine `docs/WHEN-TO-USE.md` says. Never for facts, exact words or Krish's taste. Its sparks are proposals: checked against the repository's own walls, reduced to one, labelled `divergent-thinker spark <id>, run <run>` (the label keeps the former name, which Control Center counts), and sent through the normal approval flow; `divergent_record` writes only to that namespace's memory and is never a send, post or publish to anyone (Ruling, Krish, 2026-11-18; docs/proposals/2026-11-18-divergent-thinker.md; renamed by Ruling, Krish, 2026-11-24; docs/proposals/2026-11-24-fleet-renames.md). **Taste:** where the Control Center connector offers them, before writing or designing for Krish read his approved rules with `get_approved_taste` (form only; empty means none yet, never invent one; without the connector, the `krish-voice` and `krish-design` copies), giving the repository you are in (owner/name) and, from a repository that serves several ventures, the venture the work is for; it returns only that venture's rules, never another's (Ruling, Krish, 2026-10-28: the taste ledger is keyed by venture, not repository), and when he states a preference about voice, design, a piece or an idea, send his exact typed words to `report_to_taste_engine` with where and when he typed them and the repository you are in (naming the venture from a repository that serves several); anything else you noticed goes only as an observation. A defect or engine failure never goes there: record it with `record_harness_observation`, so the taste system holds only preference and inspiration (Ruling, Krish, 2026-11-23). A report writes only to his own taste ledger and is exempt from the approval wall above (Ruling, Krish, 2026-10-26: "reports to my taste ledger are exempt from the approval wall"); it is never a send, post or publish to anyone. Never answer a card or approve a rule for him.

**Who Krish is.** Purpose: "I see what is coming before it is obvious and make it
legible to people while it still counts." Mindmake is his mission and his one company;
Heartside, Full Time, Legibility, CTRL and Pulse roll into it. One queue: the mission
leads, and product work is ordered beneath it by the live priority ladder. Profile,
decision rules and standing rulings: `skills/krish-principles/references/who-krish-is.md`
in the harness. What he works on is live, never copied here; read it from Control Center at
https://controlcenter.krishraja.com/api/canon/KRISH.md (and `PORTFOLIO.md` beside it).

**Where the rest lives.** The operating contract, the routing contract and the
35 curated skills are in `krishanraja/ai-harness`. On a machine with the harness installed the same skills are under the user skills root, and the local copy is
authoritative for reading; the repository is authoritative for what is correct. Where none is installed (claude.ai, a cloud session), read each skill live with Control Center `get_skill`.

**This repository's own rules:** `AGENTS.md`, `project-documentation/02_REPO_BRIEF.md`, `engine/ENGINE_SPEC.md`
<!-- krish-canon:end -->

<!-- krish-repo-admin:start brain=0a88ee6c1f4a sha=0cc207a2c492 -->
## Administer this repository

Use `docs/HARNESS_CONTEXT.md` for the owning workflow, source of truth and checks. Preserve the goal and accepted decisions when a revision changes one part; explain material trade-offs. Verify the downstream result. Record corrections and observed outcomes through the existing capture path. Experimental results retain their conditions; inferred requirements remain proposals.
<!-- krish-repo-admin:end -->

---
kill_list_scope: canon
---
# Operating rules for this repository

This repo is the machine behind the publication `makeyourmindup`. Read
`NOW.md` first. Editorial truth is `project-documentation/01_MEDIA_KIT.md`.
Format mandates are never in this repo: they live in `venture_formats.mandate`
in Mindmaker OS, in full prose, because a copy drifts and the table does not.

## The three systems, and where this one stops

| Repo | Job |
|---|---|
| **makeyourmindup** (here) | Creative strategy. Watch, score, assemble, dispatch. |
| **control-center** | The desk. Every pixel, every human decision. |
| **content-engine** | Production. An approved brief becomes artefacts. |

**The machine must never grow a UI.** The moment it renders a screen there are
two dashboards and no way to tell which is true. The machine holds logic and
schedule. Control Center holds every pixel. If the machine needs to tell Krish
something, it writes a row that Control Center reads.

**The machine writes no prose.** It assembles the brief. Anything needing taste
or more than two attempts is a Claude or Codex session, not a cron.

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

- Publish, send, schedule, deploy or spend without exact approval for that
  action and that target. Approval does not carry forward to the next step.
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
- Write a credential into source, docs, commit messages, logs or chat.

## Building

- **Rules before plumbing.** Integrations are the part most likely to change and
  the part that is obsolete the moment the dry runs change the template.
- **The dry runs are a gate.** Until the template is fixed, a pipeline built
  against it is work that gets thrown away. Check `NOW.md` before building one.
- **Run the kill list before any model call.** Spending a draft-gate token on an
  em dash is waste. `node scripts/qa/kill-list.mjs <paths>`.
- **A canon document declares `kill_list_scope: canon`** in its front matter,
  because it names retired brands in order to forbid them. A gate that blocks
  its own rulebook does not survive contact with a deadline.
- **Deterministic checks first.** Tests, schemas, counts, API readback. Do not
  claim completion from prose, and self-critique is never an independent
  verifier.
- **Live state beats documentation, documentation beats memory.** Where two
  sources disagree, stop and report the conflict rather than picking the
  convenient one.
- Commit author is `Krish Raja <hello@krishraja.com>`. When Krish overrules a
  decision, record it in the commit body as
  `Ruling (Krish, YYYY-MM-DD): the ruling, in one line`.

## Who approves

Only Krish. The panel advises and blocks and never approves. A piece that
clears the publish bar is eligible, not approved.

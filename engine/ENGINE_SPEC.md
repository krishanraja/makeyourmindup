---
kill_list_scope: canon
---
# The machine

Four jobs and nothing else. The machine is a conductor: it holds the schedule,
the rubric and the context assembly. **It holds no screens and it writes no
prose.**

## Watch

Poll the sources, deduplicate, and tag everything against the tracked themes.
Discard anything that fails the kill list before a human ever sees it.

Runs continuously. This is the part that currently lives in `content-engine`
under `apps/control-plane`, and the part the extraction moves here first.

## Score

Apply the rubric and the hard gates to every candidate, so Sunday opens with a
ranked slate rather than a pile. **Records its score before Krish votes, because
the gap is the training signal.**

Runs Saturday night. Rubric in `quality/panel/rubric.v1.json`, and the only
recorded calibration it has is
`calibration/2026-09-17-commissioning-round-1.json`.

## Assemble

For a commissioned idea, build the brief: the angle, the number to chase, the
sources with their retrieval times, the format rules, the kill list, and what
the last three pieces already said.

Runs on commission. The brief must be complete or it is not dispatched: a
partial brief hands the missing work back to Krish, and the two to four hour
budget cannot absorb it. **Reject an incomplete brief loudly at the boundary and
name the missing blocks.** Do not fill the gaps: the gaps are exactly where his
taste is supposed to sit.

## Dispatch

Send the right package to the right place at the right hour. Chase what has not
come back. Fire the bad-week rule on its own when Wednesday has nothing in it.

Runs continuously. **Nothing it sends is ever published automatically.**

## Three rules that bound all four

**The machine must never grow a UI.** The moment it renders a screen there are
two dashboards and no way to tell which is true. The machine holds logic and
schedule. Control Center holds every pixel. If the machine needs to say
something, it writes a row Control Center reads.

**Anything needing taste, or more than two attempts, is not a job.** It is a
Claude or Codex session. A cron that needs judgement is a cron that will be
wrong quietly.

**If a job adds to the two to four hours, it is wrong** regardless of how good
its output is. Apply that test before the quality test, not after.

## The contract at the far boundary

Production accepts exactly one thing today: `ProductionBriefV1`, defined in
`content-engine/packages/contracts/src/editorial-v1.ts`. It is content
addressed, it carries claims with their evidence URLs, a five-way hard-gates
block, and an approval hash that must equal the content revision hash.

`media-brief.v1` does not exist in any repository. It is a proposal, and
`ProductionBriefV1` is its direct ancestor. **Extend that contract rather than
replacing it**, and where the two disagree, report the difference and propose
the mapping rather than picking one.

---
kill_list_scope: canon
---
# apps/machine

**Superseded on 28 October 2026; this will not be built.** Ruling (Krish, 2026-10-28): content-engine's `plan-week` is the one ideation path. What follows is history.

Scaffold. **There are no jobs in here yet, and that is correct.**

The four jobs are specified in `engine/ENGINE_SPEC.md`: watch, score, assemble,
dispatch. They are not built because the dry runs have not happened, and the dry
runs fix the template. A pipeline built against a template that is not fixed is
work that gets thrown away. See `project-documentation/03_STEP_PLAN.md`, phase 2.

The code these jobs will be built from currently runs in
`krishanraja/content-engine` under `apps/control-plane`. The extraction order is
in `project-documentation/02_REPO_BRIEF.md`.

**Two rules for whatever lands here.** No UI, ever: the machine writes rows and
Control Center renders them. And no job that needs taste or more than two
attempts: that is a Claude or Codex session, not a cron.

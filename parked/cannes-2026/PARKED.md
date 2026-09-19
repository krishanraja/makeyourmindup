---
kill_list_scope: canon
---
# Parked: the Cannes Lions 2026 funnel

**Parked 19 September 2026. Not live work. Do not extend this.**

Everything in this folder is the single-screen "future memory" lead-capture
funnel built for Cannes Lions 2026. It is a finished thing that did its job.

**Why it is parked here rather than deleted.** It is still deployed, and
moving something somewhere unhosted is a decision to stop running it without
saying so. A tool reading this repo in two months would otherwise revive it as
a current feature of the publication, which it is not and never was.

**Where it is going.** Into the mm-ctrl app, as the next job after the
publication machine lands. It belongs with CTRL: it already shares CTRL's
Supabase project and reads CTRL's `live_headlines_cache`.

**What it is not.** It is not the publication. `makeyourmindup` as a
publication name dates from the 17 September 2026 relaunch and has nothing to
do with this funnel beyond the domain they both want.

## Facts a reader needs before touching it

- **A different Supabase project.** This targets `bkyuxvschuwngtcdhsyg`, shared
  with CTRL. The publication is on `gojpffsrxybbpbdzzrvs`. They are not the
  same database and nothing here should start reading the other one.
- **It is live.** The Vercel project `makeyourmindup` serves `makeyourmindup.ai`
  and `www.makeyourmindup.ai` from this code. Parking the folder does not take
  it down; its Root Directory setting does. See NOW.md for the sequence.
- **It ranks against a retired vocabulary.** `supabase/functions/_shared/reads.ts`
  scores the shared headline pool against nine categories the engine retired on
  2026-08-27 and replaced with six lenses. If it is ever revived, that is the
  first thing to fix.
- **No tests, no CI.** One Deno test file and a set of one-off QA scripts that
  print to stdout without assertions.

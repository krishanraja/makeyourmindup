# makeyourmindup.ai

Single-screen, mobile-first interactive launching at Cannes Lions 2026. Built on Next.js 14 + Supabase + Anthropic + Resend, deployed to Vercel.

## Local development

```bash
cp .env.local.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
npm install
npm run dev
```

Open http://localhost:3000 on a phone (over LAN) or in Chrome devtools mobile emulation.

## Scripts

- `npm run dev` — Next dev server
- `npm run build` — production build
- `npm run typecheck` — `tsc --noEmit`
- `npm run lint` — ESLint
- `npm run voice:lint` — scan static copy for banned words / em dashes

## Database migration

The schema lives in `supabase/migrations/`. Apply to the existing Supabase project (`bkyuxvschuwngtcdhsyg`) via the Management API:

```bash
export SUPABASE_ACCESS_TOKEN=...   # personal access token from supabase.com/dashboard/account/tokens
./scripts/apply-migration.sh
```

Or paste the SQL into the Supabase dashboard SQL editor.

The migration is idempotent (uses `create table if not exists`, `drop policy if exists`, `create or replace function`).

## Edge functions

Three Deno edge functions in `supabase/functions/`:

- `enrich-profile` — resolves whoever the user is from an email / LinkedIn URL / name+domain via a multi-provider waterfall (see below), writing the result into the `enrichment_*` + resolver columns.
- `generate-result` — calls Anthropic (`claude-sonnet-4-5`), validates voice rules, retries once, falls back to per-Q4 stub prose on failure.
- `send-result-email` — generates a personal email via Anthropic, sends via Resend from `krish@themindmaker.ai`.
- `track-fork` — records which fork link (Substack / Mindmaker / CTRL) the user took.

All depend on these Supabase project secrets being set: `ANTHROPIC_API_KEY`, `RESEND_API_KEY`. `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are auto-injected.

### Person resolver (`enrich-profile`)

`enrich-profile` normalizes the input (`_shared/identity.ts` — strips LinkedIn UTM params, fills a missing scheme, extracts the vanity slug, derives the company domain from an email) and runs an ordered, fault-isolated waterfall in `_shared/resolvers/`:

1. **Identity (parallel, flips `enrichment_status` to `ready` early):** People Data Labs + Apollo people-match resolve email / domain / linkedin_url to a real profile. Work emails are rarely "linked" to LinkedIn publicly, so when a provider returns the person but no profile URL we chain `name + domain` to the other provider, then fall back to an Exa/Brave `site:linkedin.com/in` search.
2. **Company context (parallel, late patch):** Brandfetch (blurb/logo/colors), Apollo org (industry/headcount/funding), BuiltWith (tech stack), Tranco (popularity rank).
3. **Signals:** Exa / Perplexity / Brave / NewsAPI snippets, compressed by Claude into the `company_blurb` + `public_signals` contract (Claude summarizes fetched facts, it never invents identity).
4. **Live scrape (last resort):** Apify LinkedIn profile actor, only when a URL is known but the structured result is thin. LinkedIn ToS/legal risk — keep gated.

Each provider key is read by env-var name and is optional: a missing key just skips that provider. Set the ones you use as Supabase function secrets:

```
PEOPLE_DATA_LABS_API_KEY  APOLLO_API_KEY        # identity (recommended baseline)
NEVERBOUNCE_API_KEY                              # email deliverability gate
BRANDFETCH_API_KEY  BUILTWITH_API_KEY  TRANCO_API_KEY   # company context
EXA_API_KEY  PERPLEXITY_API_KEY  BRAVE_API_KEY  NEWSAPI_KEY   # signals
APIFY_API_KEY  APIFY_LINKEDIN_ACTOR             # optional live-scrape fallback
```

Deploy:

```bash
./scripts/deploy-functions.sh
```

Requires the Supabase CLI locally and an authenticated session (`supabase login`).

## Vercel

1. Connect the repo to a Vercel project.
2. Set env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_APP_URL`.
3. Attach the `makeyourmindup.ai` domain. Update DNS (A `76.76.21.21` or CNAME `cname.vercel-dns.com`).

## OG share image

`GET /og/[id]` renders a 1080×1920 image (sigil + archetype title + URL) via `@vercel/og` (Satori) on the Edge runtime. Reads share-safe fields from the `get_share_card(uuid)` Postgres function.

## Voice rules

All in-app static copy and LLM output must obey: no em dashes, no exclamation marks, no emoji, no buzzwords (`transformation`, `journey`, `unlock`, `empower`, `supercharge`, `harness`, `leverage`, `game-changer`, `synergy`, `holistic`, `ecosystem`, `best-in-class`, `paradigm`, `mindset`).

- Static copy: enforced by `npm run voice:lint` (CI guard).
- LLM output: enforced server-side by `voice-guard.ts` in the edge function, retry-once on violation, fall back to stub prose on second failure.

## File map

```
app/                       # Next App Router shell + OG route
src/experience/            # State machine + 9 screens
src/components/sigil/      # Four-layer constructive sigil system
src/components/            # Slider, Card, TypedLine, CyclingPlaceholder, BrandMonogram
src/lib/                   # supabase, archetypes, variant, voice, analytics, telemetry
supabase/migrations/       # Database schema
supabase/functions/        # Edge functions + _shared helpers
scripts/                   # apply-migration.sh, deploy-functions.sh, voice-lint.mjs
public/                    # favicon, og fallback
```

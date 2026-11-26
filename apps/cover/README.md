---
kill_list_scope: canon
---
# The Edition

The front page at makeyourmindup.ai is a finite daily edition. Readers choose a sector to change the lead, today's three stories, their why-lines, the market board and the questions they can ask. The Creative 24 board opens inline. Everything today opens a full-page reading view and returns the reader to their place.

## Run locally

Use Node 20 or later. Run these commands from `apps/cover`.

```sh
npm ci
npm run verify
npm test
npm start
```

The production server listens on port 3100. For development, use `npm run dev`. Set `CHROME_PATH` to an installed Chromium executable before running `npm run audit` and `npm run shots`. Both scripts accept a local URL as their first argument. The screenshot script takes an optional output directory and defaults to `.shots/`. For a Chromium instance already running for this review, set `CHROME_CDP_URL` to its local debugging address.

## Where the page comes from

| Path | Purpose |
| --- | --- |
| `lib/hub.ts` | Fetches and checks one version 1 snapshot from `HUB_URL`, defaulting to `https://content-engine-flame-nu.vercel.app/api/hub/today`. A failed request or invalid snapshot uses the checked-in edition. If that also fails validation, the error reaches Next's incremental static regeneration and the previous good page continues to serve. |
| `content/edition-snapshot.json` | Dated 26 November 2026. The 15 source-linked stories, six rooms, price histories and three pieces come from the approved mock. Each original source in this fixture counts as one outlet. Month-only story dates retain the precision supplied by the source. |
| `content/edition-notes.json` | The mock's editorial choices, attributed portraits, treatments and sourced answers for this fixture. Live editions use their own items. |
| `lib/edition.ts` | Chooses the sector lead and order, reserves images and assigns treatments. Matches reader questions against stories in the selected room. |
| `lib/rss.ts` | Reads Substack's archive and feed, joins video and series metadata by article URL and selects the latest three pieces. A failed loader uses pieces supplied with the snapshot, then the checked-in selection. |
| `components/edition/` | The front page, rooms, markets, Listen control and full feed. Listen reads this cut aloud with the browser's speech synthesis when available. |
| `public/hub/`, `app/fonts/` | Stills, credited Commons portraits, the wordmark and the self-hosted fonts served by next/font. |
| `app/members/`, `members-files/` | The existing members gate and protected files. Files stay outside public. |

The page revalidates every 900 seconds. The subscribe form sends only the email field with a GET to the publication's Substack. The publisher's structured data identifies the organisation. Legal pages, robots, sitemap and llms.txt retain their own routes.

## Checks

The publication's kill list checks the existing copy and the Edition's fixture and interface text. Its number warnings still need editorial judgement. Tests cover the members gate, catalogue, snapshot validation, fallback, every sector cut, attribution, image reuse and cited retrieval.

The layout audit checks 320, 360, 390 and 412 pixel widths at 100% and 130% text. It exercises each room, the company detail, the expanded ticker and the full feed. The horizontal sector selector and feed filter bar scroll within their own bounds.

The Vercel project's root directory is `apps/cover`. The project's existing production and preview deployment settings apply.

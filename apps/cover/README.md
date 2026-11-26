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
| `lib/hub.ts` | Fetches and checks one version 1 snapshot from `HUB_URL`, defaulting to `https://content-engine-flame-nu.vercel.app/api/hub/today`. The loader flags its dated fallback as a fixture. Public pages show an unavailable state when they have no published data. |
| `content/edition-snapshot.json` | Dated 26 November 2026. The 15 source-linked stories, six rooms, price histories and three pieces come from the approved mock. Each original source in this fixture counts as one outlet. Month-only story dates retain the precision supplied by the source. |
| `content/edition-notes.json` | The mock's editorial choices, attributed portraits, treatments and sourced answers for this fixture. Live editions use their own items. |
| `lib/edition.ts` | Chooses the sector lead and order, reserves images and assigns treatments. Matches reader questions against stories in the selected room. |
| `lib/rss.ts` | Reads Substack's archive and feed, joins video and series metadata by article URL and selects the latest three pieces. A failed loader uses pieces supplied with the published snapshot. |
| `components/edition/` | The front page, rooms, markets, Listen control and full feed. Listen reads this cut aloud with the browser's speech synthesis when available. |
| `public/hub/`, `app/fonts/` | Stills, credited Commons portraits, the wordmark and the self-hosted fonts served by next/font. |
| `app/members/`, `members-files/` | The existing members gate and protected files. Files stay outside public. |

The page revalidates every 900 seconds. The subscribe form sends only the email field with a GET to the publication's Substack. The publisher's structured data identifies the organisation. Legal pages, robots, sitemap and llms.txt retain their own routes.

## Finding and citing an edition

The archive at `/editions` reads the hub's `?archive=1` list. The six desks link stories from the latest 14 published editions to `/edition/YYYY-MM-DD#story-id`. A dated page accepts only a validated snapshot for that date. Today's data refreshes after 15 minutes and historical data after an hour. The Creative 24 methodology and constituents live at `/creative-24`.

The Edition has its own RSS feed at `/edition/feed.xml`. The Substack feed continues to carry the publication's longer pieces. Crawlers can follow `/sitemap.xml`, `/news-sitemap.xml`, `/llms.txt` and `/llms-full.txt`. News entries use the issue's original publication day, which remains stable when prices are refreshed.

## Daily IndexNow notification

Configure the same `INDEXNOW_SECRET` in the cover and the edition cron's secret store. Once the morning snapshot has been published successfully, the cron should make this request from its server:

```sh
curl --fail-with-body --request POST \\
  --header "Authorization: Bearer ${INDEXNOW_SECRET}" \\
  https://www.makeyourmindup.ai/api/indexnow
```

The route checks today's snapshot directly before submitting the edition, homepage and six desk URLs. A 401 means the bearer credential is missing or incorrect. Retry a 503 after the dated snapshot becomes available. A successful response records receipt by IndexNow. The root verification file contains the public key configured in `lib/content.ts`.

## Checks

The publication's kill list checks the existing copy and the Edition's fixture and interface text. Its number warnings still need editorial judgement. Tests cover the members gate, catalogue, snapshot validation, fallback, every sector cut, attribution, image reuse and cited retrieval.

The layout audit checks 320, 360, 390 and 412 pixel widths at 100% and 130% text. It exercises each room, the company detail, the expanded ticker, the full feed and every public HTML route added for discovery. Run against a published or locally served fixture snapshot. The horizontal sector selector and feed filter bar scroll within their own bounds.

To save full-page fixture screenshots of the homepage, dated edition, six desks, index and archive at 390 and 1280 pixels, run `npm run shots -- http://localhost:3100 ../../.review/screenshots --discovery`.

The Vercel project's root directory is `apps/cover`. The project's existing production and preview deployment settings apply.

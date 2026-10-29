---
kill_list_scope: canon
---
# Wave 3: what waits on Krish in this repository

Prepared 2026-10-29 for W3.7 and W3.9 of the Wave 3 brief. Each item is built
up to his decision and stops there. Nothing here deploys, sends or changes a
setting. Live readings were taken on 2026-10-29 from the public site, the
public Substack pages and Vercel's deployment list, read only.

## 1. The redeploy has already happened

Every push to `main` deploys the cover to production (`apps/cover/README.md`,
"Deployment"). Merging PR #29 deployed `8fbe692` to production on 2026-10-29,
so the no-name cover copy is live without a separate yes. Read live:

- `https://www.makeyourmindup.ai/llms.txt` names only the publication, and
  says "Cite a piece by its own URL, with makeyourmindup as author and
  publication."
- The home page's JSON-LD is one `Organization` and one `WebSite`, both named
  makeyourmindup, with `sameAs` the Substack, YouTube and Instagram.
- There is no TikTok or X tile.

One residual is live: the editor photo is served as a file named after him,
along with two unused photos beside it. PR #32 renames them `editor-*`. Its
build output is checked: the built `llms.txt` and JSON-LD name the publication
only.

**His call:** yes or no to merging PR #32, which deploys production. The
rollback is to promote `dpl_G6YhAhHxF1Won1qcDYv2224q86t2` in Vercel.

**Also his:** because every merge deploys, even a docs-only PR republishes the
cover (`7402394`, a change to `AGENTS.md` only, deployed production). Two ways
to fix this:

- leave it, and he merges every PR in this repository himself;
- add an ignored build step, so Vercel builds only when `apps/cover` changes:
  `"ignoreCommand": "git diff --quiet HEAD^ HEAD -- ."` in
  `apps/cover/vercel.json`. Merging that change itself deploys once.

## 2. The dry runs: calibrate the panel, or retire them

They were the gate on the machine's template. On 2026-10-28 that machine was
superseded by content-engine (`project-documentation/02_REPO_BRIEF.md`).

**Option A, keep them to calibrate the panel.**

- `panel/PANEL.md` ("Calibration, and its one exception") moves a judge's
  threshold when its verdicts disagree with his. Writing the three picked
  subjects three ways (opening, spine, temperature; `dry-runs/PITCHES.md`)
  would give the judges controlled pairs he has ranked.
- Controlled pairs isolate one variable at a time. Real published pieces
  vary in several at once.
- Cost: two of three subjects are still unpicked after six weeks
  (`calibration/2026-09-17-dry-run-picks.json`: one of three locked). The
  full run is nine treatments, each rebuilt in written, audio and vertical
  video. That is many signature-piece budgets of his time against the
  two-to-four-hour rule in `AGENTS.md`.

**Option B, retire them.**

- The template they gate is now made in practice. content-engine publishes
  every week; the live feed lists five recent pieces, including a tested
  review with a scorecard.
- His scores on real pieces (`piece_scores`, Wave 2) and the W3.6
  retrospective are a calibration source with engagement attached, which the
  dry runs can never have.
- The only recorded calibration, `calibration/2026-09-17-commissioning-round-1.json`,
  stays as it is.
- Cost: no controlled pairs. A judge drifting on one variable is found more
  slowly.
- If retired, `dry-runs/` moves under `parked/`, and the media kit's three
  "settled by the dry runs" rows (below) need a new route to close.

**Recommendation: B.** The dry runs were built to fix a template before any
piece existed. Pieces now exist, and his scores on them are the better
evidence. Counterpoint: if the W3.6 retrospective finds too few scored pieces
to separate variables, a single controlled pair on the weakest variable is
cheaper than reviving all nine.

## 3. The media kit's three open decisions

From `project-documentation/01_MEDIA_KIT.md`, "Still open". They stay open
until he closes them, and nothing here closes them.

1. Whether a verdict appears in the written piece at all.
2. What is fixed in the template. Only the same-day vertical cut is fixed.
3. Whether shorts carry a name per format.

Each is marked "settled by the dry runs". If he picks B above, each needs a
new route; the default would be his own ruling, read against the published
pieces. The same table holds three more open rows that do not depend on the
dry runs: the mind-change data model, the contact address, and the apex
domain.

## 4. The cover's TikTok and X tiles

His D2 is "No, personal stays personal". Growth's channel records
(`growth-makeyourmindup/channels.json`) list only his personal accounts for
TikTok and X. The publication holds no account on either.

**Default, live now: no tiles.** The cover shows Substack, YouTube and
Instagram, the platforms the publication holds (`a1cd10b`).

**Alternative: the publication's own handles.** This needs two new accounts
in the publication's name first; nobody should register them without his
yes. Then a one-commit change, which deploys on merge:

- in `apps/cover/content/site.json`, under `platforms.tiles`, add back:
  `{"key": "tiktok", "name": "TikTok", "blurb": "The same Shorts, on your For You page.", "cta": "Watch now"}`
  and
  `{"key": "x", "name": "X", "blurb": "What just moved in AI, as it moves.", "cta": "Follow"}`;
- in `apps/cover/content/config.json`, set `platforms.tiktok` and
  `platforms.x` to the two new URLs. A tile with no URL reads "At the
  printers", which `a1cd10b` removed as untrue.

With four tiles the grid returns to a cell each (`Platforms.tsx`).

**His call:** no tiles, or new publication accounts and then the tiles.

## 5. Substack settings that still name him (W3.9)

Read live on 2026-10-29 from the public pages of `home.makeyourmindup.ai`.
Only he changes these; Substack has no API for them. Settings are at
`https://home.makeyourmindup.ai/publish/settings`.

- [ ] **Bylines.** The newest post carries a byline of his first name. Each
  post's byline is set in the post editor; the default author is the owner
  account.
- [ ] **Author.** The publication's `author_name` is his first name, and the
  RSS feed's `dc:creator` and author fields carry his first name and his full
  name.
- [ ] **Footer and copyright.** The copyright line is his full name. It shows
  in the site footer and in the feed's `<copyright>`. Settings, Basics,
  Copyright: set it to makeyourmindup.
- [ ] **Sender.** The email "from" name is his first name with the
  publication's name. Settings, Emails, sender name: set it to
  makeyourmindup.
- [ ] **The second admin.** A second admin account with his full name, his
  photo and a first-person bio is listed among the publication's
  contributors, so it shows on the About page. Settings, Team: remove it from
  public display, or remove it.
- [ ] **The owner account's public face.** The owner account is listed with
  his first name, a photo and a bio. Its display name and bio are his personal
  profile (D2), so the fix is to keep it off bylines and the About page, not
  to edit it.
- [ ] **The LinkedIn link.** The About page links to his personal LinkedIn
  profile. Remove it.
- [ ] **About page.** It still runs the old text: the kit's opening line is
  not on the live page. Settings, Website, About page: delete everything and
  paste "About page" from `apps/cover/substack-kit/COPY.md`.
- [ ] **Welcome emails.** Settings, Emails: free from `COPY.md`, "Welcome
  email"; paid and founding from `apps/cover/substack-kit/PAID.md`.
- [ ] **Short description and subscription benefits.** From `COPY.md`, "Short
  description", and from `PAID.md`, "Subscription benefits"; this carries the
  2026-10-05 day swap.

After the change, the check is the same reading again: the feed's
`dc:creator` and `<copyright>`, and the About page's contributors, carry no
person.

---
kill_list_scope: canon
---
# The cover

makeyourmindup's front door: a magazine cover you scroll through. It sends
every reader to the Substack, which is the hub. Static, refreshed hourly, so a
dead back end never takes it down.

It lives here, beside `apps/machine/` and never inside it, with its own
`package.json`. The repo root stays dependency-free on purpose: a Next.js app at
the root would let a production build succeed from the wrong folder.

## Where things are

| Path | What |
|---|---|
| `content/site.json` | Every word on the page. Edit copy here, never in components. The kill list scans it |
| `content/config.json` | Substack address, relaunch date, platform links, the scoreboard switch and its calls |
| `components/` | One file per section of the page, plus the three signature diagrams in `diagrams/` |
| `lib/rss.ts` | Reads the Substack feed at build and hourly after, keeping only posts on or after the relaunch date |
| `brand/` | The two Canva exports every logo file is derived from, the operating-theatre photo the cover is cut from, and the standing robot the Substack welcome image is cut from |
| `public/brand/`, `app/icon.png`, `app/apple-icon.png` | Derived logo files. Regenerate with `npm run assets` |
| `public/cover/` | The cover's photo, cut at the table's edge, and the threads that hang into the headline. Regenerate with `npm run assets` |
| `substack-kit/` | The Substack refresh kit: paste-in copy and images. See its own README |
| `scripts/` | Asset derivation, kit rendering and screenshots |

## Everyday changes

- **A platform goes live:** put its URL in `content/config.json` under
  `platforms`. The tile flips from "At the printers" to live on the next build.
- **A call is published:** add it to `scoreboard.calls` in `content/config.json`
  with `statement`, `due`, `confidence`, `status` (`open`, `held`, `broke` or
  `unclear`) and optionally `href`. Only Krish rules a call.
- **The first issue lands:** change `cover.issue` in `content/site.json`.
  Pieces appear in the newsstand by themselves once they are on the Substack.
- **Substack moves to its own domain:** change `substackUrl` and `feedUrl`.
- **Hide the scoreboard:** set `scoreboard.show` to `false`.

## Checks

```
npm ci
npm run verify     # kill list over the copy, type check, production build
npm run audit      # server on :3100 first: fails on any text past the screen edge at
                   # 320 to 768px (100% and 130% text), on any spread whose rows do
                   # not line up with the other two, and on any section taller than
                   # the screen, from an iPhone SE in Safari to a 2560px desktop.
                   # ONLY=fit (or overflow, alignment) runs one phase
npm run brand-kit  # rebuild ../../brand-kit and its zip from the cover's own files
npm run shots      # screenshots at 360px, 390px and 1440px into .shots/
npm run kit        # re-render the Substack kit and the social card
npm run assets     # re-derive every logo file and the cover photo from brand/
```

## Rules this page keeps

- No em dashes, no exclamation marks, British English, reading age 12.
- The channel speaks as "we", to "you". Krish is the byline.
- No Mindmake or CTRL anywhere on the page, and no retired name.
- No contact address and no stored reader responses: both are open decisions in
  the media kit.
- No invented numbers. The scoreboard shows zeros until a real call is ruled.
- Every diagram is labelled as an illustration.
- The three spreads share one structure and line up row for row: headlines are
  set as three lines in `content/site.json` (`headline`), and the audit fails
  if any slot drifts by more than a pixel. Keep new copy to the same line counts.
- Every section fits on one screen, below the sticky bar, on any device.
  Vertical sizes follow the screen's height (`svh`) as well as its width, and
  phones leave out what the next screen repeats: the cover's section key (on
  short phones), the price box, the spreads' body and caption, the platform blurbs, the staff bio.
  Longer copy has to fit too: the audit's fit phase fails otherwise.
- The cover scales from one unit in `components/Cover.module.css`: `--u` on
  desktop and landscape tablets, `--p` on phones and portrait tablets. A short
  screen gets a smaller picture, never a longer cover. If you add a line to
  the cover's foot, raise the fixed-pixel figure in the `--p` or `--u` formula
  by its height.

## Deployment

The Vercel project `makeyourmindup` serves makeyourmindup.ai (the apex redirects
to www). The cover went live on 25 September 2026 through a production
deployment created with `rootDirectory: apps/cover` for that deployment only.

Root Directory is `apps/cover` on the Vercel project, so a push to `main`
builds and deploys the cover by itself. Pushes to other branches build previews.

Rollback is one action in Vercel: promote the previous production deployment.
The Cannes funnel's last deployment is `dpl_4C3o6boULM69QUQY98UNq35R58oi`.

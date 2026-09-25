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
| `brand/` | The two Canva exports every logo file is derived from |
| `public/brand/`, `app/icon.png`, `app/apple-icon.png` | Derived logo files. Regenerate with `npm run assets` |
| `substack-kit/` | The Substack refresh kit: paste-in copy and images. See its own README |
| `scripts/` | Asset derivation, kit rendering and screenshots |

## Everyday changes

- **A platform goes live:** put its URL in `content/config.json` under
  `platforms`. The tile flips from "At the printers" to live on the next build.
- **A call is published:** add it to `scoreboard.calls` in `content/config.json`
  with `statement`, `due`, `confidence`, `status` (`open`, `held`, `broke` or
  `unclear`) and optionally `href`. Only Krish rules a call.
- **The first issue lands:** change `cover.issue` in `content/site.json`.
  Pieces appear on the cover by themselves once they are on the Substack.
- **Substack moves to its own domain:** change `substackUrl` and `feedUrl`.
- **Hide the scoreboard:** set `scoreboard.show` to `false`.

## Checks

```
npm ci
npm run verify     # kill list over the copy, type check, production build
npm run shots      # screenshots at 390px and 1440px into .shots/, server on :3100 first
npm run kit        # re-render the Substack kit and the social card
npm run assets     # re-derive every logo file from brand/
```

## Rules this page keeps

- No em dashes, no exclamation marks, British English, reading age 12.
- The channel speaks as "we", to "you". Krish is the byline.
- No Mindmake or CTRL anywhere on the page, and no retired name.
- No contact address and no stored reader responses: both are open decisions in
  the media kit.
- No invented numbers. The scoreboard shows zeros until a real call is ruled.
- Every diagram is labelled as an illustration.

## Deployment

The Vercel project `makeyourmindup` builds this folder (Root Directory
`apps/cover`) and serves makeyourmindup.ai. Rollback is one action in Vercel:
promote the previous production deployment.

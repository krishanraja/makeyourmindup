---
kill_list_scope: canon
---
# Substack refresh kit

Everything the Substack needs to match the cover. Nothing here posts itself:
Krish pastes it in. The copy lives in `COPY.md`, which the kill list scans
(`npm run kill-list`). This README is marked canon because it quotes the old
tagline in order to remove it.

## Why it exists

As of 2026-09-25 the Substack is titled makeyourmindup, but its short
description reads "Build your edge in the AI era.", which fails the repo kill
list (`in the AI era` is a preach pattern). The About page still carries
themindmaker.ai and a retired wordmark (`project-documentation/02_REPO_BRIEF.md`,
fleet-wide staleness). The cover sends every reader there, so the hub has to
match the front door.

## The images

| File | Where it goes in Substack settings | Size |
|---|---|---|
| `images/logo-1024.png` | Publication logo | 1024 square, the block mark on ink |
| `images/wordmark-ink-1344x256.png` | Wordmark, if the site background stays light | 1344 x 256 |
| `images/wordmark-transparent-1344x256.png` | Wordmark, if the site background is set to ink | 1344 x 256, transparent |
| `images/cover-1200x1200.png` | Publication cover image | 1200 square |
| `images/email-banner-1100x220.png` | Email banner | 1100 x 220 at 2x |
| `images/social-preview-1200x630.png` | Social preview image | 1200 x 630 |

Sizes follow Substack's own guidance: logo at least 256 square, wordmark
1344 x 256, cover at least 600 square, email banner 1100 x 220, social preview
1200 x 630. Re-render with `npm run kit`.

## Colours, if Substack's theme settings allow them

- Accent: mint `#7EF0C0`
- Background, to feel like the cover: ink `#0C1512`, with the transparent wordmark
- Background, to stay light: cream `#F4EFE4`, with the ink wordmark

## Steps

1. Publication name: `makeyourmindup`.
2. Short description: the line under "Short description" in `COPY.md`.
3. Upload the six images above.
4. Replace the About page with the About section of `COPY.md`, and remove every
   mention of themindmaker.ai, the 30 Under 30 line and the old wordmark.
5. Replace the welcome email with the one in `COPY.md`.
6. Leave the old posts where they are. The cover only lists posts published on
   or after the relaunch date in `content/config.json`.

## Custom domain

Not part of this kit. The cover reads the Substack address from
`content/config.json`, so moving Substack to its own subdomain later is a
one-line change there.

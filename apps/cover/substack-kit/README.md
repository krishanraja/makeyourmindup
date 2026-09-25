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
list (`in the AI era` is a preach pattern). The About page still opens with the
old introduction. The "30 Under 30" and themindmaker.ai lines are not on the
About page at all: they sit in Krish's personal Substack profile bio, which
shows beside every post and on the About page. The cover sends every reader
there, so the hub has to match the front door.

## The images

| File | Where it goes in Substack | Size |
|---|---|---|
| `images/logo-1024.png` | Website editor, Header, Logos: logo | 1024 square, the block mark on ink |
| `images/wordmark-transparent-1344x256.png` | Website editor, Header, Logos: wordmark, while the site background is dark | 1344 x 256, transparent |
| `images/wordmark-ink-1344x256.png` | The same slot, only if the site background is switched to light | 1344 x 256 |
| `images/cover-1200x1200.png` | Website editor, Welcome page, Image | 1200 square |
| `images/email-banner-1100x220.png` | Settings, Emails, Email header & footer: banner | 1100 x 220 at 2x |
| `images/social-preview-1200x630.png` | Per post, not a setting: post Settings, Social preview, Upload New, for a post with no image of its own | 1200 x 630 |

Substack builds the publication's own share card from the logo, name and short
description, so there is no publication-level social image to upload.

Sizes follow Substack's own guidance (help centre, checked 2026-09-25): logo
at least 256 square, wordmark 1344 x 256, cover at least 600 square, email
banner 1100 x 220, social preview at least 1200 x 630. Re-render with
`npm run kit`.

## Colours, if Substack's theme settings allow them

Website editor, Home page, Colors. On 2026-09-25 the live values were a dark
teal background `#042f2e` and a green accent `#059669`.

- Accent: mint `#7EF0C0`
- Background, to feel like the cover: ink `#0C1512`, with the transparent wordmark
- Background, to stay light: cream `#F4EFE4`, with the ink wordmark

## Steps

Settings live at `https://mindmakerlive.substack.com/publish/settings`; the
website editor at `https://mindmakerlive.substack.com/publish/website-editor/home`.

1. Publication name: already `makeyourmindup`. Leave it.
2. Settings, Basics, Short description: the line under "Short description" in
   `COPY.md`.
3. Website editor: logo, wordmark, colours and welcome page image, per the
   tables above.
4. Settings, Website, Edit next to About page: delete everything and paste the
   About section of `COPY.md`.
5. Settings, Emails, Edit next to Email header & footer: upload the banner,
   then send a test email.
6. Settings, Emails, Edit next to Welcome email to free subscribers: the
   welcome email in `COPY.md`. Leave the paid, imported and founding ones.
7. `https://substack.com/profile/edit`, Bio: the profile bio in `COPY.md`. This
   is where the 30 Under 30 and themindmaker.ai lines live.
8. Leave the old posts where they are. The cover only lists posts published on
   or after the relaunch date in `content/config.json`.

## Custom domain

Not part of this kit. The cover reads the Substack address from
`content/config.json`, so moving Substack to its own subdomain later is a
one-line change there.

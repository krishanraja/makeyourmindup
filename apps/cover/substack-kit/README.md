---
kill_list_scope: canon
---
# Substack refresh kit

The Substack kit, on the v5 brand (locked 2026-11-25). Nothing here posts itself:
Krish pastes it in. The copy lives in `COPY.md`, and the paid-tier copy in
`PAID.md`, both scanned by the kill list (`npm run kill-list`). This README is
marked canon because it quotes the old tagline in order to remove it.

## Why it exists

As of 2026-09-25 the Substack is titled makeyourmindup, but its short
description reads "Build your edge in the AI era.", which fails the repo kill
list (`in the AI era` is a preach pattern). The About page still opens with the
old introduction. The "30 Under 30" and themindmaker.ai lines are not on the
About page at all: they sit in Krish's personal Substack profile bio, which
shows beside every post and on the About page. The cover sends every reader
there, so the hub has to match the front door.

## The images

The images are the v5 Channel art, not files in this folder. The retired
images that used to sit in `images/` (the block mark logo, the old wordmarks,
the 1100 x 220 email banner, the welcome image, the theatre social preview and
the editor photo) are removed and must not be uploaded. Take every image from
Google Drive, `makeyourmindup > 1 Brand kit (permanent) > Channel art` (folder
id `1FVfcoSMT3DCzvyvsq0KHdSgr8JTzRBIe`), which is
the `Channel art/` folder of `brand-kit/makeyourmindup-brand-kit.zip` in this
repository (built by `scripts/brand-kit-v5/build.py`).

| File in Channel art | Where it goes in Substack | Size |
|---|---|---|
| `substack-logo-1024.png` | Website editor, Header, Logos: logo | 1024 square, the icon on ink |
| `substack-wordmark-wide-1344x256.png` | Website editor, Header, Logos: wordmark (wide logo) | 1344 x 256, the ink wordmark on a transparent ground |
| `substack-cover-1200x1200.png` | Website editor, Welcome page, Image (cover photo) | 1200 square |
| `substack-email-banner-2200x440.png` | Settings, Emails, Email header & footer: banner, the one masthead on every email | 2200 x 440, so 1100 x 220 at 2x |
| `social-card-1200x630.png` | Per post, not a setting: post Settings, Social preview, Upload New, for a post with no image of its own | 1200 x 630 |

The short description is in `COPY.md`; `bios-and-descriptions.txt` in the same
Drive folder holds the same line. `how-they-crop.jpg` shows what each platform
crops.

Substack builds the publication's own share card from the logo, name and short
description, so there is no publication-level social image to upload. The
Edition's current site share card is generated at `/opengraph-image`.

Sizes follow Substack's own guidance (help centre, checked 2026-09-25): logo
at least 256 square, wordmark 1344 x 256, cover at least 600 square, email
banner 1100 x 220, social preview at least 1200 x 630.

## Colours, if Substack's theme settings allow them

Website editor, Home page, Colors. On 2026-09-25 the live values were a dark
teal background `#042f2e` and a green accent `#059669`.

- Accent: mint `#7EF0C0`
- Background: cream `#F4EFE4`, which the v5 wide logo (ink on transparent) is
  made for. On a dark background the wide logo does not show; leave the
  background light.

## Steps

Settings live at `https://home.makeyourmindup.ai/publish/settings`; the
website editor at `https://home.makeyourmindup.ai/publish/website-editor/home`.

1. Publication name: already `makeyourmindup`. Leave it.
2. Settings, Basics, Short description: the line under "Short description" in
   `COPY.md`.
3. Open Drive, `makeyourmindup > 1 Brand kit (permanent) > Channel art`, and
   download the files named in the table above. Website editor: upload
   `substack-logo-1024.png` as the logo, `substack-wordmark-wide-1344x256.png`
   as the wordmark and `substack-cover-1200x1200.png` as the welcome page
   image, then set the colours above.
4. Settings, Website, Edit next to About page: delete everything and paste the
   About section of `COPY.md`.
5. Settings, Emails, Edit next to Email header & footer: upload
   `substack-email-banner-2200x440.png` from the same Drive folder, then send a
   test email.
6. Settings, Emails, Edit next to each welcome email: free from `COPY.md`,
   paid from `PAID.md`, and founding as paid plus its extra line (Substack
   sends founding members the paid email by default). Leave the imported one.
7. Settings, Payments, Subscription benefits: the lists in `PAID.md`. On
   2026-09-25 Substack's defaults were live, promising free readers only
   "Occasional public posts", which contradicts the cover.
8. No person is the byline. Every piece is the publication's, never authored
   by a person, and no face sits beside the byline (Ruling, Krish, 2026-10-28:
   "Remember, no content refers to Krish, ever. I still see that popping up
   from time to time. Even articles written are not authored by Krish. My face
   only, for assets and the video format."; Krish picked D3: "Drop it"). So
   this kit no longer writes a profile bio or photo, and his own profile at
   `https://substack.com/profile/edit` stays his own (Krish picked D2: "No,
   personal stays personal"). What makes a post show a person, a name or a
   face (bylines, the author shown on each post, the copyright line, the email
   sender name) is in Substack's settings, which only Krish changes.
9. Leave the old posts where they are. The cover only lists posts published on
   or after the relaunch date in `content/config.json`.

## Custom domain

Not part of this kit. The cover reads the Substack address from
`content/config.json`, so moving Substack to its own subdomain later is a
one-line change there.

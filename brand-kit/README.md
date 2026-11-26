# makeyourmindup brand kit, v5


**Download:** `makeyourmindup-brand-kit.zip` in this folder holds all of it. Krish's PC unpacks it into Drive,
`makeyourmindup > 1 Brand kit (permanent)`, within the hour of a change reaching main (content-engine
`scripts/library-sync.ps1`). Package it with `python scripts/brand-kit-v5/build.py --content-engine <checkout> --channel-art <Drive Channel art>`;
`preview.png` is its YouTube banner.

Krish locked the v5 look on 25 November 2026 ("s3h is great, lock v5"). Everything older is retired and must not be used:
the gift-box and splashes marks, the felt robot, painted scenes, the day colours and pills, the series names, IBM Plex
Mono, the v1.5 brand book, the old intro sting and the YouTube watermark. Retired files are in Drive under
`makeyourmindup > _Archive`, each folder labelled retired.

**The promise:** AI news for the creative industries, every morning.
**The motto:** Creativity, AI and money, simplified.

## The rules that matter most (Krish, 25 Nov 2026, content-engine docs/ve/cards/library/ONE-MARK.md)

1. "There should only be one of these wordmarks on any given artifact or page, and the headline should only appear once
   on any given medium." Banners carry the climb on grained ink and S3h, with no text line; the headline lives in each
   platform's bio.
2. The wordmark lives on ink only. S3h, the square lockup with the icon as the O, is every profile picture (YouTube,
   Instagram, the Facebook Page; Krish, 26 Nov: "Yes insta too"). The Substack logo is the icon.
3. Ink is the page, always with 7% grain. Mint is the answer and the one accent. No badges, no watermark.
4. makeyourmindup never names Krish, mind/make, Mindmake or CTRL, and never says "AI Brain". The one exception is the
   Saturday email's signed footnote.
5. No em dashes.

All makeyourmindup art comes from content-engine's v5 Library (`docs/ve/cards/library/`). This kit packages it; it draws
nothing of its own.

## What is inside

| File | What it is |
|---|---|
| `logos/makeyourmindup-square.svg` | S3h, the square lockup: MAKE YOUR MIND/UP stacked, with the icon as the O, on its own grained ink. Every profile picture and square slot. |
| `logos/makeyourmindup-icon.svg` | The icon: the split circle, cream and mint. Favicons, app icons, the Substack logo. |
| `logos/makeyourmindup-wordmark.svg` | The wordmark (W0): cream with UP in mint, for ink only. |
| `logos/makeyourmindup-horizontal.svg` | Icon and wordmark on one line (V9), for ink only: mastheads and email banners. |
| `logos/*.png` | Plain exports of those marks: the icon on ink and transparent, the horizontal lockup and S3h. |

Retired from logos: v4-ink, v9-ink, v10, v10-ink, v6, v6-ink: the on-light variants and the stacked lockups.

| File | Family | Use |
|---|---|---|
| `fonts/Anton-Regular.ttf` | Anton | Cover and video headlines, one face per headline |
| `fonts/Archivo-Variable.ttf` | Archivo | Structure and video captions |
| `fonts/Fraunces-Upright-Variable.ttf` | Fraunces | Site and share-card headlines, the human line |
| `fonts/Fraunces-Italic-Variable.ttf` | Fraunces Italic | The motto and asides |
| `fonts/DMMono-Regular.ttf` | DM Mono | Labels, data, sources, timestamps |
| `fonts/DMMono-Medium.ttf` | DM Mono Medium | Labels that need weight |

The licences are beside the fonts (SIL Open Font License). `colours/` holds every colour and its one job.

`Channel art/` is the Library's profile set, copied byte for byte from Drive and checked against its `MANIFEST.sha256`.
Its `00 WHICH FILE GOES WHERE` note says which file goes on which platform. It holds:

- `Channel art/bios-and-descriptions.txt`
- `Channel art/facebook-cover-1640x856.png`
- `Channel art/how-they-crop.jpg`
- `Channel art/profile-picture-1080.png`
- `Channel art/social-card-1200x630.png`
- `Channel art/substack-cover-1080.png`
- `Channel art/substack-email-banner-2200x440.png`
- `Channel art/substack-logo-1024.png`
- `Channel art/substack-wordmark-wide-1280x256.png`
- `Channel art/x-header-1500x500.png`
- `Channel art/youtube-banner-2560x1440.png`

Music is not in this kit: it stays in Drive in `1 Brand kit (permanent) > Music`, where the video engine reads it.

Packaged by `scripts/brand-kit-v5/build.py` in krishanraja/makeyourmindup.

---
kill_list_scope: canon
---
# The email signature banner

v5, 26 November 2026, on the look Krish locked on 25 November. It replaces the
October strip (the old mark, the old tagline and the days), which is retired.

- `../../public/brand/email-signature-banner.png`: a slim makeyourmindup strip
  for the foot of Krish's email signature, 1040 x 160 (520 x 80 at 2x). It
  shows the v5 horizontal lockup on ink with grain and the motto, "Creativity,
  AI and money, simplified.", in Fraunces italic. It is served at
  https://www.makeyourmindup.ai/brand/email-signature-banner.png, the address
  the signature uses, so it keeps that path and that size.
- `banner.html`: its source. To render it, put the brand kit's
  `logos/makeyourmindup-horizontal-on-dark.svg` and
  `fonts/Fraunces-Italic-Variable.ttf` beside it (from
  `brand-kit/makeyourmindup-brand-kit.zip`, or content-engine's
  `assets/brand/makeyourmindup/v5/v9.svg` and
  `assets/fonts/makeyourmindup/`), open it in Playwright's Chromium with a
  520 x 80 viewport and a device scale factor of 2, wait for the font, and
  screenshot the `#banner` element.

The signature itself, its install steps and a preview live in Google Drive
under `04_Content > Sales Materials > Email signature`
(`krishanraja/content-engine`, `docs/DRIVE.md`).

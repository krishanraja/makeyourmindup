# makeyourmindup.ai mock v2: build it from UX-PLAN.md

Write only inside mock/v5-cover/. Do not commit. Do not launch a browser (the host renders).

Krish's feedback on v1: "I see no value in two makeyourmindup wordmarks, surely the heading should be better? Also, what from the current site should be carried over? Also plan out the UI and UX". The plan answering him is mock/v5-cover/UX-PLAN.md. Build exactly that plan as a clickable static mock, replacing index.html. Keep v1 as index-v1.html for reference.

## Files
- **index.html:** the cover with all seven bands, the subscribe sheet, and every state in the plan's "States" section through `?state=`:
  - fresh, stale, feed-down, one, two;
  - nocover, longtitle, nowatch;
  - sub-empty, sub-invalid, sub-sent, nojs (render with scripting disabled);
  - reduced (prefers-reduced-motion).
  - Keep the `?grid=1` overlay.
- **members.html:** the locked, wrong-code, unlocked and no-code states.
- **legal.html:** the privacy page in the reading layout. Take the copy verbatim from apps/cover/content (privacy) with the placeholders filled as lib/legal.ts does.
- **404.html.**
- **render.py:** update it to capture every page and state at 390 and 1440, and the cover also at 320, 768, 1024 and 1920. Keep the anonymous_driver pattern and never use page.route. Capture "this week" and "recent" with the sheet open and closed, and one Recent panel open. Write the PNGs to mock/v5-cover/out/.

## Content
- This week's card one is the real piece: "Why did pop songs get shorter?", MON · FOLLOW.THE.MONEY, with the Fraunces line "Spotify counts a stream at 30 seconds. Songwriters noticed." All other cards and Recent panels use bracketed slot text ("[Piece title]", "[One line]", "[Date]").
- Series names are follow.the.money (Mon), under.the.hood (Wed) and mind.the.gap (Fri).
- Photos come from assets/photos/ using the focal boxes in library.json.
- The FAQ answers must be plain and true, from what the site does today:
  - "A publication that takes AI claims apart, one why at a time."
  - "Three pieces a week, Monday, Wednesday and Friday."
  - "Yes. Free to read."
  - "Every piece shows its evidence and how strong it is."
  - "Reusable files from the pieces, behind a code."
  - Run every line past the house rules: no em dashes, no exclamation marks, British spelling.
- No copy names a person. No Mindmake, Mindmaker or CTRL outside the legal note.

## Must hold
- The header carries V9 once. The hero heading is Anton text ("WE TAKE AI CLAIMS APART, ONE WHY AT A TIME."), not the S3h artwork. s3h.svg must not appear on the site.
- The subscribe form is a GET to https://home.makeyourmindup.ai/subscribe with the field named email, target _blank, and works with JavaScript off.
- No analytics, trackers or cookies.
- The 12-column grid and shared left edge from the plan. Every band label, card, timeline row, question card and footer line starts on the same edge.
- Motion is one ease, plays once, rests, and honours reduced motion. No scroll-jacking, parallax or cursor effects.

Report:
- the files;
- the states;
- anything in the plan you could not build.

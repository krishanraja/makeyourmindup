# makeyourmindup.ai cover page, v5 mock: build brief

Write files only inside mock/v5-cover/. Do not commit. Do not launch Chromium (the host renders). This is a static mock that will later replace apps/cover's home page (app/page.tsx). Read apps/cover/app/page.tsx and its components so you know what the live page carries today: Cover, Contents, Newsstand, Platforms, StaffBox, Marquee, StickyBar, PanelSheet and Footer.

## Krish's brief
"mock up the makeyourmindup.ai cover page to be a lot simpler and more premium with this new rebrand". His rulings on the look also apply: "it all needs to work in tandem", and "we need to think about all the edge cases and repeatable usability". He flagged a page that "does not look good in terms of alignment". The first draft (library.json item web-desktop) had:
- the first card's title indented relative to the other cards;
- the header wordmark not aligned with the name block;
- photo crops showing bare cloth.

None of that may repeat.

## The locked v5 look
- **Colour:** ink #0C1512 with 7% grain, cream #F4EFE4 and mint #7EF0C0 (the answer; the one primary button). Coral #FF6A4D, butter #FFD84D and lilac #B7A6FF code the climb.
- **Type:** Anton (one loud line, uppercase), Fraunces (SOFT 50, WONK 0; italic for the contested) and DM Mono (labels and sources). The fonts are in assets/fonts/.
- **Icon and wordmark:** use only the files in assets/marks/:
  - d-face-off.svg is the icon;
  - V9 (v9.svg) is the wide header lockup;
  - s3h.svg is the name with the D as the O in YOUR.
- **Photos:** in assets/photos/, with focal boxes in library.json (photos.<name>.focus). Every crop must show its focal box. Photos burn into ink; the burn is the only gradient. No shadows, stickers, badges, marquees or gradients otherwise.
- **Copy:** says the fact plainly. No em dashes, no exclamation marks, British spelling.
- **Subscribe:** the subscribe route is https://home.makeyourmindup.ai/subscribe. The form is a mock with no submission.

## The page: one screen, nothing else
1. **Header:** V9 at left and one mint "Subscribe" button at right. Both sit on the same top margin, and their vertical centres align.
2. **Hero:** the name (s3h.svg) large at left. At right, on the same top line, the line "Who gets paid. What's real. Where the pitch and the product part ways." in Fraunces.
3. **"This week":** a DM Mono label, then the week's three pieces as three equal cards, each with:
   - a photo crop showing its focal box, 4:3;
   - a thin rung-colour bar in coral, butter and lilac in climb order;
   - the Anton title, left-aligned to the card's left edge, at most 3 lines;
   - one Fraunces line;
   - a DM Mono date.

   Use "Why did pop songs get shorter?" for card one. Cards two and three use clearly bracketed slot text.
4. **Subscribe:** one email field with the mint Subscribe button, and a DM Mono line beneath: "Three pieces a week, one email."
5. **Footer:** one line in DM Mono with About, Members and Privacy, and the icon.

## Alignment system (the point of this mock)
- One 12-column grid with fixed outer margins: 64 px desktop, 20 px mobile. Every element starts on a column edge.
  - The header V9, the hero name, the "This week" label, every card's photo and title, the subscribe field and the footer share the same left edge.
  - The right edges also align.
- An 8 px baseline rhythm for vertical spacing. Section gaps are 96 px desktop and 56 px mobile.
- Card titles align to their card's left edge and to each other's top line, whatever their length.
- Add a debug toggle (?grid=1) that overlays the columns and baseline, so the host can check alignment.

## Edge cases the page must handle (render each as its own state with ?state=)
- `long`: a 3-line card title, a 2-line Fraunces line, and a very long single word in a title (hyphenate or break cleanly, never overflow).
- `one`: only one piece this week, so the cards row adapts without a hole.
- `nophoto`: a piece with no photo. Use a flat rung-colour block with the ink Anton title, never a broken image.
- `error`: the subscribe form's error and success states (copy: "Check the email address." and "You're in. The next one lands in your inbox.").
- `narrow`: 320 px wide.
- `wide`: 1920 px wide; the content caps at 1440 px, centred.
- Keyboard focus is visible on every link and button (a 2 px mint outline). Contrast is at least 4.5:1.

## Deliverables
- **mock/v5-cover/index.html:** one self-contained page (CSS inline, relative asset paths) with the states above.
- **mock/v5-cover/render.py:** a Windows-safe Playwright capture, copying the anonymous_driver pattern from C:\Users\krish\dev\mindmake\ce-cards\look-why-ladder-concept\docs\ve\cards\library\render.py exactly, never page.route. It renders, to mock/v5-cover/out/:
  - desktop 1440 x 900 and full page;
  - mobile 390 x 844 and full page;
  - each state;
  - the ?grid=1 overlays.
- **mock/v5-cover/NOTES.md:** the grid values, and what was removed from today's page and why (simpler).

Report the files and states built.

# Mock v2: alignment of the hero photo and the Recent panels

Edit only inside mock/v5-cover/. Do not commit. Do not launch a browser. Krish's standing complaint is alignment, so these must be exact.

1. **Hero photo.** At 1440 px:
   - It stops short of the right content edge (about x 1280 instead of 1376).
   - It does not span columns 7 to 12.
   - It has no burn.
   - It repeats the first This week card's photo (still-record-phone).

   Fix:
   - It spans columns 7 to 12 exactly: its left edge on column 7's start and its right edge on the content's right edge (the same x as the header's Subscribe button's right edge).
   - Its top sits on the heading's cap top, and its bottom on the "Free to read" line's baseline.
   - It burns into ink on its left side only.
   - Use evo-cover (the table under the lamp), with its focal box visible.
   - Check at 1024 and 1920 too.
2. **Recent panels.** The five panels' photos have different heights. Panels 02 and 05 show a short strip of photo over empty ink.
   - Every panel's photo fills the panel's full height with object-fit cover on its focal box.
   - It burns to ink over the bottom 45%, where the number and title sit.
   - All five panels share one top edge, one bottom edge and one title baseline.
   - The same applies in the open state and on mobile, where the panels become a list of 4:3 rows.
3. **Check alignment with ?grid=1** at 1440 and 390, and capture those again in render.py.

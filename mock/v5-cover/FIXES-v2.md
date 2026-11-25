# Mock v2: three fixes from the host render

Edit only inside mock/v5-cover/. Do not commit. Do not launch a browser.

1. **Hero right half.** At 1440 px the hero uses only the left half, and the right half is empty ink, which reads unfinished. Put this week's lead piece photo (still-record-phone, focal box visible) on the right half: columns 7 to 12, top aligned with the heading's cap top, bottom aligned with the "Free to read" line, burning into ink on its left edge so it meets the text column with no hard edge. Use no type on the photo. On mobile the photo sits under the form at full width, 4:3. It should feel calm: no motion except a one-time 480 ms fade in.
2. **Card titles in Anton must be uppercase**, as the house rule says. Today "Why did pop songs get shorter?" is in sentence case. Apply text-transform uppercase to every Anton title (This week, Recent, the 404 and members), and re-check that the long-title state still fits in 3 lines.
3. **Recent panels** are empty grey boxes. Each panel shows:
   - a photo from assets/photos/ (cycle evo-topdown, evo-specimens, still-timer, still-jukebox and evo-cover, each showing its focal box), burned into ink at the bottom;
   - the "0n / 05" number and the Anton title in uppercase on the burnt ink.
   - When narrowed, the title runs vertically, bottom to top.
   - The open panel shows its Fraunces line and "READ IT".
   - The nocover state for a panel is the flat rung-colour block.

Then update render.py's captures if anything moved.

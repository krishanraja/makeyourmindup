# Mock v2: the long-title state overflows at 390 px

Edit only inside mock/v5-cover/. Do not commit. Do not launch a browser.

The host render now stops on `AssertionError: v2-index-longtitle-390`, from render.py's own checks. Card titles became uppercase Anton, and the long-title state (including the very long single word) no longer fits a 390 px card. That causes horizontal overflow or a title beyond 3 lines.

Fix it in the CSS fit rules, not in the state's content:
- Uppercase Anton titles step down in size on narrow cards. Use clamp with a sensible minimum, about 24 px at 390.
- A very long single word breaks with `overflow-wrap: anywhere` and `hyphens: auto` (lang en-GB), and never overflows the card.
- The title stays at 3 lines maximum. If it would need a 4th, the build's content check refuses it, as the Library's content contract says (never truncate).
- Check the same at 320 px.

Also make render.py collect every failing capture and report them all at the end, instead of stopping at the first. Keep the assertions.

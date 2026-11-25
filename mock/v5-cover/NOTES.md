# Cover mock v2

Open index.html from disk. The initial HTML contains the complete fresh cover and the native Substack form. The header link also works with scripting disabled.

## Review links

Use index.html?state= followed by fresh, stale, feed-down, one, two, nocover, longtitle, nowatch, sub-empty, sub-invalid, sub-sent, nojs or reduced. Stale displays the last good fixture silently. Disable scripting in the viewer for nojs. Add &grid=1 to inspect the columns and baseline. The host renderer sets the actual scripting and motion preferences.

Use members.html?state=locked, wrong-code, unlocked or no-code to inspect the gate and the four-piece dossier. The unlocked view is a public layout fixture with links to the existing protected file routes. The mock accepts no credentials. The live server owns authentication and cache headers.

Privacy is legal.html. Terms is terms.html. The missing-page preview is 404.html. index-v1.html retains the previous cover.

## Host captures

Run python render.py from this directory on the rendering host with Playwright and Chromium installed. New captures use the v2- prefix in out/. Earlier PNGs are v1. Captures run offline and never submit an email. The interactive forms do open Substack if a visitor submits one.

The lead story has no verified article or video permalinks in the supplied source. Its links lead to the Substack archive search, YouTube videos and Shorts. The remaining story slots link to the archive. The static pages use local editorial fixtures. Live feed fetching, catalogue joins, private file delivery, server headers and production kit integration belong to the approved application build.

---
kill_list_scope: canon
---
# Video rendering: use content-engine's video engine, do not install HyperFrames

Prepared 2026-11-15 in answer to a request to evaluate HeyGen's HyperFrames for
branded video components (intros, outros, animated headlines, branded
transitions, typography) and to integrate the smallest rendering route that is
justified. It is a recommendation for Krish. It closes no decision the media kit
marks OPEN, changes no setting and deploys nothing.

## The call

This repository installs no renderer. Branded video components are made by
content-engine's video engine (ve: Remotion 4.0.518, in `apps/renderer` there),
which already draws this repository's brand kit. HyperFrames is not installed
here and is not proposed as a second runtime in content-engine. Its motion
rules already reached ve as numbers and behaviour, which is the part of it
worth having.

## Why

1. **Ownership is ruled.** Ruling (Krish, 2026-10-28): "Content-engine produces
   content for makeyourmindup.ai, which is hosted at makeyourmindup repo".
   content-engine's `AGENTS.md`: it "owns content production and all
   production standards, including carousel narrative, copy, design, rendering
   and creative QA". This repository builds no pipeline (`AGENTS.md`, "Rules
   before plumbing").
2. **ve already covers the list.** See the table below.
3. **HyperFrames was read for ve two days ago.** content-engine's
   `docs/ve/sources/openmontage.md` (13 Nov 2026) took HyperFrames' energy-tiered
   transitions, multi-phase camera and beat-slam timings into ve, and lists
   "the HyperFrames runtime (ve stays on Remotion)" under what it does not take.
4. **Two of the requested components meet a ruling or an open decision.**
   - Intros: Ruling (Krish, 2026-11-12): "Nothing before the hook, ever. Remove
     the sting exception for good." ve refuses a sting or an episode card in
     front of the hook at compile, lint, render and QC.
   - A name per format on shorts is OPEN in the media kit ("Whether shorts carry
     a name per format", settled by the dry runs). A per-format branded intro or
     bumper would close it by default.
5. **The two-to-four-hours rule.** A second renderer means a second set of
   brand components to keep in step, a second QC route and a second thing for
   Krish to sign. It adds to his time per piece and removes none.

| Requested | Where ve already has it (content-engine) |
|---|---|
| Intros | Retired by the 12 November ruling. The hook is the opening |
| Outros | The house close, "Built to help you decide.", masthead, the three days, "Subscribe free", the address (`docs/production/CLOSING.md`, `chrome/EndingBand.tsx`) |
| Animated headlines | The `headline` device (Anton lines, a swipe in the section colour, the Fraunces dek), `slam_word`, `kinetic_stat`: 39 devices in all (`engine/devices/`) |
| Branded transitions | `style.transitions`: cut, whip, push, zoom-through, flash, punch, with camera and energy chosen apart (`docs/ve/INGREDIENTS.md`; built 13 Nov, proved on a test cut, not yet on a piece) |
| Typography | Anton, Archivo, Fraunces and IBM Plex Mono in fixed roles (`config/ve/design-lock.json`, `config/ve/brand-tokens.json`) and 27 caption styles |

## What HyperFrames is

Read on 2026-11-15 from github.com/heygen-com/hyperframes at commit `490199c`
(15 Nov 2026), in a scratch clone. Nothing was run from it.

- HTML, CSS and seekable animation (GSAP, CSS, Lottie, Three.js, Anime.js,
  WAAPI) turned into MP4 by seeking each frame in headless Chrome (Puppeteer 25)
  and encoding with FFmpeg. Node 22 or later.
- Apache-2.0 and free. HeyGen sells a Pro plan for its Studio app's generative
  models, and runs cloud renders.
- About 450 registry blocks (titles, transitions, kinetic type, captions, charts,
  maps) installed as editable source, and nine agent skills.
- The CLI carries telemetry, which can be switched off.
- It moves fast: the CLI is v0.9.54 on main, and OpenMontage's commit of 8 Nov
  vendors its v0.7.17 skills.

Where it is stronger: its licence, its block catalogue, and HTML authoring that
any web skill can write. Remotion, which ve runs on, is free for a for-profit
organisation of up to three employees and needs a paid company licence above
that (`node_modules/remotion/LICENSE.md`); Apache-2.0 has no such tier. None of
the three is a gap ve has today for this brand.

## The options, ranked

| Option | Ownership | Build | Brand drift | Krish's hours | Licence | Rank |
|---|---|---|---|---|---|---|
| A. Use ve in content-engine | Fits the rulings | None: built | Low: one kit, logos pinned by sha256 | No change | Remotion's terms, already carried | 1 |
| B. HyperFrames beside Remotion in content-engine, motion graphics only | Fits, splits the renderer | High: a second compositing route and QC | Medium: two component sets | Up: a second set to sign | Apache-2.0 for that part | 2 |
| C. Port ve to HyperFrames | Fits | Very high: devices, caption styles, the close, gates, the engine freeze | Medium during the port | Up during the port | Removes Remotion's company tier | 3 |
| D. HyperFrames installed in this repository | Breaks the 28 October ruling | Medium | High: a second brand implementation | Up | Apache-2.0 | 4 |

## How the integration works today

```
makeyourmindup (this repository)           content-engine
  brand kit v1.5                    ->       config/studio.json, theme makeyourmindup-video-v1:
  (npm run brand-kit in apps/cover)          logo files pinned by sha256, colours, section colours
  scripts/qa/kill-list.mjs          ->       vendor/makeyourmindup/kill-list, pinned to a commit
                                                  |
                                  spec -> ve compile -> props -> ve render (Remotion, headless Chromium) -> MP4
                                                  |
                                  Krish signs; Growth posts through its approved route
```

Observed on 2026-11-15. These are evidence, not a second home for the values:
content-engine's `config/studio.json` holds them.

- The three logo files ve draws match this repository byte for byte:
  `apps/cover/public/brand/mark.png` (`4a451523`),
  `apps/cover/public/brand/masthead.png` (`5a0e8a08`), and the brand kit's
  `logos/horizontal/makeyourmindup-horizontal-transparent-1200w.png` (`46330374`).
- ve's colours (ink `#0C1512`, ink deep `#070D0B`, ink soft `#16221D`, cream
  `#F4EFE4`, mint `#7EF0C0`, and butter, lilac and coral for the three sections)
  equal the brand kit's `tokens/tokens.json` v1.5, as do its type roles, grain
  (0.07) and halftone (14 px).
- content-engine's copy of the kill list matches this repository's main on all
  three files.

So a logo re-cut here (`npm run assets` or `npm run brand-kit` in `apps/cover`)
changes bytes content-engine pins. It is re-pinned in content-engine's
`config/studio.json` in the same week, the way a kill list change is
re-vendored.

## The proof render

One branded component through content-engine's own render script
(`apps/renderer/scripts/ve-render.mjs`): a 9:16, five second under.the.hood
headline beat, then the house close.

- **Words.** The cover's own under.the.hood copy ("Real, or theatre?", "We take
  it apart.", "Every part gets a stamp, real or theatre") and the house close's
  ("Built to help you decide.", "Subscribe free", the three days). The kill list
  passed on every on-screen word before anything rendered.
- **Props.** `2026-11-15-video-rendering.props.json` beside this file, written
  by hand to ve's `EngineRenderProps` contract.
- **Renderer.** content-engine `ffda277`, Remotion 4.0.518, Chromium headless
  shell 1243, Node 22.23 in a cloud session (content-engine asks for Node 24;
  its tests passed on 22).
- **Output.** H.264, 1080 x 1920, 30 fps, 150 frames, 5.01 s, 560 KB. sha256
  `3828e7ef` with the test signal, `0dca3e44` for the review copy with the sound
  removed. The engine's sync check measured 42.7 ms and corrected it to 0.
- **Stills.** `2026-11-15-video-rendering.stills.jpg` beside this file. The
  MP4's frames against the PNG stills: SSIM 0.975 to 0.978.
- **Repeat.** Rendered again from the committed props by the steps below: SSIM
  0.9994 and PSNR 55.7 dB against the first render. Frames 0 to 3 are identical
  and later frames differ below visibility, so the render repeats within ve's
  own tolerance (key frame SSIM 0.75) but not bit for bit. The cause was not
  investigated.
- **content-engine's tests** for what the proof used passed here: the headline
  device, the close, the house golden, asset staging and the vendored kill list
  (5 files, 34 tests).

The first attempt put the headline on layout `F3`, whose slot starts at y 368,
and the headline was cut off at the top. `STAGE` fixed it. `ve compile` chooses
layouts for this reason: hand-written props are for proofs, never for a piece.

What the proof does not show. It is not a piece: no take and no picture plate.
It was not compiled, so the hook's corner identity that compile adds is absent.
Its sound is a pink noise test signal, because ve refuses a silent stem. No
separate reviewer has watched it. Nothing was published or filed.

## How to make a branded component

- **For a piece:** content-engine's ve route (`docs/ve/RUNBOOK.md` there):
  spec, `ve compile`, Gate 2 stills, Krish's sign-off, `ve render`. Nothing in
  this repository runs.
- **To repeat this proof,** from a content-engine checkout after `npm ci`, with
  `MYMU` set to a makeyourmindup checkout:

```bash
W=$(mktemp -d)
cp "$MYMU/docs/decisions/2026-11-15-video-rendering.props.json" "$W/props.json"
cp "$MYMU/apps/cover/public/brand/mark.png" "$MYMU/apps/cover/public/brand/masthead.png" "$W/"
unzip -p "$MYMU/brand-kit/makeyourmindup-brand-kit.zip" makeyourmindup-brand-kit/logos/horizontal/makeyourmindup-horizontal-transparent-1200w.png > "$W/horizontal-1200w.png"
ffmpeg -v error -f lavfi -i "anoisesrc=color=pink:seed=42:amplitude=0.03:sample_rate=48000:duration=5" -ac 1 "$W/test-stem.wav"
node apps/renderer/scripts/ve-render.mjs "$W/props.json" "$W/stills" --stills 6,30,75,105,149
node apps/renderer/scripts/ve-render.mjs "$W/props.json" "$W/out.mp4"
```

- **When the brand changes here:** rebuild the kit (`npm run brand-kit` in
  `apps/cover`), re-pin the logo files and their sha256 in content-engine's
  `config/studio.json`, and render Gate 2 stills there before a piece uses it.

## Dependencies

None added to this repository. The proof used content-engine's lockfile as it
stands (Remotion 4.0.518 and its bundled compositor), the Chromium headless
shell already on cloud sessions, and FFmpeg. No paid service and no account.
The only network use was the npm registry and two public git clones.

## What would change the call

- ve's transitions fail on a real piece and a HyperFrames block is the fastest
  fix: carry the block's behaviour into ve, as the 13 November reading did.
- Remotion's company licence becomes a real cost: then option C gets costed
  against it.
- Krish wants to author motion himself in a desktop app: HyperFrames Studio
  would be the candidate, and it has to clear the two-to-four-hours rule first.

## Counterpoints

- HyperFrames is Apache-2.0 and Remotion is not free above three employees. If
  that tier applies, staying on Remotion carries a running cost the port would
  remove.
- HyperFrames' catalogue is broader than ve's device list today. A block it
  ships in minutes can take ve a card.

## For Krish

Confirm or overrule: video rendering stays in content-engine's ve on Remotion,
and HyperFrames is installed in neither repository. If he overrules, the commit
that acts on it records `Ruling (Krish, YYYY-MM-DD): ...`.

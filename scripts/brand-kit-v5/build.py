#!/usr/bin/env python3
"""Package the makeyourmindup v5 brand kit: brand-kit/makeyourmindup-brand-kit.zip.

    python scripts/brand-kit-v5/build.py --content-engine PATH/TO/content-engine --channel-art PATH/TO/Channel art

This script draws no artwork. Krish's rulings of 25 Nov 2026 (content-engine docs/ve/cards/library/ONE-MARK.md) make the
v5 Library the only source of makeyourmindup art; on 26 Nov an earlier version of this script drew its own profile set and
broke them (banners with text lines, a retired stacked lockup, an off-ink wordmark). So:

- logos/ copies content-engine's v5 marks, on ink only: the icon, the wordmark (V4), the horizontal lockup (V9) and the
  square lockup S3h (the icon as the O). The on-light variants and the stacked lockups (V10, V6) are retired
  ("the wordmark lives on ink only"; S3h replaced V10). Its PNGs are plain exports of those marks.
- fonts/ copies content-engine's four v5 faces with their licences.
- Channel art/ is copied byte for byte from the given folder, which must be Drive's "1 Brand kit (permanent) >
  Channel art" (the Library's renders, kept by the session that uploads them). Every file listed in its MANIFEST.sha256
  must match, and nothing outside the manifest is taken.

Krish's PC's library sync (content-engine scripts/library-sync.ps1) unpacks the zip into Drive, so the zip and Drive
agree by construction. Needs Python 3.10+ and Playwright's Chromium for the mark PNGs.
"""
import argparse
import hashlib
import json
import shutil
import sys
import zipfile
from pathlib import Path

from playwright.sync_api import sync_playwright

REPO = Path(__file__).resolve().parents[2]
INK, INK_DEEP, CREAM, MINT = '#0C1512', '#070D0B', '#F4EFE4', '#7EF0C0'
CORAL, BUTTER, LILAC = '#FF6A4D', '#FFD84D', '#B7A6FF'
PROMISE = 'AI news for the creative industries, every morning.'
MOTTO = 'Creativity, AI and money, simplified.'

MARKS = {  # content-engine v5 file -> (kit name, what it is)
    's3h.svg': ('makeyourmindup-square.svg', 'S3h, the square lockup: MAKE YOUR MIND/UP stacked, with the icon as the O, on its own grained ink. Every profile picture and square slot.'),
    'd-face-off.svg': ('makeyourmindup-icon.svg', 'The icon: the split circle, cream and mint. Favicons, app icons, the Substack logo.'),
    'v4.svg': ('makeyourmindup-wordmark.svg', 'The wordmark (V4, `v4.svg`; the Library calls it W0): cream with UP in mint, for ink only.'),
    'v9.svg': ('makeyourmindup-horizontal.svg', 'Icon and wordmark on one line (V9), for ink only: mastheads and email banners.'),
}
RETIRED_MARKS = 'v4-ink, v9-ink, v10, v10-ink, v6, v6-ink: the on-light variants and the stacked lockups'
FONTS = [  # (file, family, role)
    ('Anton-Regular.ttf', 'Anton', 'Cover and video headlines, one face per headline'),
    ('Archivo-Variable.ttf', 'Archivo', 'Structure and video captions'),
    ('Fraunces-Upright-Variable.ttf', 'Fraunces', 'Site and share-card headlines, the human line'),
    ('Fraunces-Italic-Variable.ttf', 'Fraunces Italic', 'The motto and asides'),
    ('DMMono-Regular.ttf', 'DM Mono', 'Labels, data, sources, timestamps'),
    ('DMMono-Medium.ttf', 'DM Mono Medium', 'Labels that need weight'),
]
LICENCES = ['OFL-Anton.txt', 'OFL-Archivo.txt', 'OFL-Fraunces.txt', 'OFL-DM-Mono.txt']
SQUARE_RECTS = ('<rect width="700" height="700" fill="#0C1512"/>',
                '<rect width="700" height="700" filter="url(#grain)" opacity=".07"/>')


def sha(p: Path) -> str:
    return hashlib.sha256(p.read_bytes()).hexdigest()


def channel_art(src: Path, dst: Path) -> list[str]:
    """Copy Drive's Channel art exactly as its MANIFEST.sha256 lists it."""
    manifest = src / 'MANIFEST.sha256'
    if not manifest.is_file():
        sys.exit(f'{manifest} is missing: Channel art must come with its manifest')
    names = []
    for line in manifest.read_text(encoding='utf-8').splitlines():
        if not line.strip():
            continue
        digest, name = line.split(None, 1)
        name = name.lstrip('*').strip()
        f = src / name
        if not f.is_file() or sha(f) != digest:
            sys.exit(f'Channel art {name} does not match MANIFEST.sha256: re-sync Drive before packaging')
        names.append(name)
    dst.mkdir(parents=True)
    for name in names + ['MANIFEST.sha256'] + [p.name for p in src.glob('00 *.txt')]:
        shutil.copy2(src / name, dst / name)
    return names


def mark_pngs(logos: Path):
    """Plain PNG exports of the v5 marks, on ink or transparent."""
    grain = ('<svg style="position:absolute;inset:0;opacity:.07" width="100%" height="100%"><filter id="n"><feTurbulence '
             'type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 1  '
             '0 0 0 0 1  0 0 0 0 1  0 0 0 1 0"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>')
    def one(svg, w, h, box, ink):
        ground = f'background:{INK};' if ink else ''
        x, y, bw, bh = box
        return (w, h, f'<div style="position:relative;width:{w}px;height:{h}px;overflow:hidden;{ground}">{grain if ink else ""}'
                      f'<img src="{(logos / svg).as_uri()}" style="position:absolute;left:{x}px;top:{y}px;width:{bw}px;height:{bh}px"></div>')
    hw = 2400
    hh = round(hw * 90 / 930.684)
    out = {
        'makeyourmindup-icon-on-ink-1024.png': one('makeyourmindup-icon.svg', 1024, 1024, (212, 212, 600, 600), True),
        'makeyourmindup-icon-transparent-1024.png': one('makeyourmindup-icon.svg', 1024, 1024, (0, 0, 1024, 1024), False),
        'makeyourmindup-horizontal-2400w.png': one('makeyourmindup-horizontal.svg', hw, hh, (0, 0, hw, hh), False),
        'makeyourmindup-square-1080.png': one('makeyourmindup-square.svg', 1080, 1080, (0, 0, 1080, 1080), False),
    }
    page = logos / '_render.html'
    with sync_playwright() as p:
        b = p.chromium.launch()
        for name, (w, h, body) in out.items():
            pg = b.new_page(viewport={'width': w, 'height': h})
            page.write_text(f'<!doctype html><meta charset="utf-8"><style>*{{margin:0}}html,body{{background:transparent}}</style>{body}', encoding='utf-8')
            pg.goto(page.as_uri())
            pg.wait_for_function('[...document.images].every(i => i.complete && i.naturalWidth > 0)')
            pg.screenshot(path=str(logos / name), omit_background=True, clip={'x': 0, 'y': 0, 'width': w, 'height': h})
            pg.close()
        b.close()
    page.unlink()
    return list(out)


def write_text(kit: Path, art: list[str]):
    (kit / 'colours').mkdir()
    (kit / 'colours' / 'palette.txt').write_text('\n'.join([
        'makeyourmindup v5 colours. Each one has one job.', '',
        f'Ink        {INK}   the page, always with 7% grain',
        f'Ink deep   {INK_DEEP}   the deepest shadow',
        f'Cream      {CREAM}   reading colour and light sections',
        f'Mint       {MINT}   the answer; the one accent',
        f'Coral      {CORAL}   the climb: why 1',
        f'Butter     {BUTTER}   the climb: why 2',
        f'Lilac      {LILAC}   the climb: why 3', '',
        'Type on a colour block is always ink. Never a colour gradient, never gradient text.',
        'The only gradient is the burn: a photograph fading into ink.', '']), encoding='utf-8', newline='\n')
    tokens = {'ink': INK, 'ink_deep': INK_DEEP, 'cream': CREAM, 'mint': MINT, 'coral': CORAL, 'butter': BUTTER, 'lilac': LILAC,
              'fonts': {f[1]: f[0] for f in FONTS}}
    (kit / 'colours' / 'tokens.json').write_text(json.dumps(tokens, indent=2) + '\n', encoding='utf-8', newline='\n')
    marks = '\n'.join(f'| `logos/{n}` | {d} |' for n, d in MARKS.values())
    fonts = '\n'.join(f'| `fonts/{f}` | {fam} | {role} |' for f, fam, role in FONTS)
    arts = '\n'.join(f'- `Channel art/{n}`' for n in art)
    text = f"""# makeyourmindup brand kit, v5

Krish locked the v5 look on 25 November 2026 ("s3h is great, lock v5"). Everything older is retired and must not be used:
the gift-box and splashes marks, the felt robot, painted scenes, the day colours and pills, the series names, IBM Plex
Mono, the v1.5 brand book, the old intro sting and the YouTube watermark. Retired files are in Drive under
`makeyourmindup > _Archive`, each folder labelled retired.

**The promise:** {PROMISE}
**The motto:** {MOTTO}

## The rules that matter most (Krish, 25 Nov 2026, content-engine docs/ve/cards/library/ONE-MARK.md)

1. "There should only be one of these wordmarks on any given artifact or page, and the headline should only appear once
   on any given medium." Banners carry the climb on grained ink and S3h, with no text line; the headline lives in each
   platform's bio.
2. The wordmark lives on ink only. S3h, the square lockup with the icon as the O, is every profile picture (YouTube,
   Instagram, the Facebook Page; Krish, 26 Nov: "Yes insta too"). The Substack logo is the icon.
3. Ink is the page, always with 7% grain. Mint is the answer and the one accent. No badges, no watermark.
4. makeyourmindup never names Krish, mind/make, Mindmake or CTRL, and never says "AI Brain". The one exception is the
   Saturday email's signed footnote and its handwritten opener (growth-makeyourmindup `docs/V5-REBRAND.md`, section 3).
5. No em dashes.

All makeyourmindup art comes from content-engine's v5 Library (`docs/ve/cards/library/`). This kit packages it; it draws
nothing of its own.

## What is inside

| File | What it is |
|---|---|
{marks}
| `logos/*.png` | Plain exports of those marks: the icon on ink and transparent, the horizontal lockup and S3h. |

Retired from logos: {RETIRED_MARKS}.

| File | Family | Use |
|---|---|---|
{fonts}

The licences are beside the fonts (SIL Open Font License). `colours/` holds every colour and its one job.

`Channel art/` is the Library's profile set, copied byte for byte from Drive and checked against its `MANIFEST.sha256`.
Its `00 WHICH FILE GOES WHERE` note says which file goes on which platform. It holds:

{arts}

Music is not in this kit: it stays in Drive in `1 Brand kit (permanent) > Music`, where the video engine reads it.

Packaged by `scripts/brand-kit-v5/build.py` in krishanraja/makeyourmindup.
"""
    (kit / 'README.md').write_text(text, encoding='utf-8', newline='\n')
    shutil.copy(kit / 'README.md', kit / '00 START HERE - v5 brand kit (26 Nov 2026).md')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--content-engine', required=True)
    ap.add_argument('--channel-art', required=True, help="Drive's 1 Brand kit (permanent)/Channel art, with its MANIFEST.sha256")
    ap.add_argument('--out', default=str(REPO / '.cache' / 'brand-kit-v5'))
    a = ap.parse_args()
    ce = Path(a.content_engine)
    src_marks, src_fonts = ce / 'assets/brand/makeyourmindup/v5', ce / 'assets/fonts/makeyourmindup'
    out = Path(a.out)
    kit = out / 'makeyourmindup-brand-kit'
    if out.exists():
        shutil.rmtree(out)
    (kit / 'logos').mkdir(parents=True)
    (kit / 'fonts').mkdir()
    for f, (name, _) in MARKS.items():
        shutil.copy(src_marks / f, kit / 'logos' / name)
    square = (kit / 'logos' / 'makeyourmindup-square.svg').read_text(encoding='utf-8')
    for rect in SQUARE_RECTS:
        if rect not in square:
            sys.exit(f's3h.svg no longer carries {rect}: update the transparent copy')
        square = square.replace(rect, '')
    (kit / 'logos' / 'makeyourmindup-square-transparent.svg').write_text(square, encoding='utf-8', newline='\n')
    for f, _, _ in FONTS:
        shutil.copy(src_fonts / f, kit / 'fonts' / f)
    for f in LICENCES:
        shutil.copy(src_fonts / f, kit / 'fonts' / f)
    mark_pngs(kit / 'logos')
    art = channel_art(Path(a.channel_art), kit / 'Channel art')
    write_text(kit, art)
    zip_path = REPO / 'brand-kit' / 'makeyourmindup-brand-kit.zip'
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as z:
        for f in sorted(kit.rglob('*')):
            if f.is_file():
                info = zipfile.ZipInfo(str(f.relative_to(out)).replace('\\', '/'), (2026, 11, 26, 0, 0, 0))
                info.compress_type = zipfile.ZIP_DEFLATED
                z.writestr(info, f.read_bytes())
    shutil.copy(kit / 'Channel art' / 'youtube-banner-2560x1440.png', REPO / 'brand-kit' / 'preview.png')
    print('kit', kit)
    print('zip', zip_path, sha(zip_path))


if __name__ == '__main__':
    main()

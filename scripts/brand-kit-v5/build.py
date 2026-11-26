#!/usr/bin/env python3
"""Build the makeyourmindup v5 brand kit: brand-kit/makeyourmindup-brand-kit.zip.

    python scripts/brand-kit-v5/build.py --content-engine PATH/TO/content-engine [--out OUTDIR]

Krish locked the v5 look on 25 Nov 2026 ("s3h is great, lock v5"). This kit
replaces v1.5. Its sources are content-engine's v5 marks
(assets/brand/makeyourmindup/v5/) and font files (assets/fonts/makeyourmindup/),
read from the given checkout, so the kit can only ever carry what content-engine
holds as v5.

His always-on PC's library sync (content-engine scripts/library-sync.ps1)
downloads the zip from this repository's main branch and unpacks it into Drive,
"1 Brand kit (permanent)". So every file in the zip lands in that folder, and
nothing outside the zip is ever written there by the sync.

Needs Python 3.10+ and Playwright's Chromium (pip install playwright;
python -m playwright install chromium). It renders every image, checks each
one's size and safe areas, writes the unpacked kit into OUTDIR and the zip into
brand-kit/.
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
SITE = 'makeyourmindup.ai'

MARKS = {
    # file in content-engine v5 -> (kit name, what it is)
    'd-face-off.svg': ('makeyourmindup-icon.svg', 'The icon: the split circle, cream and mint. Avatars, favicons, app icons.'),
    'v4.svg': ('makeyourmindup-wordmark-on-dark.svg', 'The wordmark for ink or dark grounds: cream, with UP in mint.'),
    'v4-ink.svg': ('makeyourmindup-wordmark-on-light.svg', 'The wordmark for cream or light grounds: all ink.'),
    'v9.svg': ('makeyourmindup-horizontal-on-dark.svg', 'Icon and wordmark on one line, for dark grounds.'),
    'v9-ink.svg': ('makeyourmindup-horizontal-on-light.svg', 'Icon and wordmark on one line, for light grounds.'),
    'v10.svg': ('makeyourmindup-stacked-on-dark.svg', 'Icon above the stacked wordmark, for dark grounds.'),
    'v10-ink.svg': ('makeyourmindup-stacked-on-light.svg', 'Icon above the stacked wordmark, for light grounds.'),
    'v6.svg': ('makeyourmindup-wordmark-stacked-on-dark.svg', 'The wordmark on two lines, for dark grounds.'),
    'v6-ink.svg': ('makeyourmindup-wordmark-stacked-on-light.svg', 'The wordmark on two lines, for light grounds.'),
}
FONTS = [  # (file, family, role)
    ('Anton-Regular.ttf', 'Anton', 'Cover and video headlines, one face per headline'),
    ('Archivo-Variable.ttf', 'Archivo', 'Structure and video captions'),
    ('Fraunces-Upright-Variable.ttf', 'Fraunces', 'Site and share-card headlines, the human line'),
    ('Fraunces-Italic-Variable.ttf', 'Fraunces Italic', 'The motto and asides'),
    ('DMMono-Regular.ttf', 'DM Mono', 'Labels, data, sources, timestamps'),
    ('DMMono-Medium.ttf', 'DM Mono Medium', 'Labels that need weight'),
]
LICENCES = ['OFL-Anton.txt', 'OFL-Archivo.txt', 'OFL-Fraunces.txt', 'OFL-DM-Mono.txt']


def css(fonts: Path) -> str:
    face = lambda fam, f, extra='': f"@font-face{{font-family:'{fam}';src:url('{(fonts / f).as_uri()}');{extra}}}"
    return ''.join([
        face('MYMU Fraunces', 'Fraunces-Upright-Variable.ttf', 'font-weight:100 900;'),
        face('MYMU Fraunces', 'Fraunces-Italic-Variable.ttf', 'font-weight:100 900;font-style:italic;'),
        face('MYMU Mono', 'DMMono-Regular.ttf'),
        face('MYMU Mono', 'DMMono-Medium.ttf', 'font-weight:500;'),
    ]) + (f"*{{margin:0;padding:0;box-sizing:border-box}}html,body{{background:transparent}}"
          f".ink{{background:{INK};position:relative;overflow:hidden}}"
          f".grain{{position:absolute;inset:0;opacity:.07;pointer-events:none}}"
          f".h{{font-family:'MYMU Fraunces';font-weight:600;color:{CREAM};letter-spacing:-.01em;line-height:1.08}}"
          f".m{{font-family:'MYMU Fraunces';font-style:italic;font-weight:400;color:{MINT};line-height:1.2}}"
          f".mono{{font-family:'MYMU Mono';color:{MINT};letter-spacing:.14em;text-transform:uppercase}}")


GRAIN = ('<svg class="grain" width="100%" height="100%"><filter id="n"><feTurbulence type="fractalNoise" '
         'baseFrequency=".9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  '
         '0 0 0 0 1  0 0 0 1 0"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>')


def img(svg: Path, style: str) -> str:
    return f'<img src="{svg.as_uri()}" style="position:absolute;display:block;{style}">'


def page(w, h, body, ground=True):
    cls = 'ink' if ground else ''
    return f'<div class="{cls}" style="width:{w}px;height:{h}px">{GRAIN if ground else ""}{body}</div>'


def lines(x, y_bottom, width, h_size, m_size, gap=0.42):
    """The promise and the motto, left aligned, sitting on y_bottom."""
    return (f'<div style="position:absolute;left:{x}px;bottom:{y_bottom}px;width:{width}px">'
            f'<div class="h" style="font-size:{h_size}px">{PROMISE}</div>'
            f'<div class="m" style="font-size:{m_size}px;margin-top:{round(m_size * gap)}px">{MOTTO}</div></div>')


def designs(marks: Path):
    v9, v10, icon = marks / 'makeyourmindup-horizontal-on-dark.svg', marks / 'makeyourmindup-stacked-on-dark.svg', marks / 'makeyourmindup-icon.svg'
    ratio9 = 930.684 / 90
    out = {}
    # The avatar: the icon inside the circle every platform crops to.
    out['Channel art/avatar-1080.png'] = (1080, 1080, page(1080, 1080, img(icon, 'left:250px;top:250px;width:580px;height:580px')))
    out['logos/makeyourmindup-icon-on-ink-1024.png'] = (1024, 1024, page(1024, 1024, img(icon, 'left:212px;top:212px;width:600px;height:600px')))
    out['logos/makeyourmindup-icon-transparent-1024.png'] = (1024, 1024, page(1024, 1024, img(icon, 'left:0;top:0;width:1024px;height:1024px'), ground=False))
    for name, src, w in [('horizontal', v9, 2400), ('stacked', v10, 1600)]:
        vb = (930.684, 90) if name == 'horizontal' else (422.3782, 278)
        h = round(w * vb[1] / vb[0])
        out[f'logos/makeyourmindup-{name}-on-dark-{w}w.png'] = (w, h, page(w, h, img(src, f'left:0;top:0;width:{w}px;height:{h}px'), ground=False))
        light = marks / f'makeyourmindup-{name}-on-light.svg'
        out[f'logos/makeyourmindup-{name}-on-light-{w}w.png'] = (w, h, page(w, h, img(light, f'left:0;top:0;width:{w}px;height:{h}px'), ground=False))
    # YouTube banner: everything inside the middle 1546 x 423 a phone shows.
    sx, sy, sw, sh = 507, 509, 1546, 423
    lh = 92
    out['Channel art/youtube-banner-2560x1440.png'] = (2560, 1440, page(2560, 1440,
        img(v9, f'left:{sx}px;top:{sy + 4}px;height:{lh}px;width:{round(lh * ratio9)}px') + lines(sx, 1440 - sy - sh, sw, 62, 42)))
    # Facebook cover: inside both what a computer (middle 624 rows) and a phone (middle 1522 columns) show.
    fx, fy, fw, fh = 59 + 40, 116 + 36, 1522 - 80, 624 - 72
    out['Channel art/facebook-cover-1640x856.png'] = (1640, 856, page(1640, 856,
        img(v9, f'left:{fx}px;top:{fy}px;height:78px;width:{round(78 * ratio9)}px') + lines(fx, 856 - fy - fh, fw, 50, 34)))
    # X header: the profile picture covers x 0-400, y 320-500, so the block starts at x 440.
    out['Channel art/x-header-1500x500.png'] = (1500, 500, page(1500, 500,
        img(v9, f'left:440px;top:84px;height:62px;width:{round(62 * ratio9)}px') + lines(440, 70, 1000, 40, 28)))
    # Substack.
    out['Channel art/substack-logo-1024.png'] = out['logos/makeyourmindup-icon-on-ink-1024.png']
    wl = marks / 'makeyourmindup-wordmark-on-light.svg'
    out['Channel art/substack-wordmark-wide-1344x256.png'] = (1344, 256, page(1344, 256,
        img(wl, f'left:32px;top:76px;height:104px;width:{round(104 * 752.684 / 89)}px'), ground=False))
    out['Channel art/substack-email-banner-2200x440.png'] = (2200, 440, page(2200, 440,
        img(v9, f'left:150px;top:150px;height:140px;width:{round(140 * ratio9)}px')))
    out['Channel art/substack-cover-1200x1200.png'] = (1200, 1200, page(1200, 1200,
        img(v10, f'left:110px;top:120px;width:520px;height:{round(520 * 278 / 422.3782)}px') + lines(110, 120, 980, 76, 46)))
    out['Channel art/social-card-1200x630.png'] = (1200, 630, page(1200, 630,
        img(v9, 'left:64px;top:64px;height:56px;width:%dpx' % round(56 * ratio9)) + lines(64, 64, 1072, 58, 34)))
    return out


SAFE = {  # file -> list of (x, y, w, h, label) drawn on the sheet
    'Channel art/youtube-banner-2560x1440.png': [(507, 509, 1546, 423, 'phone'), (0, 509, 2560, 423, 'computer')],
    'Channel art/facebook-cover-1640x856.png': [(0, 116, 1640, 624, 'computer'), (59, 0, 1522, 856, 'phone')],
    'Channel art/x-header-1500x500.png': [(0, 320, 400, 180, 'avatar covers')],
}


def sheet(rendered: Path, files):
    blocks = []
    for f in files:
        w, h = files[f][0], files[f][1]
        scale = min(1, 760 / w)
        boxes = ''.join(f'<div style="position:absolute;left:{x*scale}px;top:{y*scale}px;width:{bw*scale}px;height:{bh*scale}px;'
                        f'outline:2px dashed {CORAL};"><span style="font:11px monospace;color:{CORAL};background:#fff">{lab}</span></div>'
                        for x, y, bw, bh, lab in SAFE.get(f, []))
        circle = (f'<div style="position:absolute;inset:0;border-radius:50%;outline:2px dashed {CORAL}"></div>'
                  if f.endswith(('avatar-1080.png', 'logo-1024.png')) else '')
        blocks.append(f'<figure style="margin:0 0 28px"><div style="position:relative;width:{w*scale}px;height:{h*scale}px;'
                      f'background:repeating-conic-gradient(#ddd 0 25%,#fff 0 50%) 0 0/16px 16px">'
                      f'<img src="{(rendered / f).as_uri()}" style="width:100%;height:100%;display:block">{boxes}{circle}</div>'
                      f'<figcaption style="font:13px monospace;margin-top:6px">{f} ({w} x {h})</figcaption></figure>')
    return f'<div style="padding:32px;background:#fff;width:840px">{"".join(blocks)}</div>'


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--content-engine', required=True)
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
    (kit / 'colours').mkdir()
    (kit / 'Channel art').mkdir()
    for f, (name, _) in MARKS.items():
        shutil.copy(src_marks / f, kit / 'logos' / name)
    for f, _, _ in FONTS:
        shutil.copy(src_fonts / f, kit / 'fonts' / f)
    for f in LICENCES:
        shutil.copy(src_fonts / f, kit / 'fonts' / f)
    files = designs(kit / 'logos')
    style = css(kit / 'fonts')
    render_page = out / 'render.html'
    with sync_playwright() as p:
        b = p.chromium.launch()
        for path, (w, h, body) in files.items():
            pg = b.new_page(viewport={'width': w, 'height': h})
            render_page.write_text(f'<!doctype html><meta charset="utf-8"><style>{style}</style>{body}', encoding='utf-8')
            pg.goto(render_page.as_uri())
            pg.evaluate("Promise.all([document.fonts.load(\"600 40px 'MYMU Fraunces'\"), document.fonts.load(\"italic 400 40px 'MYMU Fraunces'\")]).then(() => document.fonts.ready)")
            pg.wait_for_function('[...document.images].every(i => i.complete)')
            if not pg.evaluate("document.fonts.check(\"600 40px 'MYMU Fraunces'\") && [...document.images].every(i => i.complete && i.naturalWidth > 0)"):
                sys.exit(f'{path}: a font or a mark did not load')
            pg.wait_for_timeout(150)
            pg.screenshot(path=str(kit / path), omit_background=True, clip={'x': 0, 'y': 0, 'width': w, 'height': h})
            pg.close()
        pg = b.new_page(viewport={'width': 904, 'height': 800})
        render_page.write_text(f'<!doctype html><meta charset="utf-8"><style>{style}</style>' + sheet(kit, files), encoding='utf-8')
        pg.goto(render_page.as_uri())
        pg.wait_for_timeout(400)
        pg.screenshot(path=str(kit / 'Channel art' / 'how-they-crop.jpg'), full_page=True, type='jpeg', quality=85)
        b.close()
    for path, (w, h, _) in files.items():
        data = (kit / path).read_bytes()
        if data[16:24] != w.to_bytes(4, 'big') + h.to_bytes(4, 'big'):
            sys.exit(f'{path} is not {w} x {h}')
    render_page.unlink()
    write_text(kit)
    zip_path = REPO / 'brand-kit' / 'makeyourmindup-brand-kit.zip'
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as z:
        for f in sorted(kit.rglob('*')):
            if f.is_file():
                info = zipfile.ZipInfo(str(f.relative_to(out)).replace('\\', '/'), (2026, 11, 26, 0, 0, 0))
                info.compress_type = zipfile.ZIP_DEFLATED
                z.writestr(info, f.read_bytes())
    shutil.copy(kit / 'Channel art' / 'youtube-banner-2560x1440.png', REPO / 'brand-kit' / 'preview.png')
    print('kit', kit)
    print('zip', zip_path, hashlib.sha256(zip_path.read_bytes()).hexdigest())


def write_text(kit: Path):
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
    (kit / 'Channel art' / 'bios-and-descriptions.txt').write_text('\n'.join([
        'Profile copy, v5 (26 Nov 2026). Paste exactly. No names, no series names, no em dashes.', '',
        'YouTube description:',
        f'Short videos from makeyourmindup: {PROMISE[0].lower()}{PROMISE[1:]}', '', MOTTO, '', f"Read today's Edition at {SITE}", '',
        'Instagram bio:', PROMISE, MOTTO, SITE, '',
        f'Facebook intro: {PROMISE} {MOTTO}', '',
        f'Substack short description: {PROMISE} {MOTTO}', '',
        f'X bio (Krish\'s own account): Editor of makeyourmindup: {PROMISE[0].lower()}{PROMISE[1:-1]}. {SITE}', '',
        f'TikTok bio (Krish\'s own account): {PROMISE} {SITE}', '',
        'If a field cuts one of these, drop the second sentence; never reword.', '']), encoding='utf-8', newline='\n')
    rows = '\n'.join(f'| `logos/{n}` | {d} |' for n, d in MARKS.values())
    fonts = '\n'.join(f'| `fonts/{f}` | {fam} | {role} |' for f, fam, role in FONTS)
    (kit / 'README.md').write_text(f"""# makeyourmindup brand kit, v5

26 November 2026. Krish locked the v5 look on 25 November ("s3h is great, lock v5"). This kit replaces v1.5;
everything older is retired and must not be used: the gift-box and splashes marks, the felt robot, painted scenes,
the day colours and pills, the series names, IBM Plex Mono, the old brand book, the intro sting and the YouTube
watermark. The retired files are in Drive under `makeyourmindup > _Archive > 2026-11-26 v4 brand (retired, do not use)`.

**The promise:** {PROMISE}
**The motto:** {MOTTO}

## Rules that matter most

1. The name is one word, all lowercase: makeyourmindup. The wordmark reads MAKE YOUR MIND/UP, with UP in mint on dark.
2. Ink is the page, always with 7% grain. Mint is the answer and the one accent.
3. One wordmark per item, left aligned, with the wording at the bottom. No badges, no watermark.
4. makeyourmindup never names Krish, mind/make, Mindmake or CTRL, and never says "AI Brain". The one exception is the
   Saturday email's signed footnote.
5. No em dashes.

## What is inside

| File | What it is |
|---|---|
{rows}
| `logos/*.png` | The icon on ink and transparent at 1024, and both lockups as transparent PNGs for dark and light grounds. |

| File | Family | Use |
|---|---|---|
{fonts}

The licences are beside the fonts (SIL Open Font License).

`colours/palette.txt` and `colours/tokens.json` hold every colour and its one job.

`Channel art/` holds every profile image and the exact profile copy (`bios-and-descriptions.txt`); `how-they-crop.jpg`
shows each one with the part each platform shows. Which file goes where:

| File | Where |
|---|---|
| `avatar-1080.png` | Profile picture: YouTube, Instagram, the Facebook Page |
| `youtube-banner-2560x1440.png` | YouTube banner |
| `facebook-cover-1640x856.png` | Facebook Page cover |
| `x-header-1500x500.png` | Header on Krish's own X account |
| `substack-logo-1024.png` | Substack logo |
| `substack-wordmark-wide-1344x256.png` | Substack wide logo (wordmark) |
| `substack-email-banner-2200x440.png` | Substack email banner: the one masthead on every email |
| `substack-cover-1200x1200.png` | Substack cover photo |
| `social-card-1200x630.png` | A share card for any link without its own (the site makes its own per page) |

Music is not in this kit: it stays in Drive in `1 Brand kit (permanent) > Music`, where the video engine reads it.

Built by `scripts/brand-kit-v5/build.py` in krishanraja/makeyourmindup from content-engine's v5 marks and fonts.
""", encoding='utf-8', newline='\n')
    shutil.copy(kit / 'README.md', kit / '00 START HERE - v5 brand kit (26 Nov 2026).md')


if __name__ == '__main__':
    main()

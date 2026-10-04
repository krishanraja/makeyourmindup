// The panel's faces, drawn in the same ink line as the cover's diagrams so they
// never compete with the felt robot, which stays the one photograph. Each is
// SVG markup for a 120 by 120 symbol; components/AvatarSprite.tsx puts them on
// the page once and components/Avatar.tsx draws one wherever it is needed.
// Colours come from the house palette only: ink, cream, mint and mint deep.
const INK = '#0C1512', CREAM = '#F4EFE4', MINT = '#7EF0C0', DEEP = '#2F6B5C'
const S = `stroke="${INK}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"`
const line = (d: string) => `<path d="${d}" fill="none" ${S}/>`
const dot = (x: number, y: number, r = 2.8) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${INK}"/>`
const disc = (fill = MINT) => `<rect width="120" height="120" fill="${fill}"/>`
const ring = `<circle cx="60" cy="60" r="58.5" fill="none" stroke="${INK}" stroke-width="3"/>`
const body = (fill = CREAM, extra = '') => `<path d="M12 124 C 16 96, 38 88, 60 88 C 82 88, 104 96, 108 124 Z" fill="${fill}" ${S}/>${extra}`
const neck = `<path d="M52 80 L52 90 Q60 94 68 90 L68 80" fill="${CREAM}" ${S}/>`
const head = (cy = 58) => `<ellipse cx="35.5" cy="${cy + 2}" rx="4.5" ry="6.5" fill="${CREAM}" ${S}/><ellipse cx="84.5" cy="${cy + 2}" rx="4.5" ry="6.5" fill="${CREAM}" ${S}/><ellipse cx="60" cy="${cy}" rx="24" ry="28" fill="${CREAM}" ${S}/>`
const nose = line('M60 59 Q57 66 61 67')

export const AVATARS: Record<string, string> = {
  // Pith helmet, an enormous net, a tiny pulpit caught in it. Smug.
  preacher_catcher: [
    disc(),
    // net handle behind
    `<path d="M106 118 L84 42" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`,
    body(CREAM, line('M60 88 L60 124') + line('M44 92 L48 108') + line('M76 92 L72 108')),
    neck, head(60),
    // helmet
    `<path d="M22 54 Q60 42 98 54 Q96 60 88 58 Q60 52 32 58 Q24 60 22 54 Z" fill="${CREAM}" ${S}/>`,
    `<path d="M34 51 Q32 20 60 19 Q88 20 86 51 Q60 46 34 51 Z" fill="${CREAM}" ${S}/>`,
    `<circle cx="60" cy="18" r="3" fill="${INK}"/>`,
    `<path d="M35 46 Q60 41 85 46" fill="none" stroke="${INK}" stroke-width="5"/>`,
    // smug eyes and smile
    line('M47 61 Q51 58 55 61'), line('M65 61 Q69 58 73 61'),
    nose, line('M51 73 Q60 79 69 72'),
    // net hoop and mesh
    `<ellipse cx="88" cy="26" rx="20" ry="17" fill="${CREAM}" fill-opacity="0.55" ${S}/>`,
    `<path d="M72 18 L104 34 M70 28 L100 42 M76 10 L106 24 M76 42 L96 10 M86 43 L104 16 M70 34 L86 9" fill="none" stroke="${INK}" stroke-width="1.2" opacity="0.5"/>`,
    // the pulpit, caught
    `<path d="M81 24 L95 24 L92 36 L84 36 Z" fill="${DEEP}" ${S}/>`, line('M79 24 L97 24'),
    ring,
  ].join(''),

  // A loupe screwed into one eye, a ledger, garters. Suspicious.
  fact_checker: [
    disc(),
    body(CREAM, `<path d="M28 102 L46 102" stroke="${INK}" stroke-width="5"/><path d="M74 102 L92 102" stroke="${INK}" stroke-width="5"/>` + line('M60 88 L60 124')),
    neck, head(58),
    // side-parted hair
    `<path d="M37 50 Q38 28 60 28 Q82 28 83 48 Q70 36 50 42 Q42 44 37 50 Z" fill="${INK}" ${S}/>`,
    // furrowed brow
    line('M44 50 L55 53'), line('M76 50 L66 53'),
    dot(51, 59),
    // loupe
    `<rect x="62" y="50" width="18" height="18" rx="4" fill="${INK}"/>`,
    `<circle cx="71" cy="59" r="6" fill="${MINT}" stroke="${CREAM}" stroke-width="1.5"/>`,
    `<circle cx="69.5" cy="57.5" r="1.6" fill="${CREAM}"/>`,
    nose, line('M53 74 L66 73'),
    // ledger, held up
    `<rect x="16" y="92" width="34" height="26" rx="2" fill="${DEEP}" ${S}/>`, line('M22 100 L44 100'), line('M22 106 L40 106'),
    ring,
  ].join(''),

  // Dressing gown, half-shut eyes, a mug that is doing all the work.
  cold_reader: [
    disc(),
    body(DEEP, line('M44 90 L60 116 L76 90') + `<path d="M44 90 L60 116 L76 90 Z" fill="${CREAM}" ${S}/>`),
    neck, head(58),
    // bed hair
    `<path d="M37 48 Q36 34 46 31 L42 22 L52 29 L56 18 L62 28 L70 19 L71 30 L80 26 L79 36 Q84 40 83 48 Q72 38 60 39 Q46 39 37 48 Z" fill="${INK}" ${S}/>`,
    // eyes about a tenth open
    `<path d="M44 58 Q51 62 58 58" fill="none" ${S}/>`, `<path d="M45 59 Q51 61 57 59" fill="none" stroke="${INK}" stroke-width="4"/>`,
    `<path d="M62 58 Q69 62 76 58" fill="none" ${S}/>`, `<path d="M63 59 Q69 61 75 59" fill="none" stroke="${INK}" stroke-width="4"/>`,
    `<path d="M46 65 Q51 68 56 65 M64 65 Q69 68 74 65" fill="none" stroke="${INK}" stroke-width="1.5"/>`,
    nose, line('M53 76 Q56 74 59 76 Q62 78 66 75'),
    // mug and steam
    `<rect x="74" y="88" width="24" height="26" rx="3" fill="${CREAM}" ${S}/>`, line('M98 94 Q106 96 98 106'),
    line('M80 84 Q76 78 80 72'), line('M88 84 Q84 76 88 68'),
    ring,
  ].join(''),

  // One eyebrow on its way to the ceiling, arms folded.
  sceptic: [
    disc(),
    body(CREAM),
    neck, head(56),
    // short flat hair
    `<path d="M37 48 Q36 28 60 27 Q84 28 83 48 L80 40 Q60 34 40 40 Z" fill="${INK}" ${S}/>`,
    // the eyebrow
    `<path d="M43 44 Q50 36 57 43" fill="none" stroke="${INK}" stroke-width="4.5" stroke-linecap="round"/>`,
    `<path d="M64 52 L76 52" fill="none" stroke="${INK}" stroke-width="4.5" stroke-linecap="round"/>`,
    dot(51, 55), dot(70, 57),
    nose, line('M53 73 L66 70'),
    // folded arms
    `<path d="M18 112 Q24 98 44 98 L78 100 Q86 101 86 108 Q86 114 78 114 L30 120 Z" fill="${DEEP}" ${S}/>`,
    `<path d="M102 112 Q96 100 78 102 L44 106 Q36 107 36 113 Q36 119 44 119 L96 122 Z" fill="${DEEP}" ${S}/>`,
    `<circle cx="84" cy="107" r="5" fill="${CREAM}" ${S}/>`, `<circle cx="38" cy="113" r="5" fill="${CREAM}" ${S}/>`,
    ring,
  ].join(''),

  // Glasses down the nose on a chain, a pencil the size of a lance.
  line_editor: [
    disc(),
    body(CREAM, line('M48 89 Q60 98 72 89')),
    neck, head(58),
    // bun
    `<circle cx="60" cy="27" r="9" fill="${INK}"/>`,
    `<path d="M37 50 Q36 32 60 32 Q84 32 83 50 Q72 40 60 40 Q48 40 37 50 Z" fill="${INK}" ${S}/>`,
    // eyes peering over
    line('M45 53 L56 52'), line('M64 52 L75 53'),
    dot(51, 57), dot(69, 57),
    // half-moon glasses low on the nose
    `<path d="M44 62 L56 62 Q55 69 50 69 Q45 69 44 62 Z" fill="${MINT}" fill-opacity="0.4" ${S}/>`,
    `<path d="M64 62 L76 62 Q75 69 70 69 Q65 69 64 62 Z" fill="${MINT}" fill-opacity="0.4" ${S}/>`,
    line('M56 63 L64 63'),
    `<path d="M44 63 Q34 80 40 92" fill="none" stroke="${INK}" stroke-width="1.5" stroke-dasharray="2 2"/>`,
    line('M54 76 L66 76'),
    // the pencil
    `<g transform="rotate(-38 70 100)"><rect x="40" y="94" width="62" height="11" fill="${CREAM}" ${S}/><path d="M102 94 L116 99.5 L102 105 Z" fill="${CREAM}" ${S}/><path d="M112 98 L116 99.5 L112 101 Z" fill="${INK}"/><rect x="34" y="94" width="8" height="11" fill="${INK}"/></g>`,
    ring,
  ].join(''),

  // Black polo neck, round black glasses, a thumb held up to the work.
  art_director: [
    disc(),
    body(INK, `<rect x="47" y="80" width="26" height="14" rx="3" fill="${INK}" stroke="${INK}" stroke-width="3"/>`),
    head(55),
    // bald, a tiny goatee
    `<path d="M56 79 Q60 84 64 79 Z" fill="${INK}" ${S}/>`,
    // round glasses
    `<circle cx="50" cy="55" r="7.5" fill="${CREAM}" stroke="${INK}" stroke-width="4"/>`, `<circle cx="70" cy="55" r="7.5" fill="${CREAM}" stroke="${INK}" stroke-width="4"/>`,
    line('M57.5 55 L62.5 55'), line('M42.5 54 L37 52'), line('M77.5 54 L83 52'),
    line('M46 56 L54 56'), dot(70, 56, 2.4),
    nose, line('M54 72 Q60 70 66 72'),
    // the thumb
    `<path d="M88 116 L88 96 Q88 90 94 90 L100 90 Q104 90 104 96 L104 116 Z" fill="${CREAM}" ${S}/>`,
    `<path d="M91 90 L91 76 Q91 71 95.5 71 Q100 71 100 76 L100 90" fill="${CREAM}" ${S}/>`,
    ring,
  ].join(''),

  // Nose in a phone, earbuds out, sound off.
  distribution: [
    disc(),
    body(CREAM, line('M42 92 Q60 100 78 92')),
    neck, head(56),
    `<path d="M36 50 Q34 26 58 26 Q78 24 84 44 Q86 52 84 56 Q78 40 62 38 Q46 38 36 50 Z" fill="${INK}" ${S}/>`,
    // eyes down at the screen, lit
    `<ellipse cx="50" cy="57" rx="5" ry="4.5" fill="${CREAM}" ${S}/>`, dot(50, 59.5, 2.2),
    `<ellipse cx="70" cy="57" rx="5" ry="4.5" fill="${CREAM}" ${S}/>`, dot(70, 59.5, 2.2),
    line('M45 50 L55 51'), line('M65 51 L75 50'),
    nose, `<ellipse cx="60" cy="72" rx="4" ry="3" fill="${INK}"/>`,
    // earbuds, unplugged
    `<circle cx="34" cy="62" r="4" fill="${CREAM}" ${S}/>`, `<path d="M34 66 Q30 84 40 98" fill="none" stroke="${INK}" stroke-width="1.5"/>`,
    `<circle cx="86" cy="62" r="4" fill="${CREAM}" ${S}/>`, `<path d="M86 66 Q92 82 84 96" fill="none" stroke="${INK}" stroke-width="1.5"/>`,
    // the phone, glowing
    `<path d="M40 82 L82 82 L100 120 L30 120 Z" fill="${MINT}" opacity="0.35"/>`,
    `<rect x="47" y="92" width="26" height="40" rx="4" fill="${INK}" ${S}/>`, `<rect x="50" y="96" width="20" height="30" rx="1.5" fill="${MINT}"/>`,
    ring,
  ].join(''),

  // A card-index drawer for a chest, a pencil in the bun, a long memory.
  continuity: [
    disc(),
    body(CREAM),
    neck, head(56),
    // bun with pencil
    `<path d="M74 30 L50 12" fill="none" stroke="${INK}" stroke-width="3.5" stroke-linecap="round"/>`,
    `<circle cx="62" cy="24" r="10" fill="${INK}"/>`,
    `<path d="M36 50 Q35 30 60 30 Q85 30 84 50 Q74 38 60 38 Q46 38 36 50 Z" fill="${INK}" ${S}/>`,
    // knowing look
    line('M44 48 Q50 44 56 48'), line('M64 48 Q70 44 76 48'),
    dot(50, 55), dot(70, 55),
    nose, line('M54 71 Q60 74 67 70'),
    // the drawer
    `<rect x="30" y="94" width="60" height="30" rx="2" fill="${DEEP}" ${S}/>`,
    `<rect x="52" y="100" width="16" height="8" fill="${CREAM}" ${S}/>`, line('M54 113 L66 113'),
    // red string, in ink
    `<path d="M30 100 Q14 92 22 84 Q30 78 26 70" fill="none" stroke="${INK}" stroke-width="1.6"/>`,
    ring,
  ].join(''),

  // A banner it is not allowed to unroll, and a speech it is not allowed to give.
  agency: [
    disc(),
    body(CREAM),
    neck, head(57),
    `<path d="M36 50 Q34 28 60 28 Q86 28 84 50 L84 46 Q72 34 60 40 Q48 34 36 46 Z" fill="${INK}" ${S}/>`,
    // eager brows, mouth open mid-sentence
    line('M44 47 L56 44'), line('M64 44 L76 47'),
    dot(50, 55), dot(70, 55),
    nose, `<path d="M51 70 Q60 68 69 70 Q66 80 60 80 Q54 80 51 70 Z" fill="${INK}" ${S}/>`,
    // the banner, rolled and tied
    `<path d="M84 124 L100 14" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`,
    `<g transform="rotate(8 96 50)"><rect x="88" y="22" width="18" height="56" rx="9" fill="${DEEP}" ${S}/><path d="M88 38 L106 38 M88 62 L106 62" stroke="${CREAM}" stroke-width="3"/><path d="M106 70 L114 76 L106 78 Z" fill="${CREAM}" ${S}/></g>`,
    `<circle cx="86" cy="104" r="6" fill="${CREAM}" ${S}/>`,
    ring,
  ].join(''),

  // Green eyeshade, waistcoat, a watch that says the week is nearly gone.
  commissioner: [
    disc(),
    body(CREAM, `<path d="M40 92 L60 120 L80 92 L84 124 L36 124 Z" fill="${DEEP}" ${S}/>` + `<path d="M46 102 L46 124 M54 112 L54 124 M66 112 L66 124 M74 102 L74 124" stroke="${CREAM}" stroke-width="1.2" opacity="0.6"/>` + `<circle cx="70" cy="110" r="3" fill="${CREAM}" ${S}/>` + line('M70 113 Q62 118 54 114')),
    neck, head(58),
    `<path d="M37 50 Q36 32 60 32 Q84 32 83 50 Z" fill="${CREAM}" ${S}/>`,
    // eyeshade
    `<path d="M30 46 Q60 30 90 46 L84 54 Q60 44 36 54 Z" fill="${MINT}" ${S}/>`,
    line('M36 46 Q60 38 84 46'),
    // unimpressed
    line('M45 58 L56 58'), line('M64 58 L75 58'), dot(51, 61, 2.4), dot(69, 61, 2.4),
    nose,
    `<path d="M48 70 Q54 66 60 69 Q66 66 72 70 Q66 73 60 71 Q54 73 48 70 Z" fill="${INK}" ${S}/>`,
    line('M55 77 L65 77'),
    ring,
  ].join(''),

  // Not a judge. A chair.
  chair: [
    disc(),
    // wings and back
    `<path d="M30 112 L30 56 Q30 28 60 28 Q90 28 90 56 L90 112 Z" fill="${CREAM}" ${S}/>`,
    `<path d="M22 66 Q22 52 34 54 L36 100 L22 100 Z" fill="${CREAM}" ${S}/>`,
    `<path d="M98 66 Q98 52 86 54 L84 100 L98 100 Z" fill="${CREAM}" ${S}/>`,
    // tufting
    dot(46, 44, 1.6), dot(60, 40, 1.6), dot(74, 44, 1.6), dot(46, 82, 1.6), dot(74, 82, 1.6),
    // a calm face on the backrest
    line('M49 60 Q53 57 57 60'), line('M63 60 Q67 57 71 60'),
    line('M52 70 Q60 75 68 70'),
    // seat cushion and legs
    `<path d="M20 98 L100 98 L100 112 L20 112 Z" fill="${CREAM}" ${S}/>`,
    `<rect x="26" y="112" width="6" height="10" fill="${INK}"/>`, `<rect x="88" y="112" width="6" height="10" fill="${INK}"/>`,
    ring,
  ].join(''),
}

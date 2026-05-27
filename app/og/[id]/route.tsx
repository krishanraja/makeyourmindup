import { ImageResponse } from '@vercel/og';
import { createClient } from '@supabase/supabase-js';
import { compose } from '@/components/sigil/compose';
import type { Answers } from '@/lib/types';

export const runtime = 'edge';

const VIEW = 512;
const CENTER = VIEW / 2;
const BASE_R = 180;

type ShareCard = {
  archetype_title: string;
  q1_week_needs_me: number;
  q2_extra_self: Answers['q2'];
  q3_company_ai: number;
  q4_company_future: Answers['q4'];
};

async function loadGoogleFont(family: string, weight: number): Promise<ArrayBuffer | null> {
  try {
    const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}&display=swap`;
    const cssRes = await fetch(cssUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
      },
    });
    if (!cssRes.ok) return null;
    const css = await cssRes.text();
    const match = css.match(/src:\s*url\((https:[^)]+\.woff2?)\)/);
    if (!match) return null;
    const fontRes = await fetch(match[1]);
    if (!fontRes.ok) return null;
    return await fontRes.arrayBuffer();
  } catch (err) {
    console.error('loadGoogleFont failed', family, weight, err);
    return null;
  }
}

export async function GET(_req: Request, ctx: { params: { id: string } }) {
  const { id } = ctx.params;

  let fontSemibold: ArrayBuffer | null = null;
  let fontMono: ArrayBuffer | null = null;
  let row: ShareCard | null = null;

  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
    const supabase = createClient(url, anon, { auth: { persistSession: false } });

    const [rpcResult, sf, jm] = await Promise.all([
      supabase.rpc('get_share_card', { p_id: id }),
      loadGoogleFont('Source Serif 4', 600),
      loadGoogleFont('JetBrains Mono', 500),
    ]);
    fontSemibold = sf;
    fontMono = jm;

    if (!rpcResult.error && rpcResult.data) {
      const data = rpcResult.data;
      row = (Array.isArray(data) ? data[0] : data) as ShareCard;
    }
  } catch (err) {
    console.error('OG route error', err);
  }

  if (!row) return fallbackImage(fontSemibold);

  const params = compose({
    q1: row.q1_week_needs_me ?? 50,
    q2: row.q2_extra_self ?? 'think',
    q3: row.q3_company_ai ?? 50,
    q4: row.q4_company_future ?? 'same',
    q5: id,
  });
  const title = row.archetype_title ?? 'makeyourmindup.ai';

  const sigil = renderSigil(params);

  const fonts: { name: string; data: ArrayBuffer; weight: 400 | 600; style: 'normal' }[] = [];
  if (fontSemibold) {
    fonts.push({ name: 'Source Serif 4', data: fontSemibold, weight: 600, style: 'normal' });
  }
  if (fontMono) {
    fonts.push({ name: 'JetBrains Mono', data: fontMono, weight: 400, style: 'normal' });
  }

  try {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#F5F1EA',
            padding: '120px 80px',
            fontFamily: 'Source Serif 4, serif',
          }}
        >
          <div
            style={{
              display: 'flex',
              width: 640,
              height: 640,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width={640} height={640} viewBox={`0 0 ${VIEW} ${VIEW}`} xmlns="http://www.w3.org/2000/svg">
              {sigil}
            </svg>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 40,
              width: '100%',
            }}
          >
            <div
              style={{
                fontFamily: 'Source Serif 4, serif',
                fontSize: 64,
                fontWeight: 600,
                color: '#0A0908',
                textAlign: 'center',
                lineHeight: 1.1,
                letterSpacing: '-0.03em',
                maxWidth: 880,
              }}
            >
              {title}
            </div>
            <div
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 22,
                letterSpacing: '0.24em',
                textTransform: 'uppercase',
                color: '#0A0908',
                opacity: 0.6,
              }}
            >
              makeyourmindup.ai
            </div>
          </div>
        </div>
      ),
      {
        width: 1080,
        height: 1920,
        fonts: fonts.length ? fonts : undefined,
      },
    );
  } catch (err) {
    console.error('ImageResponse failed', err);
    return fallbackImage(fontSemibold);
  }
}

function fallbackImage(fontSemibold?: ArrayBuffer | null) {
  const fonts = fontSemibold
    ? [{ name: 'Source Serif 4', data: fontSemibold, weight: 600 as const, style: 'normal' as const }]
    : undefined;
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0A0908',
          color: '#F5F1EA',
          fontFamily: 'Source Serif 4, serif',
          fontSize: 60,
          letterSpacing: '-0.03em',
        }}
      >
        makeyourmindup.ai
      </div>
    ),
    { width: 1080, height: 1920, fonts },
  );
}

function renderSigil(params: ReturnType<typeof compose>) {
  const { frame, form, rotation, scale, dots } = params;
  const r = BASE_R * scale;
  const stroke = '#0A0908';
  const fill = '#0A0908';
  const nodes: React.ReactNode[] = [];

  if (frame === 'ring') {
    nodes.push(
      <circle key="ring" cx={CENTER} cy={CENTER} r={BASE_R + 40} fill="none" stroke={stroke} strokeWidth={2.5} />,
    );
  } else if (frame === 'broken') {
    nodes.push(
      <path key="b1" d={arcPath(CENTER, CENTER, BASE_R + 40, 100, 260)} fill="none" stroke={stroke} strokeWidth={2.5} strokeLinecap="round" />,
      <path key="b2" d={arcPath(CENTER, CENTER, BASE_R + 40, 280, 80)} fill="none" stroke={stroke} strokeWidth={2.5} strokeLinecap="round" />,
    );
  } else if (frame === 'double') {
    nodes.push(
      <circle key="d1" cx={CENTER} cy={CENTER} r={BASE_R + 30} fill="none" stroke={stroke} strokeWidth={2} />,
      <circle key="d2" cx={CENTER} cy={CENTER} r={BASE_R + 48} fill="none" stroke={stroke} strokeWidth={2} />,
    );
  }

  const formGroup: React.ReactNode[] = [];
  if (form === 'vesica') {
    formGroup.push(
      <circle key="v1" cx={CENTER} cy={CENTER - r * 0.4} r={r} fill="none" stroke={stroke} strokeWidth={2} />,
      <circle key="v2" cx={CENTER} cy={CENTER + r * 0.4} r={r} fill="none" stroke={stroke} strokeWidth={2} />,
    );
  } else if (form === 'lozenge') {
    formGroup.push(
      <rect
        key="l"
        x={CENTER - r}
        y={CENTER - r}
        width={r * 2}
        height={r * 2}
        fill="none"
        stroke={stroke}
        strokeWidth={2}
        transform={`rotate(45 ${CENTER} ${CENTER})`}
      />,
    );
  } else if (form === 'triangle') {
    formGroup.push(
      <polygon key="t" points={trianglePoints(CENTER, CENTER, r)} fill="none" stroke={stroke} strokeWidth={2} />,
    );
  } else if (form === 'annulus') {
    formGroup.push(
      <circle key="a1" cx={CENTER} cy={CENTER} r={r} fill={fill} />,
      <circle key="a2" cx={CENTER} cy={CENTER} r={r * 0.55} fill="#F5F1EA" />,
    );
  }

  nodes.push(
    <g key="form" transform={`rotate(${rotation} ${CENTER} ${CENTER})`}>
      {formGroup}
    </g>,
  );

  for (let i = 0; i < dots.length; i++) {
    const rad = (dots[i].angle * Math.PI) / 180;
    const cx = CENTER + Math.cos(rad) * (BASE_R + 60);
    const cy = CENTER + Math.sin(rad) * (BASE_R + 60);
    nodes.push(<circle key={`dot-${i}`} cx={cx} cy={cy} r={4} fill={fill} />);
  }

  return nodes;
}

function trianglePoints(cx: number, cy: number, r: number): string {
  const top = `${cx},${cy - r}`;
  const left = `${cx - r * Math.sin(Math.PI / 3)},${cy + r * 0.5}`;
  const right = `${cx + r * Math.sin(Math.PI / 3)},${cy + r * 0.5}`;
  return `${top} ${left} ${right}`;
}

function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const startRad = (startDeg * Math.PI) / 180;
  const endRad = (endDeg * Math.PI) / 180;
  const x1 = cx + r * Math.cos(startRad);
  const y1 = cy + r * Math.sin(startRad);
  const x2 = cx + r * Math.cos(endRad);
  const y2 = cy + r * Math.sin(endRad);
  let sweep = endDeg - startDeg;
  if (sweep < 0) sweep += 360;
  const largeArc = sweep > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
}

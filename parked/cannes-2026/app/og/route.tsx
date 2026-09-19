import { ImageResponse } from '@vercel/og';

export const runtime = 'edge';

// Landing OG for the picker at /. Tagline plus three accent stripes that
// stand in for the three doors (decide, extend, imagine) without naming them.
export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0A0908',
          padding: '120px 80px',
        }}
      >
        <svg width={180} height={180} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EC4899" />
              <stop offset="100%" stopColor="#F97316" />
            </linearGradient>
          </defs>
          <rect x="48" y="100" width="50" height="50" fill="url(#g)" />
          <rect x="102" y="100" width="50" height="50" fill="url(#g)" />
          <polygon points="65,96 81,96 89,72 57,72" fill="url(#g)" />
          <polygon points="114,96 138,96 148,52 104,52" fill="url(#g)" />
        </svg>
        <div
          style={{
            display: 'flex',
            marginTop: 72,
            fontSize: 56,
            fontWeight: 600,
            color: '#F5F1EA',
            textAlign: 'center',
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            maxWidth: 760,
          }}
        >
          What if you were already the version of you you keep delaying?
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 56 }}>
          <div style={{ width: 90, height: 8, borderRadius: 8, background: '#FF8A65' }} />
          <div style={{ width: 90, height: 8, borderRadius: 8, background: '#7BB3FF' }} />
          <div style={{ width: 90, height: 8, borderRadius: 8, background: '#C8A2FF' }} />
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 56,
            fontSize: 22,
            letterSpacing: '0.24em',
            textTransform: 'uppercase',
            color: '#F5F1EA',
            opacity: 0.55,
          }}
        >
          makeyourmindup.ai
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}

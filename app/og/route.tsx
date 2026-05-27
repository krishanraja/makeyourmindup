import { ImageResponse } from '@vercel/og';

export const runtime = 'edge';

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
          <polygon points="104,96 148,96 138,52 114,52" fill="url(#g)" />
        </svg>
        <div
          style={{
            display: 'flex',
            marginTop: 80,
            fontSize: 56,
            fontWeight: 600,
            color: '#F5F1EA',
            textAlign: 'center',
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            maxWidth: 720,
          }}
        >
          What if you were already the version of yourself you keep delaying?
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 80,
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

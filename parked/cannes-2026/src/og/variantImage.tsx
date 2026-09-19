import { ImageResponse } from '@vercel/og';
import type { Variant } from '@/lib/variants';

// Variant accent, shared with the landing cards.
const ACCENT: Record<Variant, string> = {
  decide: '#FF8A65',
  extend: '#7BB3FF',
  imagine: '#C8A2FF',
};

// 1080x1920 entry OG: brand monogram, variant title, an accent rule, and the URL.
export function variantOgImage(slug: Variant, title: string, subtitle: string): ImageResponse {
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
            marginTop: 88,
            fontSize: 62,
            fontWeight: 600,
            color: '#F5F1EA',
            textAlign: 'center',
            lineHeight: 1.12,
            letterSpacing: '-0.02em',
            maxWidth: 820,
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: 'flex',
            width: 120,
            height: 8,
            marginTop: 56,
            borderRadius: 8,
            background: ACCENT[slug],
          }}
        />
        <div
          style={{
            display: 'flex',
            marginTop: 56,
            fontSize: 24,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#F5F1EA',
            opacity: 0.6,
          }}
        >
          {subtitle}
        </div>
      </div>
    ),
    { width: 1080, height: 1920 },
  );
}

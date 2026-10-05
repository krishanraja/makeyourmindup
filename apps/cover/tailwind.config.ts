import type { Config } from 'tailwindcss'

// Every colour has one job. mint is the brand and every primary action.
// coral, butter and lilac each belong to one subchannel and nothing else.
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '#0C1512', deep: '#070D0B', soft: '#16221D' },
        mint: { DEFAULT: '#7EF0C0', deep: '#2F6B5C' },
        cream: '#F4EFE4',
        coral: '#FF6A4D',
        butter: '#FFD84D',
        lilac: '#B7A6FF',
      },
      fontFamily: {
        sans: ['var(--font-archivo)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-plex-mono)', 'ui-monospace', 'monospace'],
        serif: ['var(--font-fraunces)', 'Georgia', 'serif'],
      },
      maxWidth: { page: '1400px' },
      keyframes: {
        marquee: { from: { transform: 'translate3d(0,0,0)' }, to: { transform: 'translate3d(-50%,0,0)' } },
        spin: { to: { transform: 'rotate(360deg)' } },
        pulse: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.35' } },
      },
      animation: {
        marquee: 'marquee 38s linear infinite',
        'spin-slow': 'spin 18s linear infinite',
        blink: 'pulse 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

export default config

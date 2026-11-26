import type { Stock } from '@/lib/hub'

export function price(s: Stock) {
  if (s.price === null || !s.currency) return 'n/a'
  const currency = /^[A-Z]{3}$/.test(s.currency) ? s.currency : undefined
  return currency
    ? new Intl.NumberFormat('en-GB', { style: 'currency', currency, currencyDisplay: 'narrowSymbol' }).format(
        s.price,
      )
    : s.price.toFixed(2) + ' ' + s.currency
}

export function Spark({
  data,
  wide = false,
  width = 84,
  height = 22,
}: {
  data: number[]
  wide?: boolean
  width?: number
  height?: number
}) {
  if (!data.length) return null
  const values = wide ? [...data, 100] : data
  const lo = Math.min(...values),
    range = Math.max(...values) - lo || 1
  const y = (v: number) => height - 2 - ((v - lo) / range) * (height - 4)
  const points = data.map((v, i) => (i * width) / Math.max(1, data.length - 1) + ',' + y(v)).join(' ')
  return (
    <svg
      aria-hidden="true"
      width={width}
      height={height}
      viewBox={'0 0 ' + width + ' ' + height}
      preserveAspectRatio="none"
      className={wide ? 'chart' : undefined}
    >
      {wide && (
        <>
          <line x1="0" x2={width} y1={y(100)} y2={y(100)} className="base" />
          <polygon points={'0,' + height + ' ' + points + ' ' + width + ',' + height} className="area" />
        </>
      )}
      <polyline
        points={points}
        className={wide ? 'ln' : undefined}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}

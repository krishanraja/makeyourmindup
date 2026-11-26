'use client'

import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import type { Snapshot, Stock } from '@/lib/hub'
import { Percent } from './Story'
import './motion.css'
import { price, Spark } from './MarketValues'

type Props = {
  index: Snapshot['ticker']['index']
  asOf: string | null
  stocks: [string, Stock][]
  scope: string
  children: ReactNode
}

export function TickerTape({ index, asOf, stocks, scope, children }: Props) {
  const viewport = useRef<HTMLDivElement>(null)
  const group = useRef<HTMLDivElement>(null)
  const [copies, setCopies] = useState(1)

  useLayoutEffect(() => {
    const box = viewport.current
    const first = group.current
    if (!box || !first || !stocks.length || !window.ResizeObserver) return
    function measure() {
      if (!box || !first) return
      const width = first.getBoundingClientRect().width
      if (!width) return
      setCopies(1 + Math.ceil(box.clientWidth / width))
      box.style.setProperty('--lap-distance', -width + 'px')
      box.style.setProperty('--lap-time', width / 50 + 's')
      box.dataset.running = 'true'
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(box)
    ro.observe(first)
    return () => {
      ro.disconnect()
      delete box.dataset.running
    }
  }, [scope, stocks.length])

  const entries = stocks.map(([symbol, stock]) => (
    <span className="mv" key={symbol}>
      <b className="nm">{stock.name}</b>
      <span className="sym">{symbol}</span>
      <span className="p">{price(stock)}</span>
      <Percent value={stock.day_pct} />
    </span>
  ))
  const close = asOf?.replace(/^Close,\s*/, 'Close ').replace(/(?: \d{4})? \(delayed\)$/i, ', delayed')
  return <div className="ticker">
    <div className="wrap tick-row">
      <div className="idx">
        <span className="idx-name">{index.name}</span>
        <span className="idx-val">{index.series.at(-1)?.toFixed(2) ?? 'n/a'}</span>
        <Spark data={index.series} width={58} height={18} />
        <Percent value={index.day_pct} />
      </div>
      <div className="movers" role="region" tabIndex={0} ref={viewport}
        aria-label={scope + ' constituent closing prices'} aria-live="off">
        <div className="tape-track" key={scope}>
          <div className="tape-group" ref={group}>{entries.length ? entries : 'Prices unavailable'}</div>
          {Array.from({ length: copies - 1 }, (_, i) => (
            <div className="tape-group" aria-hidden="true" key={i}>{entries}</div>
          ))}
        </div>
      </div>
      <span className="tick-label">{close ? /delayed/i.test(close) ? close : close + ', delayed' : 'Close unavailable'}</span>
      {children}
    </div>
  </div>
}

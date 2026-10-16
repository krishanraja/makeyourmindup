'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Two split-flap tiles that riffle through digits like a station departure
 * board, then land on the real count (Krish, 2026-10-07: "these numbers need
 * to be flipping like counters on a train station board, one after the
 * other"). Counter `order` starts after the ones before it have landed. The
 * server HTML already carries the real value, so a failed script or reduced
 * motion shows the right number with no flipping.
 */
const TICK_MS = 70
const TICKS = 9 // flips before the first tile lands; the second lands three later
const GAP_MS = 750 // between one counter starting and the next

export function FlapCounter({ value, order }: { value: number; order: number }) {
  const real = String(value).padStart(2, '0')
  const [shown, setShown] = useState(real)
  const [tick, setTick] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !('IntersectionObserver' in window)) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let timer: ReturnType<typeof setTimeout> | undefined
    let interval: ReturnType<typeof setInterval> | undefined
    const run = () => {
      let n = 0
      interval = setInterval(() => {
        n += 1
        const first = n >= TICKS ? real[0] : String(Math.floor(Math.random() * 10))
        const second = n >= TICKS + 3 ? real[1] : String(Math.floor(Math.random() * 10))
        setShown(first + second)
        setTick(n)
        if (n >= TICKS + 3) clearInterval(interval)
      }, TICK_MS)
    }
    const io = new IntersectionObserver(
      entries => {
        if (entries.some(e => e.isIntersecting)) {
          io.disconnect()
          setShown('00')
          timer = setTimeout(run, 250 + order * GAP_MS)
        }
      },
      { rootMargin: '0px 0px -60px 0px' },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      if (timer) clearTimeout(timer)
      if (interval) clearInterval(interval)
    }
  }, [real, order])

  return (
    <span ref={ref} className="flex gap-1" aria-hidden="true">
      {[0, 1].map(d => (
        <span
          key={d}
          className="flap-tile relative flex h-[clamp(3.25rem,9svh,6rem)] w-[clamp(2.25rem,6svh,4rem)] items-center justify-center overflow-hidden rounded-sm bg-ink-soft"
        >
          <span key={`${d}-${shown[d]}-${tick}`} className="flap-digit display text-[clamp(2.2rem,6svh,3.75rem)] text-cream">
            {shown[d]}
          </span>
          <span className="absolute inset-x-0 top-1/2 h-[2px] bg-ink" aria-hidden="true" />
        </span>
      ))}
    </span>
  )
}

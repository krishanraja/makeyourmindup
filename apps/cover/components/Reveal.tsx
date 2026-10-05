'use client'

import { useEffect, useRef } from 'react'

/**
 * Adds `is-in` the first time its element scrolls into view. The server HTML
 * is always fully visible: the hidden starting state only applies once the
 * inline script has marked <html> with `js`, so a failed script load never
 * hides content, and reduced motion skips straight to the end.
 */
export function InView({
  children,
  className = '',
  as: Tag = 'div',
  style,
}: {
  children: React.ReactNode
  className?: string
  as?: 'div' | 'span' | 'section' | 'li'
  style?: React.CSSProperties
}) {
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    document.documentElement.classList.add('ready')
    const el = ref.current
    if (!el) return
    if (!('IntersectionObserver' in window)) {
      el.classList.add('is-in')
      return
    }
    const io = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          if (e.isIntersecting) {
            el.classList.add('is-in')
            io.disconnect()
          }
        }
      },
      { rootMargin: '0px 0px -60px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <Tag ref={ref as never} className={className} style={style}>
      {children}
    </Tag>
  )
}

/** Rises into place once, the first time it scrolls into view. */
export function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; y?: number; className?: string }) {
  return (
    <InView className={`reveal ${className}`} style={{ ['--d' as string]: `${delay}s` }}>
      {children}
    </InView>
  )
}

'use client'

import { motion, useReducedMotion, useSpring } from 'framer-motion'
import { useRef } from 'react'

/** Pulls its child toward a mouse pointer. Off for touch and reduced motion. */
export function Magnetic({
  children,
  strength = 0.3,
  className = '',
}: {
  children: React.ReactNode
  strength?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const x = useSpring(0, { stiffness: 220, damping: 16, mass: 0.4 })
  const y = useSpring(0, { stiffness: 220, damping: 16, mass: 0.4 })

  function move(e: React.PointerEvent) {
    if (reduce || e.pointerType !== 'mouse' || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    x.set((e.clientX - (r.left + r.width / 2)) * strength)
    y.set((e.clientY - (r.top + r.height / 2)) * strength)
  }
  function leave() {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div ref={ref} onPointerMove={move} onPointerLeave={leave} style={{ x, y }} className={`inline-block ${className}`}>
      {children}
    </motion.div>
  )
}

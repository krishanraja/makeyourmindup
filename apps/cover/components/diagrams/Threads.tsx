'use client'

import { motion, useInView, useReducedMotion } from 'framer-motion'
import { useRef } from 'react'
import { useMounted } from '../useMounted'
import { bez, C, DISPLAY, MONO } from './shared'

type Pt = [number, number]
const MEET: Pt = [300, 190]
// Three threads spaced evenly around the meeting point, 112 above and below.
const THREADS: [Pt, Pt, Pt, Pt][] = [
  [[24, 78], [130, 78], [210, 124], MEET],
  [[24, 206], [150, 206], [220, 194], MEET],
  [[24, 302], [130, 302], [210, 256], MEET],
]
const d = (p: [Pt, Pt, Pt, Pt]) => `M${p[0]} C${p[1]} ${p[2]} ${p[3]}`

/** mind.the.gap's device: threads on a time axis that bend and meet. */
export function Threads({ labels, axis, meet, call }: { labels: string[]; axis: string[]; meet: string; call: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const reduce = useReducedMotion()
  const mounted = useMounted()
  // Drawn in full on the server and for reduced motion; animated after mount.
  const still = reduce || !mounted
  const on = still || inView
  const draw = (delay: number, duration = 1.2) =>
    still
      ? {}
      : {
          initial: { pathLength: 0, opacity: 0 },
          animate: on ? { pathLength: 1, opacity: 1 } : {},
          transition: { duration, delay, ease: [0.65, 0, 0.35, 1] as const },
        }
  // Motion style is merged with any type style, so a label keeps its font.
  const pop = (delay: number, style: React.CSSProperties = {}) =>
    still
      ? { style }
      : {
          initial: { scale: 0, opacity: 0 },
          animate: on ? { scale: 1, opacity: 1 } : {},
          transition: { type: 'spring' as const, stiffness: 420, damping: 16, delay },
          style: { ...style, transformBox: 'fill-box' as const, transformOrigin: 'center' },
        }

  return (
    <div ref={ref}>
    <svg key={still ? 'still' : 'moving'} viewBox="0 0 480 390" className="h-auto w-full" role="img" aria-label={`${labels.join(', ')} meet at ${meet}, then ${call}`}>
      {/* The time axis and today. */}
      <motion.line x1="24" y1="350" x2="456" y2="350" stroke={C.cream} strokeOpacity="0.45" strokeWidth="2" {...draw(0, 0.8)} />
      <motion.line x1="240" y1="30" x2="240" y2="350" stroke={C.cream} strokeOpacity="0.25" strokeWidth="2" strokeDasharray="4 8" {...draw(0.2, 0.8)} />
      {axis.map((a, i) => (
        <text key={a} x={[24, 240, 456][i]} y="378" fill={C.cream} fillOpacity="0.7" fontSize="16" textAnchor={['start', 'middle', 'end'][i] as 'start'} style={MONO}>
          {a.toUpperCase()}
        </text>
      ))}

      {/* Three threads that look unrelated, until they are not. */}
      {THREADS.map((p, i) => (
        <g key={i}>
          <motion.path d={d(p)} fill="none" stroke={C.cream} strokeWidth="5" strokeLinecap="round" {...draw(0.3 + i * 0.25)} />
          <text x="24" y={p[0][1] - 22} fill={C.cream} fontSize="17" style={MONO}>
            {labels[i]}
          </text>
          {[0.55, 0.8].map((t, j) => {
            const [x, y] = bez(...p, t)
            return <motion.circle key={j} cx={x} cy={y} r="7" fill={C.ink} stroke={C.cream} strokeWidth="3.5" {...pop(1.2 + i * 0.15 + j * 0.1)} />
          })}
        </g>
      ))}

      {/* Where they meet is the pattern. */}
      <motion.circle cx={MEET[0]} cy={MEET[1]} r="26" fill="none" stroke={C.coral} strokeWidth="3" {...pop(1.9)} />
      <motion.circle cx={MEET[0]} cy={MEET[1]} r="14" fill={C.coral} {...pop(1.8)} />
      <motion.text x="456" y={MEET[1] + 64} fill={C.coral} fontSize="32" textAnchor="end" {...pop(2.0, DISPLAY)}>
        {meet}
      </motion.text>

      {/* What it means is coming, with a date on it. */}
      <motion.path d="M300,190 C348,190 384,150 424,128" fill="none" stroke={C.coral} strokeWidth="4" strokeDasharray="10 9" {...draw(2.2, 0.8)} />
      {/* The flag, its label and the axis all end on the same right margin, x 456. */}
      <motion.g {...pop(2.9)}>
        <line x1="424" y1="128" x2="424" y2="62" stroke={C.cream} strokeWidth="3" />
        <path d="M424,62 L456,74 L424,86 Z" fill={C.coral} />
      </motion.g>
      <motion.text x="456" y="46" fill={C.cream} fontSize="16" textAnchor="end" {...pop(3.0, MONO)}>
        {call}
      </motion.text>
    </svg>
    </div>
  )
}

'use client'

import { motion, useInView, useReducedMotion } from 'framer-motion'
import { useRef } from 'react'
import { useMounted } from '../useMounted'
import { C, SANS } from './shared'

type Part = { name: string; mark: string }

// Where each part lands once the thing comes apart, on a mirrored grid:
// left column x 16 to 164, right column 316 to 464, the centre box 180 to 300,
// and the bottom part centred on x 240. Centre of the whole is 240,190.
const SLOTS = [
  { x: 16, y: 40, w: 148 },
  { x: 316, y: 40, w: 148 },
  { x: 16, y: 167, w: 148 },
  { x: 316, y: 167, w: 148 },
  { x: 122, y: 312, w: 236 },
]
const CX = 240
const CY = 190

/** under.the.hood's device: the shipped thing, apart, every part stamped. */
export function RealOrTheatre({ centre, parts, real, theatre }: { centre: string; parts: Part[]; real: string; theatre: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const reduce = useReducedMotion()
  const mounted = useMounted()
  // Drawn in full on the server and for reduced motion; animated after mount.
  const still = reduce || !mounted
  const on = still || inView
  const words = centre.split(' ')
  const half = Math.ceil(words.length / 2)
  const c1 = words.slice(0, half).join(' ')
  const c2 = words.slice(half).join(' ')
  const H = 46

  return (
    <div ref={ref}>
    <svg
      key={still ? 'still' : 'moving'}
      viewBox="0 0 480 390"
      className="h-auto w-full"
      role="img"
      aria-label={`${centre}, taken apart: ${parts.map(p => `${p.name} is ${p.mark === 'real' ? real : theatre}`).join(', ')}.`}
    >
      {/* Wires back to the thing itself. */}
      {SLOTS.map((s, i) => (
        <motion.line
          key={`w${i}`}
          x1={CX}
          y1={CY}
          x2={s.x + s.w / 2}
          y2={s.y + H / 2}
          stroke={C.cream}
          strokeOpacity="0.3"
          strokeWidth="2"
          strokeDasharray="5 7"
          initial={still ? false : { pathLength: 0 }}
          animate={on ? { pathLength: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
        />
      ))}

      {/* The shiny new thing. */}
      <g>
        <rect x={CX - 60} y={CY - 38} width="120" height="76" fill={C.lilac} stroke={C.ink} strokeWidth="3" />
        <text x={CX} y={CY - 6} textAnchor="middle" fontSize="19" fill={C.ink} style={SANS}>
          {c1}
        </text>
        <text x={CX} y={CY + 18} textAnchor="middle" fontSize="19" fill={C.ink} style={SANS}>
          {c2}
        </text>
      </g>

      {parts.map((p, i) => {
        const s = SLOTS[i]
        const isReal = p.mark === 'real'
        const colour = isReal ? C.mint : C.lilac
        const label = (isReal ? real : theatre).toUpperCase()
        const sw = label.length * 11 + 18
        // Every stamp sits on its part's top edge, right aligned, at one angle.
        const sx = s.x + s.w - sw / 2 + 4
        const sy = s.y - 10
        return (
          <g key={p.name}>
            <motion.g
              initial={still ? false : { x: CX - (s.x + s.w / 2), y: CY - (s.y + H / 2), opacity: 0, scale: 0.4 }}
              animate={on ? { x: 0, y: 0, opacity: 1, scale: 1 } : {}}
              transition={{ type: 'spring', stiffness: 170, damping: 17, delay: 0.3 + i * 0.12 }}
              style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            >
              <rect x={s.x} y={s.y} width={s.w} height={H} fill={C.cream} stroke={C.ink} strokeWidth="2.5" />
              <text x={s.x + s.w / 2} y={s.y + H / 2 + 6} textAnchor="middle" fontSize="16.5" fill={C.ink} style={SANS}>
                {p.name}
              </text>
            </motion.g>
            {/* The stamp lands after the part does. */}
            <motion.g
              initial={still ? false : { opacity: 0, scale: 2.4 }}
              animate={on ? { opacity: 1, scale: 1 } : {}}
              transition={{ type: 'spring', stiffness: 520, damping: 20, delay: 1.3 + i * 0.22 }}
              style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            >
              <g transform={`rotate(-4 ${sx} ${sy})`}>
                <rect x={sx - sw / 2} y={sy - 14} width={sw} height="28" fill={C.ink} stroke={colour} strokeWidth="3" />
                <text
                  x={sx}
                  y={sy + 6}
                  textAnchor="middle"
                  fontSize="15"
                  fontWeight="700"
                  letterSpacing="2"
                  fill={colour}
                  style={{ fontFamily: 'var(--font-plex-mono), monospace' }}
                >
                  {label}
                </text>
              </g>
            </motion.g>
          </g>
        )
      })}
    </svg>
    </div>
  )
}

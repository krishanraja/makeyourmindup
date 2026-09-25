'use client'

import { motion, useInView, useReducedMotion } from 'framer-motion'
import { useRef } from 'react'
import { InView } from '../Reveal'
import { useMounted } from '../useMounted'
import { C, MONO, SANS } from './shared'

type Node = { key: string; x: number; y: number; w: number; h: number; label: string; ghost?: boolean }

/** follow.the.money's device: flows between parties, width is the amount. */
export function MoneyMap({
  labels,
}: {
  labels: { buyer: string; app: string; cloud: string; lab: string; ghost: string; ghostNote: string }
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const reduce = useReducedMotion()
  const mounted = useMounted()
  const still = reduce || !mounted
  const on = still || inView

  const nodes: Node[] = [
    { key: 'buyer', x: 12, y: 150, w: 140, h: 64, label: labels.buyer },
    { key: 'app', x: 196, y: 150, w: 112, h: 64, label: labels.app },
    { key: 'cloud', x: 350, y: 44, w: 118, h: 58, label: labels.cloud },
    { key: 'lab', x: 336, y: 262, w: 132, h: 58, label: labels.lab },
    { key: 'ghost', x: 12, y: 290, w: 160, h: 52, label: labels.ghost, ghost: true },
  ]

  const flows = [
    { d: 'M152,182 L196,182', w: 30, delay: 0.3 },
    { d: 'M308,170 C334,170 326,73 350,73', w: 16, delay: 0.7 },
    { d: 'M308,196 C330,196 318,291 336,291', w: 11, delay: 0.9 },
  ]

  const grow = (delay: number) =>
    still
      ? {}
      : {
          initial: { pathLength: 0 },
          animate: on ? { pathLength: 1 } : {},
          transition: { duration: 0.9, delay, ease: [0.65, 0, 0.35, 1] as const },
        }
  const land = (delay: number) =>
    still
      ? {}
      : {
          initial: { opacity: 0, y: 14 },
          animate: on ? { opacity: 1, y: 0 } : {},
          transition: { type: 'spring' as const, stiffness: 300, damping: 20, delay },
        }

  return (
    <div ref={ref}>
    <svg
      key={still ? 'still' : 'moving'}
      viewBox="0 0 480 390"
      className="h-auto w-full"
      role="img"
      aria-label={`Money flows from ${labels.buyer} to ${labels.app}, then on to ${labels.cloud} and ${labels.lab}. ${labels.ghost}: ${labels.ghostNote}.`}
    >
      {/* The money that stopped coming stays on the map as a ghost. */}
      <path d="M82,214 L82,290" stroke={C.cream} strokeOpacity="0.35" strokeWidth="10" strokeDasharray="6 8" fill="none" />

      {flows.map((f, i) => (
        <g key={i}>
          <motion.path d={f.d} stroke={C.butter} strokeWidth={f.w} fill="none" strokeLinecap="butt" {...grow(f.delay)} />
          <path d={f.d} stroke={C.ink} strokeWidth={Math.max(3, f.w / 5)} strokeDasharray="2 14" fill="none" className="money-flow" opacity={on ? 0.9 : 0} />
        </g>
      ))}

      {nodes.map((n, i) => (
        <motion.g key={n.key} {...land(i * 0.12)}>
          {!n.ghost && <rect x={n.x + 5} y={n.y + 5} width={n.w} height={n.h} fill={C.butter} />}
          <rect
            x={n.x}
            y={n.y}
            width={n.w}
            height={n.h}
            fill={n.ghost ? 'none' : C.cream}
            stroke={n.ghost ? C.cream : C.ink}
            strokeOpacity={n.ghost ? 0.45 : 1}
            strokeWidth="2.5"
            strokeDasharray={n.ghost ? '6 6' : undefined}
          />
          <text
            x={n.x + n.w / 2}
            y={n.y + n.h / 2 + 6}
            textAnchor="middle"
            fontSize="17"
            fill={n.ghost ? C.cream : C.ink}
            fillOpacity={n.ghost ? 0.6 : 1}
            style={SANS}
          >
            {n.label}
          </text>
        </motion.g>
      ))}

      <text x="12" y="372" fontSize="15" fill={C.cream} fillOpacity="0.6" style={MONO}>
        {labels.ghostNote}
      </text>
    </svg>
    </div>
  )
}

/** A till roll that prints the four questions every piece answers. */
export function Receipt({ title, lines, total }: { title: string; lines: string[]; total: string }) {
  return (
    <InView className="receipt-wrap receipt-shadow rotate-3">
    <div
      className="receipt w-[250px] bg-cream px-5 pb-8 pt-4 text-ink"
      style={{ fontFamily: 'var(--font-plex-mono)' }}
      aria-hidden="true"
    >
      <p className="text-center text-sm font-bold tracking-[0.3em]">{title.toUpperCase()}</p>
      <p className="mt-1 text-center text-[0.65rem] opacity-60">{'*'.repeat(26)}</p>
      <ul className="mt-2 space-y-1.5 text-[0.8rem]">
        {lines.map(l => (
          <li key={l} className="flex items-baseline gap-2">
            <span className="whitespace-nowrap uppercase">{l}</span>
            <span className="dot-leader" />
            <span className="font-bold">?</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 border-t-2 border-dashed border-ink/50 pt-2 text-[0.8rem] font-bold uppercase">{total}</p>
    </div>
    </InView>
  )
}

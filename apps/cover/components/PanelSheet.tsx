'use client'

import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import { JUDGES, SITE, type Judge } from '@/lib/content'

/*
  The panel, behind the staff box. Nothing on the page shows it until a reader
  goes looking: the staff box links open it as a sheet, and #panel or
  #panel-<judge> opens it straight from a shared link. The portraits load only
  when the sheet opens.
*/

const OPEN = 'panel:open'
const HASH = /^#panel(?:-([a-z_]+))?$/

type OpenDetail = { judge?: string; opener?: HTMLElement }

function hashFor(judge?: string) {
  return judge ? `#panel-${judge}` : '#panel'
}

/** A link in the staff box that opens the sheet, at one judge if it names one. */
export function PanelDoor({ judge, className = '', children, hidden = false }: { judge?: string; className?: string; children: React.ReactNode; hidden?: boolean }) {
  return (
    <a
      href={hashFor(judge)}
      className={className}
      {...(hidden ? { 'aria-hidden': true, tabIndex: -1 } : {})}
      onClick={e => {
        e.preventDefault()
        window.dispatchEvent(new CustomEvent<OpenDetail>(OPEN, { detail: { judge, opener: e.currentTarget } }))
      }}
    >
      {children}
    </a>
  )
}

/** The ten judges' heads, overlapping, from one small strip. The Chair sits this one out. */
export function PanelHeads({ className = '' }: { className?: string }) {
  const judges = JUDGES.filter(j => j.stamp !== 'chair')
  const last = judges.length - 1
  return (
    <span className={`inline-flex ${className}`}>
      {judges.map((j, i) => (
        <span
          key={j.id}
          className="-ml-[0.45em] inline-block h-[1.15em] w-[1.15em] rounded-full border-2 border-ink bg-ink transition-transform duration-200 first:ml-0 group-hover:-translate-y-[0.15em]"
          style={{
            backgroundImage: 'url(/panel/heads.webp)',
            backgroundSize: `${judges.length * 100}% 100%`,
            backgroundPosition: `${(i / last) * 100}% 0`,
            transitionDelay: `${i * 25}ms`,
          }}
        />
      ))}
    </span>
  )
}

const BOX = 'mono-label inline-flex min-h-[44px] items-center border-2 border-cream/40 font-semibold transition-colors hover:bg-cream hover:text-ink'

const STAMP: Record<Judge['stamp'], string> = {
  absolute: 'border-cream bg-cream text-ink rotate-[3deg]',
  veto: 'border-cream bg-ink text-cream -rotate-2',
  none: 'border-cream/45 bg-ink text-cream/70 -rotate-1',
  chair: 'border-dashed border-cream bg-ink text-cream rotate-2',
}

function Card({ judge, flipped, onFlip }: { judge: Judge; flipped: boolean; onFlip: () => void }) {
  const t = SITE.panel
  const face = '[grid-area:1/1] [backface-visibility:hidden] flex h-full flex-col border-2'
  return (
    <li data-judge={judge.id} className="relative w-[min(76vw,300px,46svh)] shrink-0 md:w-[min(300px,44svh)] snap-start [perspective:1400px]">
      <div
        className={`grid h-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] [transform-style:preserve-3d] ${flipped ? '[transform:rotateY(180deg)] motion-reduce:[transform:none]' : ''}`}
      >
        <div className={`${face} border-cream/15 bg-ink-soft ${flipped ? 'motion-reduce:opacity-0' : ''}`}>
          <div className="relative aspect-[5/4] w-full overflow-hidden border-b-2 border-cream/15 bg-ink [@media(min-width:768px)_and_(min-height:861px)]:aspect-square">
            <Image src={`/panel/${judge.id}.webp`} alt={judge.alt} fill sizes="(min-width: 768px) 300px, 76vw" className="object-cover object-[50%_30%]" />
            <span className={`stamp absolute left-3 top-3 ${STAMP[judge.stamp]}`}>{t.stamps[judge.stamp]}</span>
          </div>
          <div className="flex flex-1 flex-col gap-[clamp(0.35rem,1.2svh,0.75rem)] p-[clamp(0.75rem,2svh,1rem)]">
            <h3 className="display text-[clamp(1.5rem,4svh,2.1rem)] text-cream">{judge.name}</h3>
            <p className="dek text-[clamp(1rem,2.3svh,1.15rem)] leading-snug text-cream/90">‘{judge.says}’</p>
            <p className="mono-label mt-auto pt-1 text-mint" aria-hidden="true">
              {t.turn} ↻
            </p>
          </div>
        </div>

        <div
          className={`${face} gap-[clamp(0.35rem,1.2svh,0.75rem)] border-mint/50 bg-ink-deep p-[clamp(0.75rem,2svh,1.25rem)] [transform:rotateY(180deg)] motion-reduce:[transform:none] ${flipped ? '' : 'motion-reduce:opacity-0'}`}
        >
          <p className="mono-label text-mint">{judge.name}</p>
          <p className="mono-label mt-2 text-cream/55">{t.asks}</p>
          <p className="heavy text-[clamp(1rem,2.4svh,1.2rem)] leading-snug text-cream">{judge.asks}</p>
          <p className="mono-label mt-3 text-cream/55">{t.offLimits}</p>
          <p className="text-[clamp(0.95rem,2.2svh,1.05rem)] leading-relaxed text-cream/90">{judge.offLimits}</p>
          {judge.footnote && <p className="font-mono text-[0.75rem] leading-snug text-cream/55">{judge.footnote}</p>}
          <p className="mono-label mt-auto pt-1 text-mint" aria-hidden="true">
            {t.turnBack} ↺
          </p>
        </div>
      </div>
      <button
        type="button"
        aria-pressed={flipped}
        aria-label={`${t.turn}: ${judge.name}`}
        onClick={onFlip}
        className="absolute inset-0 z-10 cursor-pointer"
      />
    </li>
  )
}

export function PanelSheet() {
  const t = SITE.panel
  const dialog = useRef<HTMLDialogElement>(null)
  const shelf = useRef<HTMLUListElement>(null)
  const opener = useRef<HTMLElement | null>(null)
  const [flipped, setFlipped] = useState<Record<string, boolean>>({})

  const open = useCallback((judge?: string) => {
    const d = dialog.current
    const s = shelf.current
    if (!d || !s) return
    if (!d.open) {
      d.showModal()
      document.documentElement.style.overflow = 'hidden'
    }
    const card = judge ? s.querySelector<HTMLElement>(`[data-judge="${judge}"]`) : null
    s.scrollLeft = card ? card.offsetLeft - parseFloat(getComputedStyle(s).paddingLeft) : 0
    if (card) card.querySelector('button')?.focus({ preventScroll: true })
  }, [])

  // Deep links: #panel opens the sheet, #panel-<judge> opens it at that card.
  useEffect(() => {
    const fromHash = () => {
      const m = window.location.hash.match(HASH)
      if (!m) return
      const judge = m[1] && JUDGES.some(j => j.id === m[1]) ? m[1] : undefined
      open(judge)
    }
    const onOpen = (e: Event) => {
      const { judge, opener: el } = (e as CustomEvent<OpenDetail>).detail
      opener.current = el ?? null
      history.replaceState(null, '', hashFor(judge))
      open(judge)
    }
    fromHash()
    window.addEventListener('hashchange', fromHash)
    window.addEventListener(OPEN, onOpen)
    return () => {
      window.removeEventListener('hashchange', fromHash)
      window.removeEventListener(OPEN, onOpen)
    }
  }, [open])

  const onClose = () => {
    document.documentElement.style.overflow = ''
    if (HASH.test(window.location.hash)) history.replaceState(null, '', window.location.pathname + window.location.search)
    opener.current?.focus({ preventScroll: true })
    opener.current = null
  }

  const step = (dir: 1 | -1) => {
    const s = shelf.current
    const first = s?.querySelector('li')
    if (!s || !first) return
    s.scrollBy({ left: dir * (first.getBoundingClientRect().width + parseFloat(getComputedStyle(s).columnGap || '0')), behavior: 'smooth' })
  }

  return (
    <dialog
      ref={dialog}
      aria-labelledby="panel-title"
      onClose={onClose}
      // A click on the backdrop lands on the dialog itself; the sheet inside catches every other click.
      onClick={e => e.target === e.currentTarget && dialog.current?.close()}
      className="panel-sheet fixed inset-x-0 bottom-0 top-auto m-0 h-[92svh] max-h-full w-full max-w-full overflow-hidden border-0 border-t-2 border-mint bg-ink p-0 text-cream backdrop:bg-ink-deep/85 md:inset-0 md:m-auto md:h-fit md:max-h-[90svh] md:w-[min(1240px,94vw)] md:border-2"
    >
      <div className="flex h-full max-h-[inherit] flex-col overflow-y-auto">
        <div className="px-4 pt-[clamp(0.75rem,2.2svh,1.75rem)] sm:px-6 md:px-8">
          <div className="flex items-center justify-between gap-4">
            <p id="panel-title" className="mono-label flex items-center gap-3 text-mint">
              <span className="h-px w-10 bg-mint" aria-hidden="true" />
              {t.eyebrow}
            </p>
            <div className="flex shrink-0 gap-2">
              <button type="button" onClick={() => step(-1)} aria-label={t.previous} className={`${BOX} hidden min-w-[44px] justify-center md:inline-flex`}>
                <span aria-hidden="true">←</span>
              </button>
              <button type="button" onClick={() => step(1)} aria-label={t.next} className={`${BOX} hidden min-w-[44px] justify-center md:inline-flex`}>
                <span aria-hidden="true">→</span>
              </button>
              <button type="button" onClick={() => dialog.current?.close()} className={`${BOX} gap-2 px-4`}>
                {t.close} <span aria-hidden="true">✕</span>
              </button>
            </div>
          </div>
          <p className="mt-[clamp(0.25rem,1svh,0.5rem)] max-w-3xl text-[clamp(0.85rem,2svh,1.1rem)] leading-relaxed text-cream/85">{t.line}</p>
        </div>

        <ul
          ref={shelf}
          data-bleed
          className="relative mt-[clamp(0.6rem,2.2svh,1.5rem)] flex shrink-0 snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:thin] sm:scroll-px-6 sm:px-6 md:scroll-px-8 md:gap-5 md:px-8"
        >
          {JUDGES.map(j => (
            <Card key={j.id} judge={j} flipped={!!flipped[j.id]} onFlip={() => setFlipped(f => ({ ...f, [j.id]: !f[j.id] }))} />
          ))}
        </ul>

        <div className="mt-auto border-t-2 border-cream/10 px-4 py-[clamp(0.5rem,1.6svh,1rem)] sm:px-6 md:px-8 [@media(max-width:767px)_and_(max-height:600px)]:hidden">
          <ul className="mono-label flex flex-wrap gap-x-4 gap-y-0.5 text-[0.625rem] tracking-[0.1em] text-cream/65 md:gap-x-5 md:text-xs md:tracking-[0.14em]">
            {t.bar.map(b => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
      </div>
    </dialog>
  )
}

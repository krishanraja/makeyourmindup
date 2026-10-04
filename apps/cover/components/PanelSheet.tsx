'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { JUDGES, SITE, type Judge } from '@/lib/content'
import { Avatar } from './Avatar'

/*
  The panel, behind the staff box. Nothing on the page shows it until a reader
  goes looking: the staff box links open it as one small card, and #panel or
  #panel-<judge> opens it straight from a shared link. One judge at a time,
  with every face along the bottom to jump between them.
*/

const OPEN = 'panel:open'
const HASH = /^#panel(?:-([a-z_]+))?$/

type OpenDetail = { judge?: string; opener?: HTMLElement }

function hashFor(judge?: string) {
  return judge ? `#panel-${judge}` : '#panel'
}

/** A link in the staff box that opens the card, at one judge if it names one. */
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

/** The ten judges' faces, overlapping. The Chair sits this one out. */
export function PanelHeads({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex ${className}`}>
      {JUDGES.filter(j => j.stamp !== 'chair').map(j => (
        <Avatar
          key={j.id}
          id={j.id}
          className="-ml-[0.4em] h-[1.15em] w-[1.15em] shrink-0 transition-transform duration-200 first:ml-0 group-hover:-translate-y-[0.15em]"
        />
      ))}
    </span>
  )
}

const STAMP: Record<Judge['stamp'], string> = {
  absolute: 'border-cream bg-cream text-ink',
  veto: 'border-cream bg-ink text-cream',
  none: 'border-cream/45 bg-ink text-cream/70',
  chair: 'border-dashed border-cream bg-ink text-cream',
}

export function PanelSheet() {
  const t = SITE.panel
  const dialog = useRef<HTMLDialogElement>(null)
  const opener = useRef<HTMLElement | null>(null)
  const swipe = useRef<number | null>(null)
  const [at, setAt] = useState(-1) // -1 is the introduction
  const [flipped, setFlipped] = useState(false)
  const judge = at >= 0 ? JUDGES[at] : null

  const focusJudge = (i: number) =>
    requestAnimationFrame(() => dialog.current?.querySelector<HTMLElement>(`[data-judge="${JUDGES[i].id}"]`)?.focus())

  const go = useCallback((i: number, focus = false) => {
    const n = Math.max(-1, Math.min(JUDGES.length - 1, i))
    setAt(n)
    setFlipped(false)
    if (dialog.current?.open) history.replaceState(null, '', hashFor(n >= 0 ? JUDGES[n].id : undefined))
    if (focus && n >= 0) focusJudge(n)
  }, [])

  const open = useCallback((id?: string) => {
    const d = dialog.current
    if (!d) return
    const i = id ? JUDGES.findIndex(j => j.id === id) : -1
    setAt(i)
    setFlipped(false)
    if (!d.open) d.showModal()
    if (i >= 0) focusJudge(i)
  }, [])

  // Deep links: #panel opens the card, #panel-<judge> opens it at that judge.
  useEffect(() => {
    const fromHash = () => {
      const m = window.location.hash.match(HASH)
      if (!m) return
      open(m[1] && JUDGES.some(j => j.id === m[1]) ? m[1] : undefined)
    }
    const onOpen = (e: Event) => {
      const { judge: id, opener: el } = (e as CustomEvent<OpenDetail>).detail
      opener.current = el ?? null
      history.replaceState(null, '', hashFor(id))
      open(id)
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
    if (HASH.test(window.location.hash)) history.replaceState(null, '', window.location.pathname + window.location.search)
    opener.current?.focus({ preventScroll: true })
    opener.current = null
  }

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') go(at + 1, true)
    else if (e.key === 'ArrowLeft') go(at - 1, true)
    else return
    e.preventDefault()
  }

  const face = '[grid-area:1/1] [backface-visibility:hidden] flex flex-col'
  const counter = judge ? t.counter.replace('{n}', String(at + 1)).replace('{total}', String(JUDGES.length)) : ''

  return (
    <dialog
      ref={dialog}
      aria-labelledby="panel-title"
      onClose={onClose}
      onKeyDown={onKey}
      // A click on the backdrop lands on the dialog itself; the card inside catches every other click.
      onClick={e => e.target === e.currentTarget && dialog.current?.close()}
      className="panel-card fixed inset-x-3 bottom-3 top-auto mx-auto my-0 h-fit max-h-[calc(100svh-1.5rem)] w-auto max-w-[26rem] overflow-visible border-0 bg-transparent p-0 text-cream backdrop:bg-ink-deep/55 md:inset-0 md:m-auto md:w-[26rem]"
    >
      <div className="brutal-mint flex max-h-[calc(100svh-1.5rem)] flex-col overflow-y-auto border-2 border-cream bg-ink">
        <div className="flex items-center justify-between gap-3 pl-4 pr-1">
          <p id="panel-title" className="mono-label flex items-center gap-3 text-mint">
            {t.eyebrow}
            {counter && <span className="text-cream/50">{counter}</span>}
          </p>
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            aria-label={t.close}
            className="mono-label inline-flex h-11 w-11 items-center justify-center text-base transition-colors hover:text-mint"
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>

        <div
          aria-live="polite"
          className="px-4 pb-1 [perspective:1400px]"
          onPointerDown={e => (swipe.current = e.clientX)}
          onPointerUp={e => {
            if (swipe.current === null) return
            const dx = e.clientX - swipe.current
            swipe.current = null
            if (Math.abs(dx) > 48) go(at + (dx < 0 ? 1 : -1))
          }}
        >
          {!judge ? (
            <div className="min-h-[9.5rem] pb-3">
              <p className="text-[0.95rem] leading-relaxed text-cream/90">{t.line}</p>
              <p className="dek mt-3 text-[1.05rem] text-mint">{t.hint}</p>
            </div>
          ) : (
            <>
              <div
                key={judge.id}
                className={`grid min-h-[9.5rem] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] [transform-style:preserve-3d] ${flipped ? '[transform:rotateY(180deg)] motion-reduce:[transform:none]' : ''}`}
              >
                <div className={`${face} ${flipped ? 'motion-reduce:opacity-0' : ''}`} aria-hidden={flipped}>
                  <div className="flex items-center gap-4">
                    <Avatar id={judge.id} label={judge.alt} className="h-[5.5rem] w-[5.5rem] shrink-0" />
                    <div className="min-w-0">
                      <h3 className="display text-[1.7rem] text-cream">{judge.name}</h3>
                      <span className={`stamp mt-2 ${STAMP[judge.stamp]}`}>{t.stamps[judge.stamp]}</span>
                    </div>
                  </div>
                  <p className="dek mt-3 text-[1.1rem] leading-snug text-cream">‘{judge.says}’</p>
                </div>
                <div
                  className={`${face} gap-1.5 [transform:rotateY(180deg)] motion-reduce:[transform:none] ${flipped ? '' : 'motion-reduce:opacity-0'}`}
                  aria-hidden={!flipped}
                >
                  <p className="mono-label text-cream/55">{t.asks}</p>
                  <p className="heavy text-[1.02rem] leading-snug">{judge.asks}</p>
                  <p className="mono-label mt-2 text-cream/55">{t.offLimits}</p>
                  <p className="text-[0.95rem] leading-relaxed text-cream/90">{judge.offLimits}</p>
                  {judge.footnote && <p className="font-mono text-[0.72rem] leading-snug text-cream/55">{judge.footnote}</p>}
                </div>
              </div>
              <button
                type="button"
                aria-pressed={flipped}
                onClick={() => setFlipped(f => !f)}
                className="mono-label -ml-1 mt-1 inline-flex h-11 items-center gap-2 px-1 text-mint transition-colors hover:text-cream"
              >
                {flipped ? t.turnBack : t.turn} <span aria-hidden="true">{flipped ? '↺' : '↻'}</span>
              </button>
            </>
          )}
        </div>

        <ul className="flex justify-between border-t-2 border-cream/15 px-2.5">
          {JUDGES.map((j, i) => (
            <li key={j.id}>
              <button
                type="button"
                data-judge={j.id}
                aria-label={j.name}
                aria-current={i === at ? 'true' : undefined}
                onClick={() => go(i)}
                className="group flex h-12 w-[1.9rem] items-center justify-center"
              >
                <span
                  className={`rounded-full transition-transform duration-200 ${i === at ? 'scale-125 outline outline-2 outline-offset-1 outline-mint' : 'opacity-70 group-hover:-translate-y-0.5 group-hover:opacity-100'}`}
                >
                  <Avatar id={j.id} className="block h-7 w-7" />
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </dialog>
  )
}

'use client'

import Image from 'next/image'
import { ACCENT, SITE, subscribeUrl } from '@/lib/content'
import type { Post } from '@/lib/rss'
import { Magnetic } from './Magnetic'
import { SubscribeForm } from './SubscribeForm'

// A deterministic barcode, so two builds render the same bars.
const BARS = '3121123211311213121131221213111231121321'.split('').map(Number)

function Barcode() {
  let x = 0
  const rects = BARS.map((w, i) => {
    const r = i % 2 === 0 ? <rect key={i} x={x} y={0} width={w * 2} height={58} /> : null
    x += w * 2
    return r
  })
  return (
    <svg viewBox={`0 0 ${x} 58`} className="h-12 w-auto" aria-hidden="true" fill="currentColor">
      {rects}
    </svg>
  )
}

function SpinBadge() {
  const t = SITE.cover
  return (
    <Magnetic strength={0.35}>
      <a
        href={subscribeUrl()}
        target="_blank"
        rel="noopener"
        aria-label={`${t.badgeLabel} (${SITE.a11y.newTab})`}
        className="group relative block h-[120px] w-[120px] md:h-[164px] md:w-[164px]"
      >
        <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full animate-spin-slow" aria-hidden="true">
          <defs>
            <path id="badge-circle" d="M100,100 m-80,0 a80,80 0 1,1 160,0 a80,80 0 1,1 -160,0" />
          </defs>
          <circle cx="100" cy="100" r="99" fill="#7EF0C0" />
          <text fill="#0C1512" fontSize="17" fontWeight="700" style={{ fontFamily: 'var(--font-plex-mono)', letterSpacing: '0.12em' }}>
            <textPath href="#badge-circle" textLength="500" lengthAdjust="spacing">
              {t.badge.repeat(2).toUpperCase()}
            </textPath>
          </text>
        </svg>
        <span className="absolute inset-[26%] flex items-center justify-center rounded-full border-2 border-ink bg-ink transition-transform duration-300 group-hover:scale-110">
          <svg viewBox="0 0 24 24" className="h-1/2 w-1/2 text-mint" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="square">
            <path d="M7 17 17 7M9 7h8v8" />
          </svg>
        </span>
      </a>
    </Magnetic>
  )
}

function Sticker({ children, className, delay, rotate }: { children: React.ReactNode; className: string; delay: number; rotate: number }) {
  return (
    <span className={`sticker slap ${className}`} style={{ ['--r' as string]: `${rotate}deg`, ['--d' as string]: `${delay}s` }}>
      {children}
    </span>
  )
}

const d = (s: number) => ({ ['--d' as string]: `${s}s` }) as React.CSSProperties

export function Cover({ latest }: { latest?: Post }) {
  const t = SITE.cover
  const [line1, line2] = t.splash
  const [s1, s2, s3] = t.stickers

  return (
    <header className="grain relative overflow-hidden bg-ink">
      <div className="page relative z-10 flex min-h-[100svh] flex-col pb-10 pt-4 md:pb-14">
        {/* The strap: every magazine has one. */}
        <div className="mono-label flex items-center justify-between gap-4 border-y border-cream/25 py-2 text-cream/75">
          <span>
            {SITE.strap.left} <span aria-hidden="true">·</span> {t.issue}
          </span>
          <span className="hidden sm:inline">{SITE.strap.centre}</span>
          <span>{SITE.strap.right}</span>
        </div>

        {/* The masthead. */}
        <div className="drop relative mt-6 md:mt-8">
          <h1 className="sr-only">{SITE.a11y.masthead}</h1>
          <Image
            src="/brand/masthead.png"
            alt=""
            width={2415}
            height={740}
            priority
            sizes="(min-width: 1024px) 700px, 94vw"
            className="h-auto w-full max-w-[700px]"
          />
          {/* On wide screens the badge fills the space beside the masthead. */}
          <div className="absolute right-6 top-0 hidden lg:block">
            <SpinBadge />
            <div className="absolute -left-24 top-24">
              <Sticker className="bg-butter text-[0.8rem]" delay={1.0} rotate={-9}>
                {s1}
              </Sticker>
            </div>
          </div>
        </div>

        {/* The splash and the cover lines. */}
        <div className="mt-7 grid flex-1 grid-cols-1 gap-10 md:mt-8 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <span style={d(0.25)} className="enter mono-label inline-block bg-coral px-2 py-1 font-semibold text-ink">
              {t.kicker}
            </span>
            <h2 className="display mt-4 text-[clamp(4.2rem,15vw,8.6rem)] text-cream" aria-label={`${line1} ${line2}`}>
              <span style={d(0.4)} className="enter block" aria-hidden="true">
                {line1}
              </span>
              <span style={d(0.55)} className="enter mt-[0.12em] block" aria-hidden="true">
                <span className="swipe text-ink" style={{ ['--swipe' as string]: '#7EF0C0' }}>
                  {line2}
                </span>
              </span>
            </h2>
            <p style={d(0.8)} className="enter dek mt-8 max-w-xl text-[1.4rem] leading-snug text-cream/90 md:text-[1.65rem]">
              {t.dek}
            </p>

            <div className="mt-6 flex flex-wrap gap-3 lg:hidden">
              <Sticker className="bg-butter" delay={1.0} rotate={-4}>
                {s1}
              </Sticker>
              <Sticker className="bg-coral" delay={1.1} rotate={3}>
                {s2}
              </Sticker>
              <Sticker className="bg-lilac" delay={1.2} rotate={-2}>
                {s3}
              </Sticker>
            </div>

            <div style={d(1.0)} className="enter mt-7">
              <SubscribeForm tone="dark" id="cover" />
            </div>
          </div>

          <aside className="relative lg:col-span-5 lg:pl-4" aria-labelledby="cover-lines">
            <div className="absolute -top-6 right-2 hidden lg:block">
              <Sticker className="bg-coral" delay={1.15} rotate={6}>
                {s2}
              </Sticker>
            </div>
            <p id="cover-lines" className="mono-label border-b border-cream/25 pb-2 text-cream/70">
              {latest ? t.thisWeek : t.coverLinesTitle}
            </p>
            {latest && (
              <a
                style={d(0.6)}
                href={latest.link}
                target="_blank"
                rel="noopener"
                className="enter group block border-b border-cream/25 py-4"
              >
                <span className="display block text-[clamp(2rem,4vw,3rem)] text-mint group-hover:underline">{latest.title}</span>
              </a>
            )}
            <ul>
              {SITE.subchannels.map((s, i) => (
                <li key={s.slug} style={d(0.7 + i * 0.12)} className="slide border-b border-cream/25">
                  <a href={`#${s.slug}`} className="group block py-4 transition-transform duration-200 hover:translate-x-2">
                    <span className="flex items-center gap-3">
                      <span className={`mono-label px-2 py-0.5 font-semibold text-ink ${ACCENT[s.slug].bg}`}>{s.label}</span>
                      <span className="mono-label text-cream/60">{s.day}</span>
                    </span>
                    <span className={`display mt-2 block text-[clamp(2rem,3.6vw,2.9rem)] text-cream transition-colors ${ACCENT[s.slug].hoverText}`}>
                      {s.coverLine}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-4 hidden lg:block">
              <Sticker className="bg-lilac" delay={1.3} rotate={-3}>
                {s3}
              </Sticker>
            </div>
          </aside>
        </div>

        {/* The price box and the badge. */}
        <div className="mt-10 flex items-end justify-between gap-6">
          <div className="flex items-end gap-4">
            <div className="flex flex-col items-start bg-cream p-2 text-ink">
              <span className="mono-label text-[0.6rem]">{t.issue}</span>
              <Barcode />
            </div>
            <div>
              <p className="display text-5xl text-butter md:text-6xl">{t.barcodePrice}</p>
              <p className="mt-1 max-w-[16rem] text-xs text-cream/60">{t.footnote}</p>
            </div>
          </div>
          <div className="lg:hidden">
            <SpinBadge />
          </div>
        </div>
      </div>
    </header>
  )
}


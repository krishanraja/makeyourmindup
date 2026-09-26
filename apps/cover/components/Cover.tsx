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
        className="group relative block h-[min(140px,15svh)] w-[min(140px,15svh)]"
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

  const priceBox = (
    <div className="flex flex-wrap items-end gap-4">
      <div className="flex flex-col items-start bg-cream p-2 text-ink">
        <span className="mono-label text-[0.6rem]">{t.issue}</span>
        <Barcode />
      </div>
      <div className="min-w-[8rem] flex-1">
        <p className="display text-[clamp(2.4rem,6svh,3.75rem)] text-butter">{t.barcodePrice}</p>
        <p className="mt-1 max-w-[16rem] text-xs text-cream/60">{t.footnote}</p>
      </div>
    </div>
  )

  /*
    One screen, on any device. Everything that stacks vertically is sized by
    the screen's height as well as its width (svh), so a short laptop gets a
    smaller cover rather than a longer one. Phones leave out what the next
    screens repeat: the section list (the contents), the price box and badge
    (the form is right there), and two of the three stickers (the marquee).
    The cover fills the screen only where it has the content to: tablet up,
    and tall phones, which get the section list back. Shorter phones end at
    the form and the next section shows underneath.
  */
  return (
    <header className="grain relative overflow-hidden bg-ink">
      <div className="page relative z-10 flex flex-col pb-[clamp(0.75rem,3svh,3.5rem)] pt-[clamp(0.5rem,1.6svh,1rem)] md:min-h-[100svh] [@media(min-height:840px)]:min-h-[100svh]">
        {/*
          The masthead: a wide, shallow band, the way a magazine sets its name,
          so the cover line underneath is the one loud thing. From tablet up
          the subscribe badge sits at the end of the band.
        */}
        <div className="drop relative mt-[clamp(0.25rem,1.2svh,0.75rem)] flex items-center justify-between gap-6">
          <h1 className="sr-only">{SITE.a11y.masthead}</h1>
          <Image
            src="/brand/wordmark.png"
            alt=""
            width={3319}
            height={391}
            priority
            sizes="(min-width: 768px) 1100px, 94vw"
            className="h-auto w-full min-w-0 md:w-[min(100%,100svh)]"
          />
          <div className="hidden shrink-0 md:block">
            <SpinBadge />
          </div>
        </div>

        {/* The dateline, under the masthead. */}
        <div className="mono-label mt-[clamp(0.5rem,1.6svh,1rem)] flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-y border-cream/25 py-2 text-cream/75">
          <span>
            {SITE.strap.left} <span aria-hidden="true">·</span> {t.issue}
          </span>
          <span className="hidden sm:inline">{SITE.strap.centre}</span>
          <span>{SITE.strap.right}</span>
        </div>

        {/* The splash and the cover lines. */}
        <div className="mt-[clamp(0.75rem,2.6svh,2rem)] grid flex-1 grid-cols-1 gap-8 md:grid-cols-12 md:gap-8">
          <div className="flex min-w-0 flex-col md:col-span-7">
            <span style={d(0.25)} className="enter mono-label inline-block self-start bg-coral px-2 py-1 font-semibold text-ink">
              {t.kicker}
            </span>
            <div className="relative">
              <h2
                className="display mt-[clamp(0.4rem,1.4svh,1rem)] text-[clamp(2.6rem,min(19vw,11.5svh),8.6rem)] text-cream md:text-[clamp(2.6rem,min(11vw,12svh),9.5rem)]"
                aria-label={`${line1} ${line2}`}
              >
                <span style={d(0.4)} className="enter block" aria-hidden="true">
                  {line1}
                </span>
                <span style={d(0.55)} className="enter mt-[0.12em] block" aria-hidden="true">
                  <span className="swipe text-ink" style={{ ['--swipe' as string]: '#7EF0C0' }}>
                    {line2}
                  </span>
                </span>
              </h2>
              {/* A sticker slaps on beside the short first line, where it costs no height. */}
              <div className="absolute right-0 top-[18%] md:hidden">
                <Sticker className="bg-butter text-[0.62rem]" delay={1.0} rotate={-6}>
                  {s1}
                </Sticker>
              </div>
              <div className="absolute right-[6%] top-[16%] hidden md:block">
                <Sticker className="bg-coral" delay={1.15} rotate={5}>
                  {s2}
                </Sticker>
              </div>
            </div>
            <p style={d(0.8)} className="enter dek mt-[clamp(0.5rem,2.2svh,2rem)] max-w-xl text-[clamp(1rem,2.8svh,1.65rem)] leading-snug text-cream/90">
              {t.dek}
            </p>

            {/* Tall phones have room for the cover lines again, as a real cover does. */}
            <ul className="mt-[clamp(0.75rem,2.4svh,1.5rem)] hidden border-t border-cream/25 [@media(max-width:767px)_and_(min-height:840px)]:block" aria-label={t.coverLinesTitle}>
              {SITE.subchannels.map(s => (
                <li key={s.slug} className="border-b border-cream/25">
                  <a href={`#${s.slug}`} className="block py-2.5">
                    <span className="flex items-center gap-2">
                      <span className={`mono-label px-1.5 py-0.5 text-[0.65rem] font-semibold text-ink ${ACCENT[s.slug].bg}`}>{s.label}</span>
                      <span className="mono-label text-[0.65rem] text-cream/60">{s.day}</span>
                    </span>
                    <span className="display mt-1 block text-[1.45rem] text-cream">{s.coverLine}</span>
                  </a>
                </li>
              ))}
            </ul>

            <div style={d(1.0)} className="enter mt-auto pt-[clamp(0.75rem,2.6svh,1.75rem)]">
              <SubscribeForm tone="dark" id="cover" />
              <p className="mt-1 text-xs text-cream/60 md:hidden">{t.footnote}</p>
            </div>
          </div>

          <aside className="relative hidden min-w-0 md:col-span-5 md:flex md:flex-col md:pl-4" aria-labelledby="cover-lines">
            <p id="cover-lines" className="mono-label border-b border-cream/25 pb-2 text-cream/70">
              {latest ? t.thisWeek : t.coverLinesTitle}
            </p>
            {latest && (
              <a
                style={d(0.6)}
                href={latest.link}
                target="_blank"
                rel="noopener"
                className="enter group block border-b border-cream/25 py-[clamp(0.5rem,1.6svh,1rem)]"
              >
                <span className="display block text-[clamp(1.4rem,min(4vw,4.6svh),3rem)] text-mint group-hover:underline">{latest.title}</span>
              </a>
            )}
            <ul>
              {SITE.subchannels.map((s, i) => (
                <li key={s.slug} style={d(0.7 + i * 0.12)} className="slide border-b border-cream/25">
                  <a href={`#${s.slug}`} className="group block py-[clamp(0.5rem,1.6svh,1rem)] transition-transform duration-200 hover:translate-x-2">
                    <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className={`mono-label px-2 py-0.5 font-semibold text-ink ${ACCENT[s.slug].bg}`}>{s.label}</span>
                      <span className="mono-label text-cream/60">{s.day}</span>
                    </span>
                    <span className={`display mt-[clamp(0.25rem,0.8svh,0.5rem)] block text-[clamp(1.3rem,min(3.6vw,4.2svh),2.9rem)] text-cream transition-colors ${ACCENT[s.slug].hoverText}`}>
                      {s.coverLine}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-[clamp(0.5rem,1.6svh,1rem)]">
              <Sticker className="bg-lilac" delay={1.3} rotate={-3}>
                {s3}
              </Sticker>
            </div>
            <div className="mt-auto pt-[clamp(0.75rem,2.4svh,2rem)]">{priceBox}</div>
          </aside>
        </div>
      </div>
    </header>
  )
}

'use client'

import Image from 'next/image'
import { useState } from 'react'
import { CONFIG, SITE } from '@/lib/content'
import styles from './Cover.module.css'

const d = (s: number) => ({ ['--d' as string]: `${s}s` }) as React.CSSProperties

/*
  The cover: the operating theatre. Chosen by Krish on 26 September 2026 after
  three rounds of blind judging (115 of 140, first with both judges).

  Reading order, top to bottom: the name (the stacked logo, never part of a
  sentence), the dateline, the photo with its two stamps, "AI, UNPICKED.",
  then the dek, the sections and the form. The photo is cut at the table's
  edge and the three threads hang into the headline.
*/
export function Cover() {
  const t = SITE.cover
  const th = t.theatre
  const s = SITE.subscribe
  const [sent, setSent] = useState(false)
  const [line1, line2] = t.splash
  const cls: Record<string, string> = { under_the_hood: styles.uth, follow_the_money: styles.ftm, mind_the_gap: styles.mtg }
  const short = (day: string) => day.slice(0, 3)

  const key = (variant: string) => (
    <ul className={`${styles.key} ${variant}`} aria-label="Sections">
      {SITE.subchannels.map(sc => (
        <li key={sc.slug} className={cls[sc.slug]}>
          <span className={styles.nm}>{sc.label}</span>
          <span className={styles.dy}>
            <span aria-hidden="true">{short(sc.day)}</span>
            <span className="sr-only">{sc.day}</span>
          </span>
        </li>
      ))}
    </ul>
  )

  return (
    <header className="grain relative overflow-hidden bg-ink">
      <div className={styles.cover}>
        <div className={`${styles.mast} drop`}>
          <h1 className="sr-only">{SITE.a11y.masthead}</h1>
          <Image
            src="/brand/masthead.png"
            alt=""
            width={2415}
            height={740}
            priority
            sizes="(min-width: 1200px) 260px, (min-width: 701px) and (orientation: landscape) 260px, 45vw"
            className={styles.logo}
          />
          <div className={styles.mastR}>
            {key(styles.keyWide)}
            <p className={styles.dateline}>
              <span className={styles.vol}>
                {SITE.strap.left} · {t.issue}
              </span>
              <span className={styles.days}>{SITE.strap.centre}</span>
              <span className={styles.price}>{SITE.strap.right}</span>
            </p>
          </div>
        </div>

        <section className={styles.theatre} aria-label={SITE.a11y.illustration}>
          <div className={styles.plate}>
            <Image src="/cover/theatre.webp" alt={th.photoAlt} width={2000} height={550} priority sizes="100vw" className={styles.photo} />
            <Image src="/cover/threads.png" alt="" width={175} height={120} className={styles.threads} />
            <svg className={styles.leaders} viewBox="0 0 2000 550" preserveAspectRatio="none" aria-hidden="true">
              <g className={styles.leadWide}>
                <path d="M1212 258 L1040 172 L872 172" />
                <path d="M1628 292 L1700 172 L1728 172" />
                <circle cx="1212" cy="258" r="7" />
                <circle cx="1628" cy="292" r="7" />
              </g>
              <g className={styles.leadPhone}>
                <path d="M1160 170 L1212 258" />
                <path d="M1651 170 L1628 290" />
                <circle cx="1212" cy="258" r="9" />
                <circle cx="1628" cy="292" r="9" />
              </g>
            </svg>
            <div className={`${styles.chart} ${styles.at}`}>
              <span className={styles.chartSec}>{th.chartSection}</span>
              <span className={styles.chartQ}>{th.chartLine}</span>
            </div>
            <div className={`${styles.note} ${styles.at} ${styles.nStuff}`}>
              <span className={styles.part}>{th.stuffing.part}</span>
              <span className={`${styles.stamp} ${styles.stampReal}`}>{th.stuffing.stamp}</span>
            </div>
            <div className={`${styles.note} ${styles.at} ${styles.nVisor}`}>
              <span className={styles.part}>{th.visor.part}</span>
              <span className={styles.stamp}>{th.visor.stamp}</span>
            </div>
          </div>
        </section>

        <h2 className={`${styles.hed} enter`} style={d(0.2)} aria-label={`${line1} ${line2}`}>
          <span aria-hidden="true">{line1}</span> <span aria-hidden="true">{line2}</span>
        </h2>

        <div className={`${styles.foot} enter`} style={d(0.45)}>
          <div className={styles.lede}>
            <p className={styles.dek}>{t.dek}</p>
            {key(styles.keyNarrow)}
            <p className={`${styles.small} ${styles.footnoteWide}`}>{t.footnote}</p>
          </div>
          {/* A plain GET form to Substack, which prefills the email. Works with JavaScript off. */}
          <form
            className={styles.sub}
            action={`${CONFIG.substackUrl}/subscribe`}
            method="get"
            target="_blank"
            onSubmit={() => setSent(true)}
            aria-describedby="cover-note"
          >
            <label className={styles.label} htmlFor="cover-email">
              {s.label}
            </label>
            <div className={styles.bar}>
              <input id="cover-email" name="email" type="email" inputMode="email" autoComplete="email" placeholder={s.placeholder} required />
              <button type="submit">{s.button}</button>
            </div>
            <p id="cover-note" className={`${styles.small} ${styles.note2}`} aria-live="polite">
              {sent ? s.sent : s.note}
            </p>
            <p className={`${styles.small} ${styles.footnotePhone}`}>{t.footnote}</p>
          </form>
        </div>
      </div>
    </header>
  )
}

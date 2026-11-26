'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { keys, type Desk, type Piece, type Snapshot } from '@/lib/hub'
import { EditionMotion } from './EditionMotion'
import { EditionLinks } from './EditionLinks'
import { StoryList } from './StoryList'
import { storyPath } from '@/lib/desks'
import { assign, recut } from '@/lib/edition'
import { Drill, Rooms, Ticker } from './Markets'
import { Ask, FullFeed, Listen } from './Reading'
import { Lead, Note, Picture, Source, Visual } from './Story'
import './edition.css'
import './discovery.css'

function dayLabel(date: string, short = false) {
  return new Date(date)
    .toLocaleDateString('en-GB', {
      weekday: short ? 'short' : 'long',
      day: 'numeric',
      month: short ? 'short' : 'long',
      timeZone: 'UTC',
    })
    .replace(',', '')
}

function Pieces({ pieces, reserved }: { pieces: Piece[]; reserved: Set<string> }) {
  const used = new Set(reserved)
  return (
    <section className="strip" aria-labelledby="stripH">
      <div className="strip-h">
        <h2 className="sc" id="stripH">
          This week's pieces
        </h2>
        <span className="sc quiet">One story each, five whys down to the evidence</span>
      </div>
      <div className="strip-row">
        {pieces.slice(0, 3).map((p, i) => {
          const image = p.image && !used.has(p.image) ? p.image : undefined
          if (image) used.add(image)
          const tint =
            (
              { 'mind.the.gap': 'gap', 'follow.the.money': 'money', 'under.the.hood': 'hood' } as Record<
                string,
                string
              >
            )[p.series || ''] || ['gap', 'hood', 'money'][i]
          return (
            <article key={p.link} className={'sp s-' + tint + (image ? '' : ' text-piece')}>
              {image && (
                <a href={p.link} tabIndex={-1} aria-hidden="true">
                  <Picture src={image} />
                </a>
              )}
              <div>
                <span className="sc sp-s">
                  {p.series && (
                    <>
                      <b>{p.series}</b> ·{' '}
                    </>
                  )}
                  {dayLabel(p.date, true)}
                </span>
                <h3>
                  <a href={p.link}>{p.title}</a>
                </h3>
                <span className="sc sp-a">
                  {p.video && (
                    <>
                      <a href={p.video.url}>
                        Watch
                        {p.seconds
                          ? ' ' + Math.floor(p.seconds / 60) + ':' + String(p.seconds % 60).padStart(2, '0')
                          : ''}
                      </a>{' '}
                      ·{' '}
                    </>
                  )}
                  <a href={p.link}>Read the piece ↗</a>
                </span>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function SectorBar({
  snapshot,
  desk,
  select,
  evening,
  flip,
}: {
  snapshot: Snapshot
  desk: Desk
  select: (d: Desk) => void
  evening: boolean
  flip: () => void
}) {
  const seg = useRef<HTMLDivElement>(null),
    [more, setMore] = useState(true)
  function edge() {
    const el = seg.current
    if (el) setMore(el.scrollWidth - el.scrollLeft - el.clientWidth > 4)
  }
  useEffect(() => {
    const el = seg.current
    if (!el) return
    const ro = new ResizeObserver(edge)
    ro.observe(el)
    edge()
    return () => ro.disconnect()
  }, [])
  useEffect(() => {
    const el = seg.current,
      button = el?.querySelector<HTMLButtonElement>('[aria-pressed=true]')
    if (!el || !button) return
    const delta = button.getBoundingClientRect().left - el.getBoundingClientRect().left
    if (delta < 0 || delta + button.offsetWidth > el.clientWidth) el.scrollLeft += delta - 12
  }, [desk])
  return (
    <div className="wrap">
      <div className="edbar">
        <div className="dateline">
          <span className="day">{dayLabel(snapshot.edition_date)}</span>
          <button
            className="mood"
            onClick={flip}
            aria-pressed={evening}
            aria-label="Switch between the morning edition and evening wrap"
          >
            <span className="m-am">
              Morning<span className="lg"> edition</span>
            </span>
            <span className="m-sep"> / </span>
            <span className="m-pm">
              Evening<span className="lg"> wrap</span>
            </span>
          </button>
        </div>
        <div className="desk">
          <span className="desk-k" id="deskK">
            Sector
          </span>
          <div className={'seg-wrap' + (more ? ' more' : '')}>
            <div className="seg" ref={seg} onScroll={edge} role="group" aria-labelledby="deskK">
              {[{ key: 'all', label: 'All of it' }, ...snapshot.subsectors].map((r) => (
                <button
                  key={r.key}
                  data-k={r.key}
                  aria-pressed={desk === r.key}
                  onClick={() => select(r.key as Desk)}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Edition({
  snapshot,
  isFixture,
  pieces,
  dated = false,
}: {
  snapshot: Snapshot
  isFixture: boolean
  pieces: Piece[]
  dated?: boolean
}) {
  const [desk, setDesk] = useState<Desk>('all'),
    [evening, setEvening] = useState(false),
    [feed, setFeed] = useState(false)
  const origin = useRef({ y: 0, end: false })
  useEffect(() => {
    try {
      const saved = localStorage.getItem('mymu-desk')
      if (!dated && keys.some((k) => k === saved)) setDesk(saved as Desk)
    } catch {}
    setEvening(new Date().getHours() >= 18)
  }, [dated])
  function select(d: Desk) {
    setDesk(d)
    try {
      localStorage.setItem('mymu-desk', d)
    } catch {}
  }
  function openFeed(end: boolean) {
    origin.current = { y: window.scrollY, end }
    setFeed(true)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }
  const closeFeed = useCallback(() => {
    setFeed(false)
    requestAnimationFrame(() => {
      document
        .querySelector<HTMLButtonElement>(origin.current.end ? '.done .ghost' : '.lead .alt')
        ?.focus({ preventScroll: true })
      window.scrollTo({ top: origin.current.y, behavior: 'instant' })
    })
  }, [])
  const cut = recut(snapshot, desk, isFixture),
    mode = evening ? 'Evening wrap' : 'Morning edition'
  const featured = new Set([cut.lead.item.id, ...cut.things.map(s => s.item.id)])
  const remaining = snapshot.items.filter(n => !featured.has(n.id))
  const treatments = assign(cut.things, [cut.lead.art?.url, cut.lead.portrait?.url])
  const used = new Set(
    [
      cut.lead.art?.url,
      cut.lead.portrait?.url,
      ...cut.things.map((s, i) =>
        treatments[i] === 'photo' ? s.art?.url : treatments[i] === 'portrait' ? s.portrait?.url : '',
      ),
    ].filter((u): u is string => !!u),
  )
  const flip = () => setEvening(!evening)
  return (
    <div className={'edition-page' + (evening ? ' evening' : '')}>
      <EditionMotion key={desk + String(feed)} light={dated || feed} />
      {feed ? (
        <FullFeed snapshot={snapshot} initial={desk} close={closeFeed} dated={!isFixture} />
      ) : (
        <>
          <a className="skip" href="#lead">
            Skip to the lead
          </a>
          <header className="head">
            <div className="wrap mast">
              <div className="nameplate">
                <a className="brand" href="/" aria-label="Make Your Mind Up, home">
                  <img src="/hub/wordmark.svg" width="228" height="22" alt="Make Your Mind Up" />
                </a>
                <p className="motto">Creativity, AI and money, simplified.</p>
              </div>
              <div className="mast-right">
                <button
                  className="mood-icon"
                  aria-label="Switch between the morning edition and evening wrap"
                  aria-pressed={evening}
                  onClick={flip}
                >
                  <svg viewBox="0 0 20 20" aria-hidden="true">
                    <path
                      d="M14.5 13.2A6.5 6.5 0 0 1 6.8 5.5a6.5 6.5 0 1 0 7.7 7.7z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                  </svg>
                </button>
                <Listen key={desk + mode} stories={[cut.lead, ...cut.things]} edition={mode} />
                <a className="sub-btn" href="#subscribe">
                  Subscribe
                </a>
              </div>
            </div>
            <Ticker snapshot={snapshot} desk={desk} />
          </header>
          <main>
            <SectorBar snapshot={snapshot} desk={desk} select={select} evening={evening} flip={flip} />
            <div id="edition">
              <div className="wrap">
                <Lead
                  dated={!isFixture}
                  story={cut.lead}
                  snapshot={snapshot}
                  whyIn={cut.scoped.length ? cut.whyIn : 'across the creative industries'}
                  edition={mode}
                  openFeed={() => openFeed(false)}
                />
                <Pieces pieces={pieces} reserved={used} />
                <section className="rooms" aria-labelledby="roomsH">
                  <div className="room-directory">
                    <div className="sec-head">
                      <h2 id="roomsH">
                        The six <em>rooms</em>
                      </h2>
                      <div className="sec-meta">
                        Tap a room to re-cut the edition
                        <br />
                        Moves are today's, closes delayed
                      </div>
                    </div>
                    <Rooms snapshot={snapshot} desk={desk} select={select} />
                  </div>
                  <div className="room-grid">
                    <Drill key={desk} snapshot={snapshot} cut={cut} />
                    <Ask
                      key={'ask-' + desk}
                      items={cut.scoped}
                      desk={desk}
                      label={cut.label}
                      fixture={isFixture}
                    />
                  </div>
                </section>
                <section aria-labelledby="threeH">
                  <div className="sec-head">
                    <h2 id="threeH">
                      Today, <em>in {['brief', 'one', 'two', 'three'][cut.things.length]}</em>
                    </h2>
                    <div className="sec-meta">
                      Focus: {cut.label}
                      <br />
                      About 3 minutes
                    </div>
                  </div>
                  {cut.things.map((s, i) => (
                    <article
                      key={s.item.id}
                      id={s.item.id}
                      className={'thing is-' + treatments[i] + (i % 2 ? ' flip' : '')}
                      data-treatment={treatments[i]}
                    >
                      <Visual story={s} treatment={treatments[i]} />
                      <div className="thing-text">
                        <div className="meta">
                          <span className={'no c' + (i + 1)}>{i + 1}</span>
                          <span className="sc">
                            {snapshot.subsectors.find((r) => r.key === s.item.subsector)?.label}
                            {s.sub && ' · ' + s.sub}
                          </span>
                        </div>
                        <h3><a href={isFixture ? s.item.url : storyPath(snapshot.edition_date, s.item.id)}>{s.item.headline}</a></h3>
                        <p className="dek">{s.item.dek}</p>
                        <Note label={'Why it matters ' + cut.whyIn} text={s.why} />
                        <Source n={s.item} snapshot={snapshot} />
                      </div>
                    </article>
                  ))}
                </section>
                <div className="done">
                  <div className="ring" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M4 12.5l5 5L20 6" />
                    </svg>
                  </div>
                  <div>
                    <h3>That's the edition. You're done.</h3>
                    <p>
                      {evening
                        ? "About three minutes. Tomorrow's edition lands at 07:00."
                        : 'About three minutes. The evening wrap lands at 18:00.'}
                    </p>
                  </div>
                  <button className="ghost" onClick={() => openFeed(true)}>
                    Everything today{' '}
                    <span>
                      {snapshot.items.length} stories, {new Set(snapshot.items.map((n) => n.source)).size}{' '}
                      sources
                    </span>{' '}
                    →
                  </button>
                </div>
              </div>
            </div>
            <div className="wrap">
              {dated && remaining.length > 0 && <section aria-labelledby="more-stories">
                <div className="sec-head"><h2 id="more-stories">More from this edition</h2></div>
                <StoryList anchors dated={!isFixture} stories={remaining.map(item => ({ date: snapshot.edition_date, item }))} />
              </section>}
              <section className="subs" id="subscribe">
                <div>
                  <h2>
                    Tomorrow's edition, <em>cut for your sector</em>, at seven.
                  </h2>
                  <p>Three things today in your sector, plus the week's three pieces. Free.</p>
                </div>
                <div>
                  <form className="form" method="get" action="https://home.makeyourmindup.ai/subscribe">
                    <label className="sr" htmlFor="email">
                      Email address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@work.com"
                      required
                    />
                    <button>Get the edition</button>
                  </form>
                  <div className="form-note">One email a morning. Unsubscribe in one tap.</div>
                </div>
              </section>
              <footer className="foot">
                <div>
                  <h4>Make Your Mind Up</h4>
                  <p className="series-line">
                    follow.the.money, Mon
                    <br />
                    under.the.hood, Wed
                    <br />
                    mind.the.gap, Fri
                  </p>
                </div>
                <div>
                  <h4>The stories</h4>
                  <EditionLinks date={isFixture ? undefined : snapshot.edition_date} />
                  <p>
                    The panel checks machine-written summaries of the linked sources, and some images are
                    illustrative.
                  </p>
                </div>
                <div>
                  <h4>The pieces</h4>
                  <p>Three a week. One story each, five whys down to the evidence.</p>
                </div>
                <div>
                  <h4>The Creative 24</h4>
                  <p>
                    24 listed creative companies, equal-weighted, rebased to 100 a month ago. Closing prices,
                    delayed.
                  </p>
                  <nav aria-label="Publication">
                    <a href="/members">Members</a> · <a href="/terms">Terms</a> ·{' '}
                    <a href="/privacy">Privacy</a>
                  </nav>
                </div>
              </footer>
            </div>
          </main>
        </>
      )}
    </div>
  )
}

import { useLayoutEffect, useRef, useState } from 'react'
import type { Desk, Index, Snapshot } from '@/lib/hub'
import type { recut } from '@/lib/edition'
import { Percent } from './Story'

import { price, Spark } from './MarketValues'

const last = (index: Index) => index.series.at(-1)?.toFixed(2) ?? 'n/a'

export function Ticker({ snapshot, desk }: { snapshot: Snapshot; desk: Desk }) {
  const [open, setOpen] = useState(false),
    { ticker, subsectors } = snapshot,
    idx = ticker.index
  const byDay = Object.entries(ticker.stocks)
    .filter(([, s]) => s.day_pct !== null)
    .sort((a, b) => Number(b[1].day_pct) - Number(a[1].day_pct))
  const movers =
    desk === 'all'
      ? [...new Map([...byDay.slice(0, 4), ...byDay.slice(-2).reverse()])]
      : byDay
          .filter(([, s]) => s.subsector === desk)
          .sort((a, b) => Math.abs(Number(b[1].day_pct)) - Math.abs(Number(a[1].day_pct)))
  const rooms = [...subsectors].sort((a, b) => Number(b.key === desk) - Number(a.key === desk))
  const strip = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const box = strip.current
    if (!box) return
    function fit() {
      if (!box) return
      const entries = Array.from(box.children) as HTMLElement[]
      entries.forEach((el) => {
        el.hidden = false
      })
      const edge = box.getBoundingClientRect().right
      const clipped = entries.map((el) => el.getBoundingClientRect().right > edge)
      entries.forEach((el, i) => {
        el.hidden = clipped[i]
      })
      box.dataset.fitted = 'true'
    }
    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(box)
    document.fonts.addEventListener('loadingdone', fit)
    return () => {
      observer.disconnect()
      document.fonts.removeEventListener('loadingdone', fit)
    }
  }, [desk, snapshot])
  return (
    <>
      <div className="ticker">
        <div className="wrap tick-row">
          <div className="idx">
            <span className="idx-name">{idx.name}</span>
            <span className="idx-val">{last(idx)}</span>
            <Spark data={idx.series} width={58} height={18} />
            <Percent value={idx.day_pct} />
          </div>
          <span className="tick-scope">{desk === 'all' ? 'Top movers' : rooms[0].label}</span>
          <div className="movers" ref={strip}>
            {movers.map(([k, s]) => (
              <span className="mv" key={k}>
                <b className="nm">{s.name}</b>
                <b className="sym">{k}</b>
                <span className="p">{price(s)}</span>
                <Percent value={s.day_pct} />
              </span>
            ))}
          </div>
          <span className="tick-label">
            {ticker.as_of?.replace(/,?( \d{4})? \(delayed\)/, ', delayed').replace('Close,', 'Close') ||
              'Close unavailable'}
          </span>
          <button
            className="all24"
            id="all24"
            aria-expanded={open}
            aria-controls="board"
            onClick={() => setOpen(!open)}
          >
            {open ? 'Close' : 'All 24'}
          </button>
        </div>
      </div>
      <div id="board" className={'board' + (open ? ' open' : '')}>
        <div className="wrap">
          <div className="board-grid">
            <div className="board-idx">
              <h3 className="sec-h">The Creative 24</h3>
              <div className="big">{last(idx)}</div>
              <Spark data={idx.series} width={220} height={54} />
              <p>
                <Percent value={idx.day_pct} /> today · <Percent value={idx.month_pct} /> this month
              </p>
              <p>Equal-weighted across the listed companies, rebased to 100 one month ago.</p>
            </div>
            {[0, 1, 2].map((col) => (
              <div key={col}>
                {rooms
                  .filter((_, i) => i % 3 === col)
                  .map((r) => (
                    <section key={r.key}>
                      <h4 className={'sec-h' + (r.key === desk ? ' on' : '')}>
                        {r.label}
                        <Percent value={r.index.day_pct} />
                      </h4>
                      {Object.entries(ticker.stocks)
                        .filter(([, s]) => s.subsector === r.key)
                        .map(([k, s]) => (
                          <div className="srow" key={k}>
                            <span>{k}</span>
                            <span className="nm">{s.name}</span>
                            <span className="pr">{price(s)}</span>
                            <Percent className="dp" value={s.day_pct} />
                          </div>
                        ))}
                    </section>
                  ))}
              </div>
            ))}
          </div>
          <div className="board-foot">
            {ticker.as_of || 'Close unavailable'}. Source: {ticker.source || 'Yahoo Finance'}. Not investment
            advice.
          </div>
        </div>
      </div>
    </>
  )
}

export function Rooms({
  snapshot,
  desk,
  select,
}: {
  snapshot: Snapshot
  desk: Desk
  select: (desk: Desk) => void
}) {
  return (
    <div className="room-list">
      {snapshot.subsectors.map((r) => (
        <button
          key={r.key}
          className="room"
          data-k={r.key}
          aria-pressed={desk === r.key}
          onClick={() => select(desk === r.key ? 'all' : r.key)}
        >
          <span className="rn">{r.label}</span>
          <span className="rl">{r.line}</span>
          <span className="rk">
            <Spark data={r.index.series} />
          </span>
          <Percent className="rp" value={r.index.day_pct} />
          <span className="rc">
            {r.story_count} {r.story_count === 1 ? 'story' : 'stories'}
          </span>
        </button>
      ))}
    </div>
  )
}

export function Drill({ snapshot, cut }: { snapshot: Snapshot; cut: ReturnType<typeof recut> }) {
  const [selected, select] = useState(''),
    { room, behind, scoped } = cut,
    idx = room?.index || snapshot.ticker.index
  const sorted = Object.entries(snapshot.ticker.stocks)
    .filter(([, s]) => !room || s.subsector === room.key)
    .sort((a, b) => (b[1].day_pct ?? -Infinity) - (a[1].day_pct ?? -Infinity))
  const companies = room ? sorted : [...new Map([...sorted.slice(0, 3), ...sorted.slice(-2)])]
  const paid = scoped.find((n) => /licen[cs]|royalt|payment|paid|revenue/i.test(n.dek))
  const detail = (key: 'paid' | 'real') => {
    const entry = behind?.[key],
      n = key === 'paid' ? paid : scoped[0]
    const refs = entry ? snapshot.items.filter((n) => entry[1].includes(n.id)) : n ? [n] : []
    return (
      <dd>
        {entry?.[0] || n?.dek || 'No source in this room gives that detail today.'}{' '}
        {refs.map((n) => (
          <a className="src" key={n.id} href={n.url} target="_blank" rel="noopener">
            {n.source} ↗{' '}
          </a>
        ))}
      </dd>
    )
  }
  return (
    <div className="drill">
      <div className="dr-h">
        <h3 className="sc">{room ? room.label + ', the board' : 'The Creative 24'}</h3>
        <span className="sc quiet">Equal-weighted, rebased to 100 a month ago</span>
      </div>
      <div className="dr-chart">
        <Spark data={idx.series} wide width={600} height={120} />
        <div className="dr-fig">
          <b>{last(idx)}</b>
          <span>
            <Percent value={idx.day_pct} /> today
          </span>
          <span>
            <Percent value={idx.month_pct} /> this month
          </span>
        </div>
      </div>
      <div className="dr-cols">
        <div>
          <h4 className="sc">{room ? 'Listed companies' : 'Biggest moves today'}</h4>
          <ul className="cos">
            {companies.map(([k, s]) => {
              const named = snapshot.items.filter((n) => n.tickers.includes(k))
              return (
                <li key={k}>
                  <button
                    data-t={k}
                    aria-expanded={selected === k}
                    onClick={() => select(selected === k ? '' : k)}
                  >
                    <span>{k}</span>
                    <span className="cn">{s.name}</span>
                    <span className="cpr">{price(s)}</span>
                    <Percent className="cd" value={s.day_pct} />
                  </button>
                  {selected === k && (
                    <div className="cocard">
                      <div className="cc-h">
                        <b>{s.name}</b>
                        <span className="sc">
                          {k} · {snapshot.subsectors.find((r) => r.key === s.subsector)?.label}
                        </span>
                      </div>
                      <div className="cc-p">
                        <span className="big">{price(s)}</span>
                        <span>
                          <Percent value={s.day_pct} /> today
                        </span>
                        <span>
                          <Percent value={s.month_pct} /> this month
                        </span>
                        <Spark data={s.spark} width={120} height={26} />
                      </div>
                      <p className="sc">Today's mentions</p>
                      {named.length ? (
                        <ul>
                          {named.map((n) => (
                            <li key={n.id}>
                              <a href={n.url}>{n.headline}</a> <span className="sc">{n.source}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="none">No mentions today.</p>
                      )}
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
        <div>
          <h4 className="sc">Behind the moves</h4>
          <dl className="behind">
            <dt className="sc">Who gets paid</dt>
            {detail('paid')}
            <dt className="sc">Real, or theatre?</dt>
            {detail('real')}
          </dl>
        </div>
      </div>
    </div>
  )
}

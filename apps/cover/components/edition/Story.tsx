import Image from 'next/image'
import { storyPath } from '@/lib/desks'
import type { HubImage, Item, Snapshot } from '@/lib/hub'
import type { Story, Treatment } from '@/lib/edition'

export function Picture({
  src,
  alt = '',
  large = false,
  priority = false,
}: {
  src: string
  alt?: string
  large?: boolean
  priority?: boolean
}) {
  // Stills and publication covers can arrive from the producer's own CDN.
  // Only local fixtures and Commons go through the image optimisation proxy.
  const remote = src.startsWith('https://')
  return (
    <Image
      src={src}
      alt={alt}
      width={large ? 1440 : 640}
      height={large ? 900 : 420}
      sizes={large ? '(max-width: 860px) 100vw, 60vw' : '(max-width: 860px) 90vw, 35vw'}
      priority={priority}
      unoptimized={remote && new URL(src).hostname !== 'upload.wikimedia.org'}
    />
  )
}

export function dateOf(date: string, today?: string) {
  if (date === today) return 'Today'
  const partial = date.length === 7
  return new Intl.DateTimeFormat('en-GB', {
    month: 'short',
    ...(partial ? { year: 'numeric' } : { day: 'numeric' }),
    timeZone: 'UTC',
  }).format(new Date(partial ? date + '-01' : date))
}
export function Percent({ value, className = '' }: { value: number | null; className?: string }) {
  return (
    <span className={className + ' ' + (value === null ? '' : value >= 0 ? 'up' : 'down')}>
      {value === null ? 'n/a' : (value >= 0 ? '+' : '−') + Math.abs(value).toFixed(2) + '%'}
    </span>
  )
}
export function Source({ n, snapshot }: { n: Item; snapshot: Snapshot }) {
  return (
    <p className="prov">
      {n.tickers
        .filter((k) => snapshot.ticker.stocks[k])
        .map((k) => (
          <span className="tk" key={k}>
            {k} <Percent value={snapshot.ticker.stocks[k].day_pct} />
          </span>
        ))}
      {n.tickers.some((k) => snapshot.ticker.stocks[k]) && <br />}
      <a href={n.url} target="_blank" rel="noopener">
        {n.source} ↗
      </a>{' '}
      · {dateOf(n.date, snapshot.edition_date)}
    </p>
  )
}
export function Note({ label, text, big }: { label: string; text: string; big?: boolean }) {
  return (
    <div className={'note' + (big ? ' big' : '')}>
      <span className="note-k">
        <svg className="dm" viewBox="12 17 88 86" aria-hidden="true">
          <path d="M50 17a38 38 0 0 0 0 76z" fill="currentColor" />
          <path d="M62 27a38 38 0 0 1 0 76z" fill="#7EF0C0" />
        </svg>
        <span>{label}</span>
      </span>
      <p>{text}</p>
    </div>
  )
}
export function Credit({ photo }: { photo: HubImage }) {
  if (!photo.credit) return null
  return (
    <p className="credit">
      {photo.file_page ? (
        <a href={photo.file_page} target="_blank" rel="noopener">
          {photo.credit}
        </a>
      ) : (
        photo.credit
      )}
    </p>
  )
}
export function Visual({ story: s, treatment: t }: { story: Story; treatment: Treatment }) {
  const n = s.item,
    m = s.material
  if (t === 'photo' && s.art)
    return (
      <div className="vis t-photo">
        <Picture src={s.art.url} />
        <Credit photo={s.art} />
      </div>
    )
  if (t === 'portrait' && s.portrait) {
    const p = s.portrait
    return (
      <div className="vis t-portrait">
        <div className="pp-img">
          <Picture src={p.url} alt={p.name} />
        </div>
        <div className="pp-txt">
          <span className="lbl">In this story</span>
          <div>
            <p className="pname">{p.name}</p>
            <p className="prole">{p.role}</p>
          </div>
          <Credit photo={p} />
        </div>
      </div>
    )
  }
  if (t === 'number' && m.number)
    return (
      <div className="vis t-number">
        <p className="fig">
          {m.number.fig}
          <span className="sup">{m.number.sup}</span>
        </p>
        <p className="unit">{m.number.unit}</p>
        {m.number.sub && (
          <p className="sub">
            <b>{m.number.sub}</b> {m.number.subLabel}
          </p>
        )}
      </div>
    )
  if (t === 'quote')
    return (
      <div className="vis t-quote">
        <q>{m.quote?.q || n.headline}</q>
        <div className="rule" />
        <p className="att">{m.quote?.att || 'From our summary of ' + n.source}</p>
      </div>
    )
  if (t === 'evidence') {
    const excerpt = m.evidence || n.dek,
      at = n.dek.indexOf(excerpt)
    return (
      <div className="vis t-evidence">
        <div className="doc">
          <div className="doc-h">
            <span>{n.source}</span>
            <span>{dateOf(n.date)}</span>
          </div>
          <p className="doc-t">{n.companies.join(', ')}</p>
          <p>
            {at >= 0 && n.dek.slice(0, at)}
            <mark>{excerpt}</mark>
            {at >= 0 && n.dek.slice(at + excerpt.length)}
          </p>
          <div className="lines">
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="vis t-type">
      <span className="src">
        {n.source} · {dateOf(n.date)}
      </span>
      <div className="big">{n.companies[0] || n.source}</div>
      <div className="who">{n.companies.slice(1).join(' & ')}</div>
    </div>
  )
}
export function Lead({
  story: s,
  snapshot,
  whyIn,
  edition,
  openFeed,
  dated = true,
}: {
  story: Story
  snapshot: Snapshot
  whyIn: string
  edition: string
  openFeed: () => void
  dated?: boolean
}) {
  const n = s.item,
    p = s.portrait,
    date = new Date(snapshot.edition_date)
      .toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' })
      .replace(',', '')
  const series = n.series || snapshot.pieces.find(piece => piece.link === n.url)?.series
  return (
    <article data-series={series} className="lead" id="lead">
      <div className="lead-head" id={n.id}>
        <div className="kicker">
          <span className="kdate">
            {date} · {edition} ·{' '}
          </span>
          The lead · {snapshot.subsectors.find((r) => r.key === n.subsector)?.label} ·{' '}
          {dateOf(n.date, snapshot.edition_date)}
        </div>
        <h1><a href={dated ? storyPath(snapshot.edition_date, n.id) : n.url}>{n.headline}</a><span className="headline-wipes" aria-hidden="true" /></h1>
      </div>
      <div className="lead-body">
        <p className="dek">{n.dek}</p>
        <Note big label={'Why it matters ' + whyIn} text={s.why} />
        <div className="lead-foot">
          <Source n={n} snapshot={snapshot} />
          <div className="lead-acts">
            <a className="start" href="#threeH">
              Start the edition, 3 min ↓
            </a>
            <button className="start alt" onClick={openFeed}>
              Everything today, {snapshot.items.length} →
            </button>
          </div>
        </div>
      </div>
      <div className="lead-media">
        {s.art ? (
          <figure className="lead-fig">
            <Picture src={s.art.url} large priority />
            <Credit photo={s.art} />
          </figure>
        ) : p ? (
          <figure className="lead-fig person-lead">
            <Picture src={p.url} alt={p.name} large priority />
            <figcaption>
              {p.name}
              <Credit photo={p} />
            </figcaption>
          </figure>
        ) : (
          <Visual story={s} treatment="evidence" />
        )}
        {s.art && p && (
          <div className="inset">
            <Picture src={p.url} alt={p.name} />
            <div>
              <p className="pname">{p.name}</p>
              <p className="prole">{p.role}</p>
              <Credit photo={p} />
            </div>
          </div>
        )}
      </div>
    </article>
  )
}

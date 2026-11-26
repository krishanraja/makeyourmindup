import { useEffect, useRef, useState } from 'react'
import type { Desk, Item, Snapshot } from '@/lib/hub'
import { answer, suggestions, type Story } from '@/lib/edition'
import { Credit, dateOf, Note, Picture, Source } from './Story'

export function Ask({
  items,
  desk,
  label,
  fixture,
}: {
  items: Item[]
  desk: Desk
  label: string
  fixture: boolean
}) {
  const prompts = suggestions(items, desk, fixture)
  const [question, setQuestion] = useState(prompts[0] || ''),
    [asked, submit] = useState(question)
  const lines = answer(items, desk, asked, fixture),
    sources = [...new Map(lines.map((l) => [l.item.id, l.item])).values()]
  function choose(v: string) {
    setQuestion(v)
    submit(v)
  }
  return (
    <div className="ask">
      <h3 className="sc">{desk === 'all' ? 'Ask the edition' : 'Ask the ' + label + ' room'}</h3>
      <p className="ask-sub">
        Answers come only from today's {desk === 'all' ? '' : label.toLowerCase() + ' '}stories, and every
        line cites one.
      </p>
      <form
        className="ask-form"
        onSubmit={(e) => {
          e.preventDefault()
          submit(question)
        }}
      >
        <label className="sr" htmlFor="askIn">
          Your question
        </label>
        <input
          id="askIn"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          autoComplete="off"
          required
        />
        <button>Ask</button>
      </form>
      <div className="ask-sugg">
        {prompts.map((q) => (
          <button key={q} onClick={() => choose(q)}>
            {q}
          </button>
        ))}
      </div>
      <div className="answer" aria-live="polite">
        <p className="ans">
          {lines.length
            ? lines.map((l, i) => {
                const k = sources.findIndex((n) => n.id === l.item.id) + 1
                return (
                  <span key={i}>
                    {l.text}
                    <sup>
                      <a href={'#cite-' + k} aria-label={'Source ' + k}>
                        {k}
                      </a>
                    </sup>{' '}
                  </span>
                )
              })
            : "Today's sources do not answer that question."}
        </p>
        {sources.length > 0 && (
          <ol className="cites">
            {sources.map((n, i) => (
              <li key={n.id} id={'cite-' + (i + 1)}>
                <a href={n.url} target="_blank" rel="noopener">
                  {n.source} ↗
                </a>{' '}
                {n.headline}
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  )
}

export function FullFeed({
  snapshot,
  initial,
  close,
}: {
  snapshot: Snapshot
  initial: Desk
  close: () => void
}) {
  const [desk, setDesk] = useState(initial),
    [listed, setListed] = useState(false),
    [expanded, expand] = useState<string[]>([])
  const back = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    back.current?.focus()
    const escape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', escape)
    return () => document.removeEventListener('keydown', escape)
  }, [close])
  const items = snapshot.items
    .filter((n) => (desk === 'all' || desk === n.subsector) && (!listed || n.tickers.length))
    .sort((a, b) => b.date.localeCompare(a.date))
  const shown = new Set<string>()
  return (
    <main className="feed open">
      <div className="feed-top">
        <div className="wrap">
          <div className="row">
            <h2>
              Everything today{' '}
              <small>
                {items.length} of {snapshot.items.length} stories,{' '}
                {new Set(snapshot.items.map((n) => n.source)).size} sources
              </small>
            </h2>
            <button className="close" onClick={close} ref={back}>
              <span className="cl-l">Back to the edition</span>
              <span className="cl-s">Back</span>
            </button>
          </div>
          <div className="chips">
            {[{ key: 'all', label: 'All', story_count: snapshot.items.length }, ...snapshot.subsectors].map(
              (r) => (
                <button
                  key={r.key}
                  className="chip"
                  aria-pressed={r.key === desk}
                  onClick={() => setDesk(r.key as Desk)}
                >
                  {r.label} <span className="c">{r.story_count}</span>
                </button>
              ),
            )}
            <button className="chip alt" aria-pressed={listed} onClick={() => setListed(!listed)}>
              Moves a listed stock
            </button>
          </div>
        </div>
      </div>
      <div className="wrap">
        <div className="flist">
          {items.map((n, i) => {
            const room = snapshot.subsectors.find((r) => r.key === n.subsector),
              open = expanded.includes(n.id)
            const art = n.image && n.image.kind !== 'person' && !shown.has(n.image.url) ? n.image : null
            if (art) shown.add(art.url)
            return (
              <div key={n.id}>
                {n.date !== items[i - 1]?.date && (
                  <div className="fday">
                    {n.date === snapshot.edition_date && 'Today, '}
                    {dateOf(n.date)}
                    {n.date.length > 7 && ' ' + n.date.slice(0, 4)}
                  </div>
                )}
                <article className={'fi' + (open ? ' open' : '')}>
                  {art ? (
                    <div className="th">
                      <Picture src={art.url} />
                      <Credit photo={art} />
                    </div>
                  ) : (
                    <div className="th type">
                      <span className="s">{room?.label}</span>
                      <span className="w">{n.source}</span>
                    </div>
                  )}
                  <div>
                    <span className="sector">{room?.label}</span>
                    <h3>
                      <button
                        aria-expanded={open}
                        onClick={() =>
                          expand(open ? expanded.filter((id) => id !== n.id) : [...expanded, n.id])
                        }
                      >
                        {n.headline}
                      </button>
                    </h3>
                    <p className="d">{n.dek}</p>
                    <Note label="Why it matters" text={n.why} />
                    <Source n={n} snapshot={snapshot} />
                  </div>
                </article>
              </div>
            )
          })}
          {!items.length && <p className="empty">No stories in this cut today.</p>}
        </div>
      </div>
    </main>
  )
}

export function Listen({ stories, edition }: { stories: Story[]; edition: string }) {
  const [state, setState] = useState<'closed' | 'playing' | 'paused' | 'unavailable'>('closed')
  const [progress, setProgress] = useState(0)
  const generation = useRef(0)
  useEffect(
    () => () => {
      generation.current++
      window.speechSynthesis?.cancel()
    },
    [],
  )
  function stop() {
    generation.current++
    window.speechSynthesis?.cancel()
    setState('closed')
  }
  function play() {
    if (state === 'playing') {
      window.speechSynthesis.pause()
      setState('paused')
      return
    }
    if (state === 'paused') {
      window.speechSynthesis.resume()
      setState('playing')
      return
    }
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) {
      setState('unavailable')
      return
    }
    const speech = window.speechSynthesis,
      token = ++generation.current
    const paragraphs = stories.flatMap((s) => [s.item.headline, s.item.dek, s.why])
    speech.cancel()
    setProgress(0)
    setState('playing')
    function read(i: number) {
      if (generation.current !== token) return
      setProgress(i / paragraphs.length)
      if (i === paragraphs.length) {
        setState('closed')
        return
      }
      const line = new SpeechSynthesisUtterance(paragraphs[i])
      line.lang = 'en-GB'
      line.onend = () => read(i + 1)
      line.onerror = () => {
        if (generation.current === token) setState('unavailable')
      }
      speech.speak(line)
    }
    read(0)
  }
  return (
    <>
      <button
        className="listen"
        onClick={play}
        aria-label={state === 'playing' ? 'Pause reading' : 'Listen to the edition'}
      >
        <span className="play" aria-hidden="true">
          {state === 'playing' ? (
            'Ⅱ'
          ) : (
            <svg viewBox="0 0 10 10">
              <path d="M1 0l9 5-9 5z" fill="currentColor" />
            </svg>
          )}
        </span>
        {state === 'playing' ? 'Pause' : 'Listen'} <span className="len">3 min</span>
      </button>
      {state !== 'closed' && (
        <div className="reading-controls" aria-live="polite">
          {state === 'unavailable' ? (
            <span>Audio is unavailable in this browser.</span>
          ) : (
            <>
              <span>{edition}</span>
              <progress value={progress} max="1" aria-label="Reading progress" />
            </>
          )}
          <button onClick={stop}>Close</button>
        </div>
      )}
    </>
  )
}

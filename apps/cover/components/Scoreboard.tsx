import { CONFIG, SITE } from '@/lib/content'
import { FlapCounter } from './FlapCounter'
import { InView, Reveal } from './Reveal'

export function Scoreboard() {
  const t = SITE.scoreboard
  const example = CONFIG.scoreboard.example
  const calls = example ? example.calls : CONFIG.scoreboard.calls
  const keys = ['held', 'broke', 'unclear', 'open'] as const
  const count = (s: (typeof keys)[number]) => (example ? example.counts[s] : calls.filter(c => c.status === s).length)
  // The stamp on a call reads in the same plain words as the counters.
  const word = (s: (typeof keys)[number]) => t.columns[keys.indexOf(s)]

  return (
    <section id="scoreboard" className="grain relative scroll-mt-16 bg-ink" aria-labelledby="scoreboard-title">
      <div className="page relative z-10 py-[clamp(1.25rem,5svh,7rem)] md:py-[clamp(1.5rem,6svh,7rem)]">
        <div className="grid grid-cols-1 gap-[clamp(1.25rem,4svh,3rem)] md:grid-cols-12 md:items-end">
          <Reveal className="min-w-0 md:col-span-6">
            <p className="mono-label flex items-center gap-3 text-mint [@media(max-width:767px)_and_(max-height:600px)]:hidden">
              <span className="h-px w-10 bg-mint" aria-hidden="true" />
              {t.eyebrow}
            </p>
            <h2 id="scoreboard-title" className="display mt-[clamp(0.5rem,1.6svh,1rem)] text-[clamp(1.9rem,min(7.5vw,8svh),6rem)] text-cream md:text-[clamp(1.9rem,min(5.4vw,8svh),6rem)]">
              {t.title}
            </h2>
            <p className="mt-[clamp(0.6rem,2svh,1.5rem)] max-w-xl text-[clamp(0.95rem,2.4svh,1.25rem)] leading-relaxed text-cream/85">{t.body}</p>
          </Reveal>

          <div className="relative min-w-0 md:col-span-6">
            <span className="sticker absolute -top-6 right-0 z-10 rotate-6 bg-butter">{t.sticker}</span>
            <InView className="board border-2 border-cream/20 bg-ink-deep p-[clamp(0.75rem,2.2svh,1.5rem)]">
              {example && <p className="mono-label mb-[clamp(0.6rem,1.8svh,1.25rem)] text-cream/60">{t.exampleLabel}</p>}
              <p className="sr-only">{example ? `${t.exampleLabel}. ` : ''}{t.columns.map((col, i) => `${col}: ${count(keys[i])}`).join(', ')}</p>
              <div className="grid grid-cols-2 gap-[clamp(0.6rem,2svh,1.5rem)] sm:grid-cols-4 md:grid-cols-2 lg:grid-cols-4" aria-hidden="true">
                {t.columns.map((col, i) => {
                  return (
                    <div key={col} className="flex flex-col items-center gap-[clamp(0.35rem,1.2svh,0.75rem)]">
                      <FlapCounter value={count(keys[i])} order={i} />
                      <span className={`mono-label text-center font-semibold ${i === 0 ? 'text-mint' : 'text-cream/80'}`}>{col}</span>
                    </div>
                  )
                })}
              </div>
              {calls.length === 0 ? (
                <p className="mono-label mt-[clamp(0.75rem,2svh,1.5rem)] border-t border-cream/15 pt-[clamp(0.5rem,1.4svh,1rem)] text-center text-cream/60">
                  <span className="mr-2 inline-block h-2 w-2 animate-blink rounded-full bg-mint align-middle" aria-hidden="true" />
                  {t.empty}
                </p>
              ) : (
                <ul className="mt-[clamp(0.75rem,2.4svh,1.5rem)] divide-y divide-cream/15 border-t border-cream/15">
                  {calls.map(c => (
                    <li key={c.statement} className="flex items-start justify-between gap-3 py-[clamp(0.6rem,1.6svh,1rem)]">
                      <span className="min-w-0">
                        <span className="block text-[clamp(0.9rem,2.2svh,1.05rem)] leading-snug text-cream">
                          {c.href ? <a href={c.href} target="_blank" rel="noopener" className="underline decoration-mint underline-offset-4">{c.statement}</a> : c.statement}
                        </span>
                        <span className="mono-label mt-1 block text-cream/55">
                          {t.due} {c.due} · {c.confidence}% sure
                        </span>
                      </span>
                      <span className={`stamp shrink-0 whitespace-nowrap text-[0.62rem] ${c.status === 'held' ? 'border-mint text-mint' : c.status === 'broke' ? 'border-cream text-cream' : 'border-cream/45 text-cream/60'}`}>
                        {word(c.status)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              {example && <p className="mt-[clamp(0.5rem,1.4svh,1rem)] text-[0.8rem] leading-snug text-cream/55">{t.exampleNote}</p>}
            </InView>
          </div>
        </div>
      </div>
    </section>
  )
}

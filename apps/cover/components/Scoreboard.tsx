import { CONFIG, SITE } from '@/lib/content'
import { InView, Reveal } from './Reveal'

function Flap({ value, delay }: { value: string; delay: number }) {
  return (
    <span
      className="flap relative flex h-24 w-16 items-center justify-center overflow-hidden rounded-sm bg-ink-soft"
      style={{ ['--d' as string]: `${delay}s` }}
    >
      <span className="display text-6xl text-cream">{value}</span>
      <span className="absolute inset-x-0 top-1/2 h-[2px] bg-ink" aria-hidden="true" />
    </span>
  )
}

export function Scoreboard() {
  const t = SITE.scoreboard
  const calls = CONFIG.scoreboard.calls
  const count = (s: string) => calls.filter(c => c.status === s).length
  const keys = ['held', 'broke', 'unclear', 'open']

  return (
    <section id="scoreboard" className="grain relative scroll-mt-16 bg-ink" aria-labelledby="scoreboard-title">
      <div className="page relative z-10 py-20 md:py-28">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-end">
          <Reveal className="min-w-0 lg:col-span-6">
            <p className="mono-label flex items-center gap-3 text-mint">
              <span className="h-px w-10 bg-mint" aria-hidden="true" />
              {t.eyebrow}
            </p>
            <h2 id="scoreboard-title" className="display mt-4 text-[clamp(3rem,7.5vw,6rem)] text-cream">
              {t.title}
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-cream/85 md:text-xl">{t.body}</p>
          </Reveal>

          <div className="relative min-w-0 lg:col-span-6">
            <span className="sticker absolute -top-6 right-0 z-10 rotate-6 bg-butter">{t.sticker}</span>
            <InView className="board border-2 border-cream/20 bg-ink-deep p-4 md:p-6">
              <p className="sr-only">{t.columns.map((col, i) => `${col}: ${count(keys[i])}`).join(', ')}</p>
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-4" aria-hidden="true">
                {t.columns.map((col, i) => {
                  const n = String(count(keys[i])).padStart(2, '0')
                  return (
                    <div key={col} className="flex flex-col items-center gap-3">
                      <span className="flex gap-1">
                        <Flap value={n[0]} delay={0.1 + i * 0.12} />
                        <Flap value={n[1]} delay={0.16 + i * 0.12} />
                      </span>
                      <span className={`mono-label font-semibold ${i === 0 ? 'text-mint' : 'text-cream/80'}`}>{col}</span>
                    </div>
                  )
                })}
              </div>
              {calls.length === 0 ? (
                <p className="mono-label mt-6 border-t border-cream/15 pt-4 text-center text-cream/60">
                  <span className="mr-2 inline-block h-2 w-2 animate-blink rounded-full bg-mint align-middle" aria-hidden="true" />
                  {t.empty}
                </p>
              ) : (
                <ul className="mt-6 divide-y divide-cream/15 border-t border-cream/15">
                  {calls.map(c => (
                    <li key={c.statement} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-cream">{c.href ? <a href={c.href} className="underline decoration-mint underline-offset-4">{c.statement}</a> : c.statement}</span>
                      <span className="mono-label shrink-0 text-cream/60">
                        {t.due} {c.due} · {t.confidence} {c.confidence}%
                      </span>
                      <span className={`stamp shrink-0 ${c.status === 'held' ? 'border-mint text-mint' : 'border-cream/70 text-cream/80'}`}>{c.status}</span>
                    </li>
                  ))}
                </ul>
              )}
            </InView>
          </div>
        </div>
      </div>
    </section>
  )
}

import { CONFIG, SITE } from '@/lib/content'
import { InView, Reveal } from './Reveal'

function Flap({ value, delay }: { value: string; delay: number }) {
  return (
    <span
      className="flap relative flex h-[clamp(3.25rem,9svh,6rem)] w-[clamp(2.25rem,6svh,4rem)] items-center justify-center overflow-hidden rounded-sm bg-ink-soft"
      style={{ ['--d' as string]: `${delay}s` }}
    >
      <span className="display text-[clamp(2.2rem,6svh,3.75rem)] text-cream">{value}</span>
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
              <p className="sr-only">{t.columns.map((col, i) => `${col}: ${count(keys[i])}`).join(', ')}</p>
              <div className="grid grid-cols-2 gap-[clamp(0.6rem,2svh,1.5rem)] sm:grid-cols-4 md:grid-cols-2 lg:grid-cols-4" aria-hidden="true">
                {t.columns.map((col, i) => {
                  const n = String(count(keys[i])).padStart(2, '0')
                  return (
                    <div key={col} className="flex flex-col items-center gap-[clamp(0.35rem,1.2svh,0.75rem)]">
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
                <p className="mono-label mt-[clamp(0.75rem,2svh,1.5rem)] border-t border-cream/15 pt-[clamp(0.5rem,1.4svh,1rem)] text-center text-cream/60">
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

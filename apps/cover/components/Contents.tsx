import { ACCENT, SITE } from '@/lib/content'
import { Reveal } from './Reveal'
import { SubchannelBlock } from './SubchannelBlock'

export function Contents() {
  const t = SITE.contents
  return (
    <>
      <section id="inside" className="on-light scroll-mt-16 bg-cream text-ink" aria-labelledby="contents-title">
        <div className="page py-20 md:py-28">
          <Reveal>
            <p className="mono-label flex items-center gap-3 text-ink/70">
              <span className="h-px w-10 bg-ink" aria-hidden="true" />
              {t.eyebrow}
            </p>
            <h2 id="contents-title" className="display mt-4 text-[clamp(3rem,8vw,6.5rem)]">
              {t.title}
            </h2>
          </Reveal>
          <ol className="mt-12 border-t-2 border-ink">
            {SITE.subchannels.map((s, i) => (
              <li key={s.slug} className="border-b-2 border-ink">
                <Reveal delay={i * 0.08} y={16}>
                  <a href={`#${s.slug}`} className="group flex items-baseline gap-3 py-5 transition-transform duration-200 hover:translate-x-2 md:gap-6">
                    <span className="mono-label w-12 shrink-0 text-ink/60">p.{s.page}</span>
                    <span className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-6">
                      <span className="flex items-baseline gap-3">
                        <span className={`inline-block h-4 w-4 shrink-0 translate-y-[-0.2em] border-2 border-ink md:h-5 md:w-5 ${ACCENT[s.slug].bg}`} aria-hidden="true" />
                        <span className="display text-[clamp(1.8rem,7.4vw,4rem)]">{s.label}</span>
                      </span>
                      <span className="dot-leader hidden sm:block" aria-hidden="true" />
                      <span className="mono-label shrink-0 pl-7 text-ink/70 sm:pl-0 sm:text-right">{s.day}</span>
                    </span>
                  </a>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>
      {SITE.subchannels.map((s, i) => (
        <SubchannelBlock key={s.slug} s={s} flip={i % 2 === 1} />
      ))}
    </>
  )
}

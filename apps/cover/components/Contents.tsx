import { ACCENT, SITE } from '@/lib/content'
import { Reveal } from './Reveal'
import { SubchannelBlock } from './SubchannelBlock'

export function Contents() {
  const t = SITE.contents
  return (
    <>
      <section id="inside" className="on-light scroll-mt-16 bg-cream text-ink" aria-labelledby="contents-title">
        <div className="page py-[clamp(1.25rem,5svh,7rem)] md:py-[clamp(1.5rem,6svh,7rem)]">
          <Reveal>
            <p className="mono-label flex items-center gap-3 text-ink/70 [@media(max-width:767px)_and_(max-height:600px)]:hidden">
              <span className="h-px w-10 bg-ink" aria-hidden="true" />
              {t.eyebrow}
            </p>
            <h2 id="contents-title" className="display mt-[clamp(0.5rem,1.6svh,1rem)] text-[clamp(2rem,min(8vw,9svh),6.5rem)]">
              {t.title}
            </h2>
          </Reveal>
          <ol className="mt-[clamp(1rem,3.5svh,3rem)] border-t-2 border-ink">
            {SITE.subchannels.map((s, i) => (
              <li key={s.slug} className="border-b-2 border-ink">
                <Reveal delay={i * 0.08} y={16}>
                  <a href={`#${s.slug}`} className="group flex items-baseline gap-3 py-[clamp(0.6rem,1.8svh,1.25rem)] transition-transform duration-200 hover:translate-x-2 md:gap-6">
                    <span className="mono-label hidden w-12 shrink-0 text-ink/60 sm:inline-block">p.{s.page}</span>
                    <span className="flex min-w-0 flex-1 flex-col gap-1 md:flex-row md:items-baseline md:gap-6">
                      <span className="flex items-baseline gap-3">
                        <span className={`inline-block h-4 w-4 shrink-0 translate-y-[-0.2em] border-2 border-ink md:h-5 md:w-5 ${ACCENT[s.slug].bg}`} aria-hidden="true" />
                        <span className="display min-w-0 text-[clamp(1.4rem,min(6vw,6svh),4rem)]">{s.label}</span>
                      </span>
                      <span className="dot-leader hidden md:block" aria-hidden="true" />
                      <span className="mono-label shrink-0 pl-7 text-ink/70 md:pl-0 md:text-right">{s.day}</span>
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

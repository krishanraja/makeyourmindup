import Image from 'next/image'
import { CONFIG, SITE } from '@/lib/content'
import { Reveal } from './Reveal'

export function StaffBox() {
  const t = SITE.staff
  return (
    <section id="staff" className="on-light scroll-mt-16 bg-cream text-ink" aria-labelledby="staff-title">
      <div className="page grid grid-cols-1 gap-12 py-20 md:py-28 lg:grid-cols-12 lg:items-center">
        <Reveal className="min-w-0 lg:col-span-5">
          <figure className="relative mx-auto w-full max-w-[420px] -rotate-2">
            <span className="absolute -top-4 left-1/2 z-10 h-8 w-28 -translate-x-1/2 rotate-2 bg-butter/80" aria-hidden="true" />
            <div className="brutal border-2 border-ink bg-cream p-3 pb-12">
              <Image src="/krish.jpg" alt={t.photoAlt} width={720} height={720} sizes="(min-width: 1024px) 400px, 90vw" className="h-auto w-full border-2 border-ink" />
              <figcaption className="dek mt-3 text-center text-xl">{t.rows[0].v}</figcaption>
            </div>
          </figure>
        </Reveal>

        <div className="min-w-0 lg:col-span-7">
          <Reveal>
            <p className="mono-label flex items-center gap-3 text-ink/70">
              <span className="h-px w-10 bg-ink" aria-hidden="true" />
              {t.eyebrow}
            </p>
            <h2 id="staff-title" className="display mt-4 text-[clamp(3rem,8vw,6.5rem)]">
              {t.title}
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <dl className="mt-8 border-t-2 border-ink">
              {t.rows.map(r => (
                <div key={r.k} className="flex flex-col gap-1 border-b-2 border-ink py-3 sm:flex-row sm:items-baseline sm:gap-4">
                  <dt className="mono-label w-40 shrink-0 text-ink/60">{r.k}</dt>
                  <dd className="heavy text-lg md:text-xl">{r.v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed">{t.bio}</p>
            <div className="mt-6 flex flex-wrap gap-4">
              <a href={CONFIG.links.krish} target="_blank" rel="noopener" className="mono-label inline-flex min-h-[44px] items-center border-2 border-ink px-4 font-semibold transition-colors hover:bg-ink hover:text-cream">
                {t.site} ↗
              </a>
              <a href={CONFIG.links.linkedin} target="_blank" rel="noopener" className="mono-label inline-flex min-h-[44px] items-center border-2 border-ink px-4 font-semibold transition-colors hover:bg-ink hover:text-cream">
                {t.linkedin} ↗
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

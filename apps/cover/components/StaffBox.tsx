import Image from 'next/image'
import { CONFIG, SITE } from '@/lib/content'
import { Reveal } from './Reveal'

export function StaffBox() {
  const t = SITE.staff
  const polaroid = (small: boolean) => (
    <figure className={`relative ${small ? 'w-[clamp(5.5rem,15svh,8rem)] shrink-0' : 'mx-auto w-full max-w-[min(420px,50svh)]'} -rotate-2`}>
      <span className={`absolute left-1/2 z-10 -translate-x-1/2 rotate-2 bg-butter/80 ${small ? '-top-2 h-4 w-14' : '-top-4 h-8 w-28'}`} aria-hidden="true" />
      <div className={`brutal border-2 border-ink bg-cream ${small ? 'p-1.5 pb-4' : 'p-3 pb-[clamp(1.5rem,5svh,3rem)]'}`}>
        <Image src="/krish-closer-look.jpg" alt={t.photoAlt} width={940} height={940} sizes={small ? '128px' : '(min-width: 1024px) 400px, 90vw'} className="h-auto w-full border-2 border-ink" />
        {!small && <figcaption className="dek mt-[clamp(0.25rem,1.2svh,0.75rem)] text-center text-[clamp(1rem,2.6svh,1.25rem)]">{t.rows[0].v}</figcaption>}
      </div>
    </figure>
  )

  // One screen, on any device: below desktop a small photo sits beside the
  // title and the rows run one line each; phones leave out the bio.
  return (
    <section id="staff" className="on-light scroll-mt-16 bg-cream text-ink" aria-labelledby="staff-title">
      <div className="page grid grid-cols-1 gap-[clamp(1rem,3.5svh,3rem)] py-[clamp(1.25rem,5svh,7rem)] md:py-[clamp(1.5rem,6svh,7rem)] lg:grid-cols-12 lg:items-center">
        <Reveal className="hidden min-w-0 lg:col-span-5 lg:block">{polaroid(false)}</Reveal>

        <div className="min-w-0 lg:col-span-7">
          <Reveal>
            <div className="flex items-center gap-[clamp(1rem,3svh,1.5rem)]">
              <div className="lg:hidden">{polaroid(true)}</div>
              <div className="min-w-0">
                <p className="mono-label flex items-center gap-3 text-ink/70 [@media(max-width:767px)_and_(max-height:600px)]:hidden">
                  <span className="h-px w-10 bg-ink" aria-hidden="true" />
                  {t.eyebrow}
                </p>
                <h2 id="staff-title" className="display mt-[clamp(0.5rem,1.6svh,1rem)] text-[clamp(2rem,min(8vw,9svh),6.5rem)]">
                  {t.title}
                </h2>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <dl className="mt-[clamp(0.75rem,3svh,2rem)] border-t-2 border-ink">
              {t.rows.map(r => (
                <div key={r.k} className="flex flex-row items-baseline gap-3 border-b-2 border-ink py-[clamp(0.3rem,1.1svh,0.75rem)] sm:gap-4">
                  <dt className="mono-label w-[5.5rem] shrink-0 text-ink/60 sm:w-40">{r.k}</dt>
                  <dd className="heavy text-[clamp(0.9rem,2.4svh,1.25rem)] leading-snug">{r.v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-[clamp(0.75rem,2.4svh,1.5rem)] hidden max-w-2xl text-[clamp(0.95rem,2.3svh,1.125rem)] leading-relaxed md:block">{t.bio}</p>
            <div className="mt-[clamp(0.75rem,2.4svh,1.5rem)] flex flex-wrap gap-3 sm:gap-4">
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

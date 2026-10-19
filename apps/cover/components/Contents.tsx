import { SITE } from '@/lib/content'
import { Reveal } from './Reveal'
import { SubchannelBlock } from './SubchannelBlock'

// The three formats in one section (Krish, 2026-10-13: three sections to
// describe the formats felt overlaboured). The panels are the contents.
export function Contents() {
  const t = SITE.contents
  return (
    <section id="inside" className="on-light scroll-mt-16 overflow-hidden bg-cream text-ink" aria-labelledby="contents-title">
      <div className="page py-[clamp(1rem,3.5svh,4rem)]">
        <Reveal className="flex flex-wrap items-end justify-between gap-x-8 gap-y-2">
          <div>
          <p className="mono-label flex items-center gap-3 text-ink/70 [@media(max-width:767px)_and_(max-height:600px)]:hidden">
            <span className="h-px w-10 bg-ink" aria-hidden="true" />
            {t.eyebrow}
          </p>
          <h2 id="contents-title" className="display mt-[clamp(0.4rem,1.2svh,0.75rem)] text-[clamp(1.8rem,min(7vw,7svh),4.5rem)]">
            {t.title}
          </h2>
          </div>
          <p className="mono-label hidden max-w-[22rem] pb-1 text-ink/70 lg:block">{t.caption}</p>
        </Reveal>
        {/* overflow-x alone makes overflow-y compute to auto, so anything
            hanging below the panels let the swipe row scroll vertically. */}
        <div
          data-bleed
          data-swipe
          className="-mx-4 mt-[clamp(0.75rem,2.6svh,2rem)] flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto overflow-y-hidden overscroll-x-contain px-4 pb-2 pr-6 sm:-mx-6 sm:scroll-px-6 sm:px-6 md:-mx-10 md:scroll-px-10 md:px-10 lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-x-6 lg:overflow-visible lg:p-0 xl:gap-x-8"
        >
          {SITE.subchannels.map((s, i) => (
            <SubchannelBlock key={s.slug} s={s} i={i} />
          ))}
        </div>
        <p className="mono-label mt-[clamp(0.6rem,2svh,1.25rem)] text-ink/70 lg:hidden [@media(max-width:767px)]:hidden">{t.caption}</p>
      </div>
    </section>
  )
}

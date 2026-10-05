import { CONFIG, SITE, subscribeUrl, type PlatformKey } from '@/lib/content'
import { PLATFORM_ICON } from './icons'
import { Reveal } from './Reveal'

export function Platforms() {
  const t = SITE.platforms
  const [substack, ...rest] = t.tiles
  const SubIcon = PLATFORM_ICON.substack

  return (
    <section id="platforms" className="on-light scroll-mt-16 bg-mint text-ink" aria-labelledby="platforms-title">
      <div className="page py-[clamp(1.25rem,5svh,7rem)] md:py-[clamp(1.5rem,6svh,7rem)]">
        <Reveal>
          <p className="mono-label flex items-center gap-3 text-ink/70 [@media(max-width:767px)_and_(max-height:600px)]:hidden">
            <span className="h-px w-10 bg-ink" aria-hidden="true" />
            {t.eyebrow}
          </p>
          <h2 id="platforms-title" className="display mt-[clamp(0.5rem,1.6svh,1rem)] text-[clamp(2rem,min(8vw,9svh),6.5rem)]">
            {t.title}
          </h2>
        </Reveal>

        <div className="mt-[clamp(1rem,3.5svh,3rem)] grid grid-cols-2 gap-[clamp(0.75rem,2.2svh,1.5rem)] md:grid-cols-4">
          {/* The hub gets the biggest tile. */}
          <Reveal className="col-span-2 min-w-0 md:col-span-4 lg:col-span-2 lg:row-span-2">
            <a
              href={CONFIG.substackUrl}
              target="_blank"
              rel="noopener"
              className="brutal group flex h-full flex-col border-2 border-ink bg-ink p-[clamp(0.9rem,2.6svh,2rem)] text-cream transition-transform hover:-translate-x-1 hover:-translate-y-1 lg:min-h-[min(320px,24svh)]"
            >
              <span className="flex items-center justify-between">
                <SubIcon className="h-[clamp(2rem,5svh,3rem)] w-[clamp(2rem,5svh,3rem)] text-mint" />
                <span className="mono-label flex items-center gap-2 border-2 border-mint px-2 py-1 font-semibold text-mint">
                  <span className="h-2 w-2 animate-blink rounded-full bg-mint" aria-hidden="true" />
                  {t.live}
                </span>
              </span>
              <span className="display mt-auto pt-[clamp(0.5rem,3svh,2.5rem)] text-[clamp(2rem,min(6vw,7svh),5rem)]">{substack.name}</span>
              <span className="mt-1.5 hidden max-w-md text-[clamp(0.9rem,2.3svh,1.125rem)] text-cream/85 md:block">{substack.blurb}</span>
              <span className="heavy mt-[clamp(0.6rem,2svh,1.5rem)] inline-flex min-h-[44px] w-fit items-center border-2 border-mint bg-mint px-5 uppercase text-ink transition-transform group-hover:translate-x-1 [@media(max-width:767px)_and_(max-height:600px)]:hidden">
                {substack.cta} <span className="ml-2" aria-hidden="true">↗</span>
              </span>
            </a>
          </Reveal>

          {rest.map((tile, i) => {
            const key = tile.key as PlatformKey
            const url = CONFIG.platforms[key]
            const Icon = PLATFORM_ICON[key]
            return (
              <Reveal key={tile.key} delay={0.06 * (i + 1)} className="min-w-0">
                <div className="brutal relative flex h-full flex-col border-2 border-ink bg-cream p-[clamp(0.75rem,2svh,1.25rem)]">
                  <span className="flex items-start justify-between">
                    <Icon className="h-[clamp(1.75rem,4.4svh,2.25rem)] w-[clamp(1.75rem,4.4svh,2.25rem)]" />
                    {url ? (
                      <span className="mono-label flex items-center gap-2 border-2 border-ink px-2 py-0.5 font-semibold">
                        <span className="h-2 w-2 animate-blink rounded-full bg-ink" aria-hidden="true" />
                        {t.live}
                      </span>
                    ) : (
                      <span className="stamp rotate-6 border-ink/70 text-[0.62rem] text-ink/80">{t.soon}</span>
                    )}
                  </span>
                  <span className="heavy mt-[clamp(0.4rem,2svh,1.5rem)] text-[clamp(1rem,min(5vw,3svh),1.5rem)]">{tile.name}</span>
                  <span className="mt-1 hidden text-[clamp(0.9rem,2.2svh,1rem)] text-ink/80 md:block">{tile.blurb}</span>
                  <a
                    href={url ?? subscribeUrl()}
                    target="_blank"
                    rel="noopener"
                    className="mono-label mt-auto hidden min-h-[44px] items-center pt-2 font-semibold underline decoration-2 underline-offset-4 hover:decoration-4 md:inline-flex"
                  >
                    {url ? `${tile.name} ↗` : `${t.soonCta} ↗`}
                  </a>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

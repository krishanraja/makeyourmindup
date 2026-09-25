import { CONFIG, SITE, subscribeUrl, type PlatformKey } from '@/lib/content'
import { PLATFORM_ICON } from './icons'
import { Reveal } from './Reveal'

export function Platforms() {
  const t = SITE.platforms
  const [substack, ...rest] = t.tiles
  const SubIcon = PLATFORM_ICON.substack

  return (
    <section id="platforms" className="on-light scroll-mt-16 bg-mint text-ink" aria-labelledby="platforms-title">
      <div className="page py-20 md:py-28">
        <Reveal>
          <p className="mono-label flex items-center gap-3 text-ink/70">
            <span className="h-px w-10 bg-ink" aria-hidden="true" />
            {t.eyebrow}
          </p>
          <h2 id="platforms-title" className="display mt-4 text-[clamp(3rem,8vw,6.5rem)]">
            {t.title}
          </h2>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* The hub gets the biggest tile. */}
          <Reveal className="min-w-0 md:col-span-2 lg:row-span-2">
            <a
              href={CONFIG.substackUrl}
              target="_blank"
              rel="noopener"
              className="brutal group flex h-full min-h-[320px] flex-col border-2 border-ink bg-ink p-6 text-cream transition-transform hover:-translate-x-1 hover:-translate-y-1 md:p-8"
            >
              <span className="flex items-center justify-between">
                <SubIcon className="h-12 w-12 text-mint" />
                <span className="mono-label flex items-center gap-2 border-2 border-mint px-2 py-1 font-semibold text-mint">
                  <span className="h-2 w-2 animate-blink rounded-full bg-mint" aria-hidden="true" />
                  {t.live}
                </span>
              </span>
              <span className="display mt-auto pt-10 text-[clamp(3rem,6vw,5rem)]">{substack.name}</span>
              <span className="mt-2 max-w-md text-lg text-cream/85">{substack.blurb}</span>
              <span className="heavy mt-6 inline-flex w-fit items-center border-2 border-mint bg-mint px-5 py-3 uppercase text-ink transition-transform group-hover:translate-x-1">
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
                <div className="brutal relative flex h-full min-h-[220px] flex-col border-2 border-ink bg-cream p-5">
                  <span className="flex items-start justify-between">
                    <Icon className="h-9 w-9" />
                    {url ? (
                      <span className="mono-label flex items-center gap-2 border-2 border-ink px-2 py-0.5 font-semibold">
                        <span className="h-2 w-2 animate-blink rounded-full bg-ink" aria-hidden="true" />
                        {t.live}
                      </span>
                    ) : (
                      <span className="stamp rotate-6 border-ink/70 text-[0.62rem] text-ink/80">{t.soon}</span>
                    )}
                  </span>
                  <span className="heavy mt-6 text-2xl">{tile.name}</span>
                  <span className="mt-1 text-ink/80">{tile.blurb}</span>
                  <a
                    href={url ?? subscribeUrl()}
                    target="_blank"
                    rel="noopener"
                    className="mono-label mt-auto inline-flex min-h-[44px] items-center pt-4 font-semibold underline decoration-2 underline-offset-4 hover:decoration-4"
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

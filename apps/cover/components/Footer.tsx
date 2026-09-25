import Image from 'next/image'
import { CONFIG, SITE, subscribeUrl } from '@/lib/content'
import { Magnetic } from './Magnetic'

export function Footer() {
  const t = SITE.footer
  return (
    <footer className="grain relative bg-ink-deep text-cream">
      <div className="page relative z-10 pb-10 pt-20 md:pt-28">
        <Image
          src="/brand/wordmark.png"
          alt="makeyourmindup"
          width={3319}
          height={391}
          sizes="(min-width: 1400px) 1320px, 94vw"
          className="h-auto w-full"
        />
        <div className="mt-12 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <p className="dek max-w-md text-xl text-cream/80">{t.line}</p>
          <Magnetic strength={0.4}>
            <a
              href={subscribeUrl()}
              target="_blank"
              rel="noopener"
              className="heavy brutal-mint inline-flex min-h-[56px] items-center border-2 border-mint bg-ink px-7 text-xl uppercase text-mint transition-colors hover:bg-mint hover:text-ink"
            >
              {t.subscribe} <span className="ml-2" aria-hidden="true">↗</span>
            </a>
          </Magnetic>
        </div>
        <div className="mono-label mt-14 flex flex-col gap-4 border-t border-cream/20 pt-6 text-cream/60 sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {new Date().getUTCFullYear()} {t.copyright}
          </span>
          <span className="flex flex-wrap gap-6">
            <a href={CONFIG.substackUrl} target="_blank" rel="noopener" className="inline-flex min-h-[44px] items-center hover:text-mint">
              Substack ↗
            </a>
            <a href="#top" className="inline-flex min-h-[44px] items-center hover:text-mint">
              {t.top} ↑
            </a>
          </span>
        </div>
      </div>
    </footer>
  )
}

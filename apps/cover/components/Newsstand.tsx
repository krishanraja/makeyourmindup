import { SITE, subscribeUrl } from '@/lib/content'
import type { Post } from '@/lib/rss'
import { Reveal } from './Reveal'

const fmt = (d: string) =>
  new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })

export function Newsstand({ posts }: { posts: Post[] }) {
  const t = SITE.newsstand
  return (
    <section id="latest" className="on-light scroll-mt-16 bg-cream text-ink" aria-labelledby="latest-title">
      <div className="page py-[clamp(1.25rem,5svh,7rem)] md:py-[clamp(1.5rem,6svh,7rem)]">
        <Reveal>
          <p className="mono-label flex items-center gap-3 text-ink/70 [@media(max-width:767px)_and_(max-height:600px)]:hidden">
            <span className="h-px w-10 bg-ink" aria-hidden="true" />
            {t.eyebrow}
          </p>
          <h2 id="latest-title" className="display mt-[clamp(0.5rem,1.6svh,1rem)] text-[clamp(2rem,min(8vw,9svh),6.5rem)]">
            {t.title}
          </h2>
        </Reveal>

        {posts.length === 0 ? (
          <Reveal delay={0.1}>
            <div className="brutal mt-[clamp(1rem,3.5svh,3rem)] grid grid-cols-1 gap-[clamp(1rem,3svh,2rem)] border-2 border-ink bg-butter p-[clamp(1rem,3svh,2.5rem)] md:grid-cols-12 md:items-center">
              <div className="min-w-0 md:col-span-8">
                <p className="display text-[clamp(1.7rem,min(5.5vw,6.5svh),4.4rem)]">{t.emptyTitle}</p>
                <p className="mt-[clamp(0.5rem,1.6svh,1rem)] max-w-xl text-[clamp(0.95rem,2.4svh,1.25rem)]">{t.emptyBody}</p>
              </div>
              <div className="md:col-span-4 md:text-right">
                <a
                  href={subscribeUrl()}
                  target="_blank"
                  rel="noopener"
                  className="heavy brutal inline-flex min-h-[52px] items-center border-2 border-ink bg-mint px-6 text-lg uppercase transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5"
                >
                  {t.cta}
                  <span className="ml-2" aria-hidden="true">
                    ↗
                  </span>
                </a>
              </div>
            </div>
          </Reveal>
        ) : (
          <ul className="mt-[clamp(1rem,3.5svh,3rem)] grid grid-cols-1 gap-[clamp(0.75rem,2.6svh,2rem)] md:grid-cols-3">
            {posts.map((p, i) => (
              <li key={p.link}>
                <Reveal delay={i * 0.08}>
                  <a href={p.link} target="_blank" rel="noopener" className="brutal group flex h-full flex-col border-2 border-ink bg-cream transition-transform hover:-translate-x-1 hover:-translate-y-1">
                    {p.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image} alt="" className="hidden aspect-[16/9] w-full border-b-2 border-ink object-cover md:block md:max-h-[22svh]" loading="lazy" />
                    )}
                    <span className="flex flex-1 flex-col p-[clamp(0.75rem,2svh,1.25rem)]">
                      <span className="mono-label text-ink/60">{fmt(p.date)}</span>
                      <span className="heavy mt-1 text-[clamp(1.1rem,2.8svh,1.5rem)] leading-tight">{p.title}</span>
                      {p.blurb && <span className="mt-2 hidden text-ink/80 md:line-clamp-3">{p.blurb}</span>}
                      <span className="mono-label mt-auto pt-[clamp(0.5rem,1.6svh,1rem)] font-semibold group-hover:underline">{t.read} ↗</span>
                    </span>
                  </a>
                </Reveal>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

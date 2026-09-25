import { SITE, subscribeUrl } from '@/lib/content'
import type { Post } from '@/lib/rss'
import { Reveal } from './Reveal'

const fmt = (d: string) =>
  new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })

export function Newsstand({ posts }: { posts: Post[] }) {
  const t = SITE.newsstand
  return (
    <section id="latest" className="on-light scroll-mt-16 bg-cream text-ink" aria-labelledby="latest-title">
      <div className="page py-20 md:py-28">
        <Reveal>
          <p className="mono-label flex items-center gap-3 text-ink/70">
            <span className="h-px w-10 bg-ink" aria-hidden="true" />
            {t.eyebrow}
          </p>
          <h2 id="latest-title" className="display mt-4 text-[clamp(3rem,8vw,6.5rem)]">
            {t.title}
          </h2>
        </Reveal>

        {posts.length === 0 ? (
          <Reveal delay={0.1}>
            <div className="brutal mt-12 grid grid-cols-1 gap-8 border-2 border-ink bg-butter p-6 md:grid-cols-12 md:items-center md:p-10">
              <div className="min-w-0 md:col-span-8">
                <p className="display text-[clamp(2.4rem,5.5vw,4.4rem)]">{t.emptyTitle}</p>
                <p className="mt-4 max-w-xl text-lg md:text-xl">{t.emptyBody}</p>
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
          <ul className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            {posts.map((p, i) => (
              <li key={p.link}>
                <Reveal delay={i * 0.08}>
                  <a href={p.link} target="_blank" rel="noopener" className="brutal group flex h-full flex-col border-2 border-ink bg-cream transition-transform hover:-translate-x-1 hover:-translate-y-1">
                    {p.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image} alt="" className="aspect-[16/9] w-full border-b-2 border-ink object-cover" loading="lazy" />
                    )}
                    <span className="flex flex-1 flex-col p-5">
                      <span className="mono-label text-ink/60">{fmt(p.date)}</span>
                      <span className="heavy mt-2 text-2xl leading-tight">{p.title}</span>
                      {p.blurb && <span className="mt-2 line-clamp-3 text-ink/80">{p.blurb}</span>}
                      <span className="mono-label mt-auto pt-4 font-semibold group-hover:underline">{t.read} ↗</span>
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

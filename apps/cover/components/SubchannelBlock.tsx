import { ACCENT, type Subchannel } from '@/lib/content'
import { MoneyMap, Receipt } from './diagrams/MoneyMap'
import { RealOrTheatre } from './diagrams/RealOrTheatre'
import { Threads } from './diagrams/Threads'
import { Reveal } from './Reveal'

function Diagram({ s }: { s: Subchannel }) {
  const d = s.diagram as Record<string, unknown>
  if (s.slug === 'mind_the_gap') {
    return <Threads labels={d.threads as string[]} axis={d.axis as string[]} meet={d.meet as string} call={d.call as string} />
  }
  if (s.slug === 'follow_the_money') {
    return <MoneyMap labels={d as never} />
  }
  return (
    <RealOrTheatre
      centre={d.centre as string}
      parts={d.parts as { name: string; mark: string }[]}
      real={d.real as string}
      theatre={d.theatre as string}
    />
  )
}

export function SubchannelBlock({ s, flip }: { s: Subchannel; flip: boolean }) {
  const a = ACCENT[s.slug]
  const d = s.diagram as Record<string, unknown>
  const isMoney = s.slug === 'follow_the_money'

  return (
    <section id={s.slug} className={`on-light relative scroll-mt-16 overflow-hidden text-ink ${a.bg}`} aria-labelledby={`${s.slug}-title`}>
      <div className="halftone pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="page relative grid gap-12 py-20 md:py-28 lg:grid-cols-12 lg:items-center lg:gap-10">
        <div className={`lg:col-span-6 ${flip ? 'lg:order-2' : ''}`}>
          <Reveal>
            <div className="flex flex-wrap items-center gap-3">
              <span className="mono-label text-ink/80">p.{s.page}</span>
              <span className={`mono-label bg-ink px-2 py-1 font-semibold ${a.text}`}>{s.label}</span>
              <span className="mono-label font-semibold">{s.day}</span>
              <span className="sticker -rotate-3 bg-cream text-[0.68rem]">{s.tag}</span>
            </div>
            <h2 id={`${s.slug}-title`} className="display mt-6 text-[clamp(2.8rem,6.6vw,5.6rem)]">
              {s.coverLine}
            </h2>
            <p className="dek mt-5 text-[1.5rem] leading-snug md:text-[1.8rem]">{s.oneLiner}</p>
            <p className="mt-5 max-w-xl text-lg leading-relaxed md:text-xl">{s.body}</p>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="brutal mt-8 max-w-xl border-2 border-ink bg-cream p-5">
              <p className="mono-label text-ink/70">{s.questionLabel}</p>
              <p className="heavy mt-2 text-xl leading-snug md:text-2xl">{s.question}</p>
            </div>
          </Reveal>
        </div>

        <div className={`lg:col-span-6 ${flip ? 'lg:order-1' : ''}`}>
          <Reveal delay={0.1}>
            <figure className="relative">
              <div className="brutal border-2 border-ink bg-ink p-2 sm:p-4 md:p-6">
                <Diagram s={s} />
              </div>
              {isMoney ? (
                <div className="relative z-10 -mt-8 flex items-start justify-between gap-4 md:-mt-12">
                  <figcaption className="mono-label mt-12 max-w-[14rem] text-ink/85 md:mt-16">{s.caption}</figcaption>
                  <Receipt
                    title={d.receiptTitle as string}
                    lines={d.receiptLines as string[]}
                    total={d.receiptTotal as string}
                  />
                </div>
              ) : (
                <figcaption className="mono-label mt-4 text-ink/85">{s.caption}</figcaption>
              )}
            </figure>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

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

/*
  Every spread has the same slots in the same order, so the three line up row
  for row when they sit side by side:
    head:   meta row (one line), tag, headline (three set lines), dek (two lines)
    fig:    diagram card (one aspect ratio for all three) and caption
    detail: question (fixed height), body, then the receipt on the money spread
  Below lg the slots stack head, fig, detail. From lg the figure takes the
  other column and its top lines up with the meta row.
*/
export function SubchannelBlock({ s, flip }: { s: Subchannel; flip: boolean }) {
  const a = ACCENT[s.slug]
  const d = s.diagram as Record<string, unknown>
  const isMoney = s.slug === 'follow_the_money'
  const receipt = isMoney ? (
    <Receipt title={d.receiptTitle as string} lines={d.receiptLines as string[]} total={d.receiptTotal as string} />
  ) : null

  const areas = flip
    ? "lg:[grid-template-areas:'fig_head'_'fig_detail']"
    : "lg:[grid-template-areas:'head_fig'_'detail_fig']"

  return (
    <section
      id={s.slug}
      data-spread
      className={`on-light relative scroll-mt-16 overflow-hidden text-ink ${a.bg}`}
      aria-labelledby={`${s.slug}-title`}
    >
      <div className="halftone pointer-events-none absolute inset-0" aria-hidden="true" />
      <div
        className={`page relative grid grid-cols-1 items-start gap-y-10 py-20 [grid-template-areas:'head'_'fig'_'detail'] md:py-28 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-x-12 lg:gap-y-8 ${areas}`}
      >
        <div className="min-w-0 [grid-area:head]">
          <Reveal>
            <div data-slot="meta" className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className={`mono-label bg-ink px-2 py-1 font-semibold ${a.text}`}>{s.label}</span>
              <span className="mono-label font-semibold">{s.day}</span>
              <span className="mono-label ml-auto hidden text-ink/80 sm:inline">p.{s.page}</span>
            </div>
            <div data-slot="tag" className="mt-5">
              <span className="sticker -rotate-3 bg-cream text-[0.68rem]">{s.tag}</span>
            </div>
            <h2
              id={`${s.slug}-title`}
              data-slot="headline"
              className="display mt-6 text-[clamp(2.6rem,13vw,5.6rem)] lg:text-[clamp(3rem,6.4vw,5.6rem)]"
            >
              {(s.headline as string[]).map(line => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h2>
            <p data-slot="dek" className="dek mt-5 min-h-[2.75em] text-[1.5rem] leading-snug sm:min-h-0 md:text-[1.8rem]">
              {s.oneLiner}
            </p>
          </Reveal>
        </div>

        <div className="min-w-0 [grid-area:fig]">
          <Reveal delay={0.1}>
            <figure className="relative">
              <div data-slot="card" className="brutal border-2 border-ink bg-ink p-2 sm:p-4 md:p-6">
                <Diagram s={s} />
              </div>
              {isMoney ? (
                <div className="relative z-10 flex items-start justify-between gap-4 lg:-mt-12">
                  <figcaption data-slot="caption" className="mono-label mt-4 min-h-[3em] text-ink/85 sm:min-h-0 lg:mt-16 lg:max-w-[14rem]">
                    {s.caption}
                  </figcaption>
                  <div className="hidden lg:block">{receipt}</div>
                </div>
              ) : (
                <figcaption data-slot="caption" className="mono-label mt-4 min-h-[3em] text-ink/85 sm:min-h-0">
                  {s.caption}
                </figcaption>
              )}
            </figure>
          </Reveal>
        </div>

        <div className="min-w-0 [grid-area:detail]">
          <Reveal delay={0.15}>
            <div data-slot="question" className="brutal max-w-xl border-2 border-ink bg-cream p-5 lg:max-w-none">
              <p className="mono-label text-ink/70">{s.questionLabel}</p>
              <p className="heavy mt-2 min-h-[5.5em] text-xl leading-snug sm:min-h-[4.125em] md:text-2xl lg:min-h-0">{s.question}</p>
            </div>
            <p data-slot="body" className="mt-8 max-w-xl text-lg leading-relaxed md:text-xl">
              {s.body}
            </p>
            {receipt && <div className="mt-10 flex justify-end lg:hidden">{receipt}</div>}
          </Reveal>
        </div>
      </div>
    </section>
  )
}

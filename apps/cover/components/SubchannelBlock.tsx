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
  On phones the slots stack head, fig, detail. From tablet up the figure takes
  the other column and its top lines up with the meta row.

  Every spread fits on one screen. Vertical sizes follow the screen's height
  (svh) as well as its width, the diagram is capped by height and sits on the
  outer margin, and phones leave out the caption, the body and the receipt:
  the headline, the diagram and the question carry the idea.
*/
export function SubchannelBlock({ s, flip }: { s: Subchannel; flip: boolean }) {
  const a = ACCENT[s.slug]
  const d = s.diagram as Record<string, unknown>
  const isMoney = s.slug === 'follow_the_money'
  const receipt = isMoney ? (
    <Receipt title={d.receiptTitle as string} lines={d.receiptLines as string[]} total={d.receiptTotal as string} />
  ) : null

  const areas = flip
    ? "md:[grid-template-areas:'fig_head'_'fig_detail']"
    : "md:[grid-template-areas:'head_fig'_'detail_fig']"

  return (
    <section
      id={s.slug}
      data-spread
      className={`on-light relative scroll-mt-16 overflow-hidden text-ink ${a.bg}`}
      aria-labelledby={`${s.slug}-title`}
    >
      <div className="halftone pointer-events-none absolute inset-0" aria-hidden="true" />
      <div
        className={`page relative grid grid-cols-1 items-start gap-y-[clamp(0.75rem,2.2svh,2.5rem)] py-[clamp(1rem,3.6svh,7rem)] md:py-[clamp(1.25rem,5svh,7rem)] [grid-template-areas:'head'_'fig'_'detail'] md:grid-cols-2 md:grid-rows-[auto_1fr] md:gap-x-8 md:gap-y-[clamp(0.9rem,2.6svh,2rem)] lg:gap-x-12 ${areas}`}
      >
        <div className="min-w-0 [grid-area:head]">
          <Reveal>
            <div data-slot="meta" className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className={`mono-label bg-ink px-2 py-1 font-semibold ${a.text}`}>{s.label}</span>
              <span className="mono-label font-semibold">{s.day}</span>
              <span className="mono-label ml-auto hidden text-ink/80 sm:inline">p.{s.page}</span>
            </div>
            <div data-slot="tag" className="mt-[clamp(0.4rem,1.6svh,1.25rem)] hidden md:block">
              <span className="sticker -rotate-3 bg-cream text-[0.68rem]">{s.tag}</span>
            </div>
            <h2
              id={`${s.slug}-title`}
              data-slot="headline"
              className="display mt-[clamp(0.4rem,1.8svh,1.5rem)] text-[clamp(1.8rem,min(12vw,6svh),5.6rem)] md:text-[clamp(1.9rem,min(5.2vw,8svh),5.6rem)] lg:text-[clamp(2rem,min(6.4vw,8.5svh),5.6rem)]"
            >
              {(s.headline as string[]).map(line => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h2>
            <p data-slot="dek" className="dek mt-[clamp(0.4rem,1.4svh,1.25rem)] min-h-[2.75em] [@media(max-width:767px)_and_(max-height:600px)]:hidden text-[clamp(1rem,2.8svh,1.8rem)] leading-snug sm:min-h-0">
              {s.oneLiner}
            </p>
          </Reveal>
        </div>

        <div className="min-w-0 [grid-area:fig]">
          <Reveal delay={0.1}>
            <figure
              className={`relative flex w-full items-start gap-3 md:block md:max-w-[calc((100svh-12rem)*1.2)] ${isMoney ? 'lg:max-w-[calc((100svh-21rem)*1.2)]' : ''} ${flip ? '' : 'md:ml-auto'}`}
            >
              <div data-slot="card" className="brutal w-[min(32svh,62%)] shrink-0 border-2 border-ink bg-ink p-2 sm:p-4 md:w-auto md:p-[clamp(0.5rem,2svh,1.5rem)]">
                <Diagram s={s} />
              </div>
              <div className="mt-3 min-w-0 flex-1 md:hidden">
                <span className="sticker -rotate-3 bg-cream text-[0.62rem]">{s.tag}</span>
              </div>
              {isMoney ? (
                <div className="relative z-10 hidden gap-4 md:flex md:flex-col lg:-mt-12 lg:flex-row lg:items-start lg:justify-between">
                  <figcaption data-slot="caption" className="mono-label mt-4 text-ink/85 lg:mt-16 lg:max-w-[14rem]">
                    {s.caption}
                  </figcaption>
                  <div className="self-end lg:self-auto">{receipt}</div>
                </div>
              ) : (
                <figcaption data-slot="caption" className="mono-label mt-4 hidden text-ink/85 md:block">
                  {s.caption}
                </figcaption>
              )}
            </figure>
          </Reveal>
        </div>

        <div className="min-w-0 [grid-area:detail]">
          <Reveal delay={0.15}>
            <div data-slot="question" className="brutal max-w-xl border-2 border-ink bg-cream p-[clamp(0.75rem,2svh,1.25rem)] md:max-w-none">
              <p className="mono-label text-ink/70">{s.questionLabel}</p>
              <p className="heavy mt-1.5 min-h-[5.5em] text-[clamp(0.95rem,2.4svh,1.5rem)] leading-snug sm:min-h-[4.125em] md:min-h-0">{s.question}</p>
            </div>
            <p data-slot="body" className="mt-[clamp(0.75rem,2.4svh,2rem)] hidden max-w-xl text-[clamp(0.95rem,2.3svh,1.25rem)] leading-relaxed md:block">
              {s.body}
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

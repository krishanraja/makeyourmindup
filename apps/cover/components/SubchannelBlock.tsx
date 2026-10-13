import { ACCENT, type Subchannel } from '@/lib/content'
import { MoneyMap } from './diagrams/MoneyMap'
import { RealOrTheatre } from './diagrams/RealOrTheatre'
import { Threads } from './diagrams/Threads'
import { InView } from './Reveal'

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
  One format, one colour panel. The three panels sit side by side in one
  section and share its six rows through subgrid, so meta, tag, headline,
  diagram, question and body line up row for row across all three whatever
  each one's copy runs to. Below laptop width the panels sit in a swipe row
  instead, one panel to a screen, with the next one peeking in.

  Vertical sizes follow the screen's height (svh) as well as its width so the
  whole section fits on one screen. The body only shows where there is room
  for it: the headline, the diagram and the question carry the idea.
*/
export function SubchannelBlock({ s, i }: { s: Subchannel; i: number }) {
  const a = ACCENT[s.slug]
  return (
    <InView
      as="article"
      id={s.slug}
      data-spread
      aria-labelledby={`${s.slug}-title`}
      className={`reveal brutal-sm relative flex w-[86%] shrink-0 snap-start scroll-mt-16 flex-col overflow-hidden border-2 border-ink p-[clamp(0.75rem,2svh,1.25rem)] text-ink md:w-[62%] lg:row-span-6 lg:grid lg:w-auto lg:grid-cols-[minmax(0,1fr)] lg:grid-rows-subgrid lg:gap-y-0 ${a.bg}`}
      style={{ ['--d' as string]: `${i * 0.08}s` }}
    >
      <div className="halftone pointer-events-none absolute inset-0" aria-hidden="true" />

      <div data-slot="meta" className="relative flex items-center gap-x-3 whitespace-nowrap">
        <span className={`mono-label bg-ink px-2 py-1 font-semibold ${a.text}`}>{s.label}</span>
        <span className="mono-label font-semibold">{s.day}</span>
        <span className="mono-label ml-auto hidden text-ink/80 sm:inline lg:hidden xl:inline">p.{s.page}</span>
      </div>

      <div data-slot="tag" className="relative mt-[clamp(0.5rem,1.6svh,1rem)] hidden lg:block">
        <span className="sticker -rotate-3 bg-cream px-3 py-1.5 text-[0.62rem]">{s.tag}</span>
      </div>

      <h3
        id={`${s.slug}-title`}
        data-slot="headline"
        className="display relative mt-[clamp(0.5rem,1.6svh,1rem)] text-[clamp(1.5rem,min(8vw,4.4svh),2.4rem)] lg:text-[clamp(1.3rem,min(2.6vw,3.9svh),2.9rem)]"
      >
        {(s.headline as string[]).map(line => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </h3>

      <figure className="relative mt-[clamp(0.6rem,2svh,1.25rem)] flex items-start gap-3 lg:block">
        <div
          data-slot="card"
          className="brutal w-[min(64%,calc(26svh*1.23))] shrink-0 border-2 border-ink bg-ink p-[clamp(0.35rem,1.2svh,0.75rem)] lg:w-full lg:max-w-[calc(23svh*1.23)]"
        >
          <Diagram s={s} />
        </div>
        <span className="sticker mt-2 -rotate-3 bg-cream px-3 py-1.5 text-[0.6rem] lg:hidden">{s.tag}</span>
      </figure>

      <div data-slot="question" className="brutal-sm relative mt-[clamp(0.75rem,2.4svh,1.5rem)] border-2 border-ink bg-cream p-[clamp(0.6rem,1.6svh,1rem)]">
        <p className="mono-label text-[0.65rem] text-ink/70">{s.questionLabel}</p>
        <p className="heavy mt-1 text-[clamp(0.9rem,2.1svh,1.15rem)] leading-snug">{s.question}</p>
      </div>

      <p
        data-slot="body"
        className="relative mt-[clamp(0.6rem,1.8svh,1.25rem)] hidden text-[clamp(0.9rem,1.9svh,1.05rem)] leading-relaxed [@media(min-width:1024px)_and_(min-height:1000px)]:block"
      >
        {s.body}
      </p>
    </InView>
  )
}

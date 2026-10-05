import { SITE } from '@/lib/content'

const COLOUR: Record<string, string> = {
  'mind.the.gap': 'text-coral',
  'follow.the.money': 'text-butter',
  'under.the.hood': 'text-lilac',
}

function Star() {
  return (
    <svg viewBox="0 0 24 24" className="mx-6 h-6 w-6 shrink-0 text-mint md:mx-8 md:h-8 md:w-8" aria-hidden="true" fill="currentColor">
      <path d="M12 0l2.6 9.4L24 12l-9.4 2.6L12 24l-2.6-9.4L0 12l9.4-2.6z" />
    </svg>
  )
}

export function Marquee() {
  const items = SITE.marquee
  const row = (hidden: boolean) => (
    <div className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {items.map(item => {
        const key = Object.keys(COLOUR).find(k => item.startsWith(k))
        return (
          <span key={item} className="flex items-center">
            <span className={`display whitespace-nowrap text-[2rem] md:text-[3rem] ${key ? COLOUR[key] : 'text-cream'}`}>{item}</span>
            <Star />
          </span>
        )
      })}
    </div>
  )
  return (
    <div className="overflow-hidden border-y-2 border-mint/40 bg-ink-deep py-4 md:py-5">
      <div data-bleed className="flex w-max animate-marquee motion-reduce:animate-none">
        {row(false)}
        {row(true)}
      </div>
    </div>
  )
}

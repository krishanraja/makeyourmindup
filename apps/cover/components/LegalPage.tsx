import Link from 'next/link'
import { SITE } from '@/lib/content'
import { fill } from '@/lib/legal'
import { Footer } from './Footer'

type Section = { heading: string; body: string[] }

/** The terms and privacy pages share one plain layout: the cover's type, none of its motion. */
export function LegalPage({ title, lead, sections }: { title: string; lead: string[]; sections: Section[] }) {
  const t = SITE.legal
  return (
    <>
      <main className="bg-cream text-ink">
        <div className="page py-[clamp(2.5rem,8svh,6rem)]">
          <Link href="/" className="mono-label inline-flex min-h-[44px] items-center hover:underline">
            ← {SITE.a11y.masthead}
          </Link>
          <h1 className="display mt-6 text-[clamp(3rem,10vw,7rem)]">{title}</h1>
          <p className="mono-label mt-4 text-ink/70">{t.updated}</p>
          <div className="mt-10 max-w-2xl space-y-10 text-lg leading-relaxed">
            <section>
              <h2 className="heavy text-2xl uppercase">{t.who}</h2>
              {lead.map(p => (
                <p key={p} className="mt-3 [text-wrap:pretty]">
                  {fill(p)}
                </p>
              ))}
            </section>
            {sections.map(s => (
              <section key={s.heading}>
                <h2 className="heavy text-2xl uppercase">{s.heading}</h2>
                {s.body.map(p => (
                  <p key={p} className="mt-3 [text-wrap:pretty]">
                    {fill(p)}
                  </p>
                ))}
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer onCover={false} />
    </>
  )
}

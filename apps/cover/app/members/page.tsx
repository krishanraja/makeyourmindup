import type { Metadata } from 'next'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { Footer } from '@/components/Footer'
import { SITE } from '@/lib/content'
import { configuredCode, COOKIE, isMember, MEMBERS, safePieces } from '@/lib/members'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: `${MEMBERS.meta.title} | ${SITE.footer.copyright}`,
  description: MEMBERS.meta.description,
  robots: { index: false, follow: false },
  alternates: { canonical: '/members' },
}

export default async function Members({ searchParams }: { searchParams: Promise<{ wrong?: string }> }) {
  const code = configuredCode()
  const member = isMember((await cookies()).get(COOKIE)?.value, code)
  const wrong = (await searchParams).wrong === '1'
  const pieces = safePieces(MEMBERS.pieces)
  return (
    <>
      <main className="bg-cream text-ink">
        <div className="page py-[clamp(2.5rem,8svh,6rem)]">
          <Link href="/" className="mono-label inline-flex min-h-[44px] items-center hover:underline">
            ← {SITE.a11y.masthead}
          </Link>
          <h1 className="display mt-6 text-[clamp(3rem,10vw,7rem)]">{MEMBERS.title}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed [text-wrap:pretty]">{MEMBERS.lead}</p>

          {!code && <p className="mt-10 max-w-2xl text-lg [text-wrap:pretty]">{MEMBERS.closed}</p>}

          {code && !member && (
            <form method="post" action="/members/unlock" className="mt-10 max-w-md">
              <label htmlFor="code" className="mono-label block">{MEMBERS.form.label}</label>
              <input
                id="code" name="code" type="password" required autoComplete="off"
                className="mt-3 block min-h-[44px] w-full border-2 border-ink bg-cream px-3 text-lg"
                aria-describedby="code-hint"
              />
              {wrong && <p role="alert" className="mt-3 text-lg font-semibold">{MEMBERS.form.wrong}</p>}
              <p id="code-hint" className="mt-3 text-base text-ink/70 [text-wrap:pretty]">{MEMBERS.form.hint}</p>
              <button type="submit" className="mono-label mt-6 min-h-[44px] border-2 border-ink bg-ink px-6 text-cream hover:bg-cream hover:text-ink">
                {MEMBERS.form.button}
              </button>
            </form>
          )}

          {code && member && (
            <div className="mt-10 max-w-2xl space-y-10 text-lg leading-relaxed">
              {pieces.length === 0 && <p className="[text-wrap:pretty]">{MEMBERS.empty}</p>}
              {pieces.map(p => (
                <section key={p.url}>
                  <h2 className="heavy text-2xl uppercase"><a href={p.url} className="hover:underline">{p.title}</a></h2>
                  <ul className="mt-3 space-y-2">
                    {p.files.map(f => (
                      <li key={f.href}><a href={f.href} className="underline" download>{f.label}</a></li>
                    ))}
                  </ul>
                </section>
              ))}
              <section>
                <h2 className="heavy text-2xl uppercase">{MEMBERS.alsoHeading}</h2>
                {MEMBERS.also.map(line => <p key={line} className="mt-3 [text-wrap:pretty]">{line}</p>)}
              </section>
            </div>
          )}
        </div>
      </main>
      <Footer onCover={false} />
    </>
  )
}

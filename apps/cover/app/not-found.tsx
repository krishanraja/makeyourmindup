import Link from 'next/link'
import { SITE } from '@/lib/content'

export default function NotFound() {
  const t = SITE.notFound
  return (
    <main className="grain flex min-h-[100svh] items-center bg-ink">
      <div className="page relative z-10 py-20">
        <p className="display text-[clamp(7rem,30vw,20rem)] text-mint">404</p>
        <h1 className="display mt-2 text-[clamp(2.4rem,6vw,5rem)] text-cream">{t.title}</h1>
        <p className="dek mt-4 text-2xl text-cream/80">{t.body}</p>
        <Link href="/" className="heavy brutal-cream mt-10 inline-flex min-h-[52px] items-center border-2 border-ink bg-mint px-6 text-lg uppercase text-ink">
          {t.cta}
        </Link>
      </div>
    </main>
  )
}

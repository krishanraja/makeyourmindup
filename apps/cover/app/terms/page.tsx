import type { Metadata } from 'next'
import { LegalPage } from '@/components/LegalPage'
import { SITE } from '@/lib/content'
import { OG_IMAGES } from '@/lib/social'

const t = SITE.legal.terms

export const metadata: Metadata = {
  title: `${t.title} | ${SITE.footer.copyright}`,
  description: t.description,
  alternates: { canonical: '/terms' },
  openGraph: { url: '/terms', title: `${t.title} | ${SITE.footer.copyright}`, description: t.description, images: OG_IMAGES },
}

export default function Terms() {
  return <LegalPage title={t.title} lead={[SITE.legal.operator]} sections={t.sections} />
}

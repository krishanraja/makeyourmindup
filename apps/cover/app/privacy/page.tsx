import type { Metadata } from 'next'
import { LegalPage } from '@/components/LegalPage'
import { SITE } from '@/lib/content'
import { OG_IMAGES } from '@/lib/social'

const t = SITE.legal.privacy

export const metadata: Metadata = {
  title: `${t.title} | ${SITE.footer.copyright}`,
  description: t.description,
  alternates: { canonical: '/privacy' },
  openGraph: { url: '/privacy', title: `${t.title} | ${SITE.footer.copyright}`, description: t.description, images: OG_IMAGES },
}

export default function Privacy() {
  return <LegalPage title={t.title} lead={[SITE.legal.operator, t.responsible]} sections={t.sections} />
}

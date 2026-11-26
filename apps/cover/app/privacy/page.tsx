import type { Metadata } from 'next'
import { LegalPage } from '@/components/LegalPage'
import { SITE } from '@/lib/content'
import { pageMeta, breadcrumbs } from '@/lib/discovery'
import { StructuredData } from '@/components/StructuredData'

const t = SITE.legal.privacy

export const metadata: Metadata = pageMeta('/privacy', t.title + ' | ' + SITE.footer.copyright, t.description)

export default function Privacy() {
  return <><StructuredData nodes={[breadcrumbs({ name: t.title, path: '/privacy' })]} /><LegalPage title={t.title} lead={[SITE.legal.operator, t.responsible]} sections={t.sections} /></>
}

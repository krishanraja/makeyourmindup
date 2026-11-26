import type { Metadata } from 'next'
import { LegalPage } from '@/components/LegalPage'
import { SITE } from '@/lib/content'
import { pageMeta, breadcrumbs } from '@/lib/discovery'
import { StructuredData } from '@/components/StructuredData'

const t = SITE.legal.terms

export const metadata: Metadata = pageMeta('/terms', t.title + ' | ' + SITE.footer.copyright, t.description)

export default function Terms() {
  return <><StructuredData nodes={[breadcrumbs({ name: t.title, path: '/terms' })]} /><LegalPage title={t.title} lead={[SITE.legal.operator]} sections={t.sections} /></>
}

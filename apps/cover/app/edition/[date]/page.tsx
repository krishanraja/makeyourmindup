import { notFound } from 'next/navigation'
import Edition from '@/components/edition/Edition'
import { StructuredData } from '@/components/StructuredData'
import { editionPath, fullDate } from '@/lib/desks'
import { breadcrumbs, editionSchema, pageMeta, publication } from '@/lib/discovery'
import { recut } from '@/lib/edition'
import { datedEdition } from '@/lib/published'

export const revalidate = 3600
export function generateStaticParams() { return [] }

type Props = { params: Promise<{ date: string }> }
export async function generateMetadata({ params }: Props) {
  const { date } = await params
  const s = await datedEdition(date)
  if (!s) notFound()
  const lead = recut(s, 'all').lead.item
  const path = editionPath(date)
  return pageMeta(path, fullDate(date) + ': ' + lead.headline + ' | ' + publication, lead.dek, path + '/opengraph-image', lead.headline)
}

export default async function Page({ params }: Props) {
  const { date } = await params
  const snapshot = await datedEdition(date)
  if (!snapshot) notFound()
  return <>
    <StructuredData nodes={[
      breadcrumbs({ name: 'Edition archive', path: '/editions' }, { name: fullDate(date), path: editionPath(date) }),
      editionSchema(snapshot),
    ]} />
    <Edition snapshot={snapshot} isFixture={false} pieces={snapshot.pieces} dated />
  </>
}

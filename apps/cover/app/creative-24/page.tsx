import { SectionPage } from '@/components/edition/SectionPage'
import { MarketTable } from '@/components/edition/MarketTable'
import { absolute, indexDescription, pageMeta, publication, publisher } from '@/lib/discovery'
import { latestEdition } from '@/lib/published'

export const revalidate = 900
const path = '/creative-24'
export const metadata = pageMeta(path, 'Creative 24: the creative industries stock index | ' + publication, indexDescription, '/creative-24/opengraph-image', 'The Creative 24')

export default async function Page() {
  const snapshot = await latestEdition()
  const dataset = {
    '@type': 'Dataset', '@id': absolute(path + '#dataset'), url: absolute(path),
    name: 'Creative 24', description: indexDescription, creator: publisher, publisher,
    measurementTechnique: 'Equal starting weights, rebased to 100 over a rolling month',
    variableMeasured: ['Index level', 'Daily percentage change', 'Monthly percentage change'],
    ...(snapshot && { dateModified: snapshot.generated_at, keywords: Object.keys(snapshot.ticker.stocks) }),
  }
  return <SectionPage title="The Creative 24" crumb={{ name: 'Creative 24', path }} nodes={[dataset]}>
    <p className="section-dek">The share prices of 24 listed companies across the creative industries.</p>
    <section className="method"><h2>How the index works</h2>
      <p>Each company in the table starts with the same weight. The index starts at 100 on the first shared observation of the rolling month. A market holiday carries forward the last available price. A company without an opening price in the first week sits out that series.</p>
      <p>The Edition uses Yahoo Finance daily closes and the latest available quote. The morning run is scheduled for 06:00 UTC, with a price refresh at 15:00 UTC. Day and month moves are percentage changes in price.</p>
    </section>
    {snapshot ? <MarketTable index={snapshot.ticker.index} stocks={Object.entries(snapshot.ticker.stocks)} asOf={snapshot.ticker.as_of} />
      : <p>Constituent prices are currently unavailable.</p>}
  </SectionPage>
}

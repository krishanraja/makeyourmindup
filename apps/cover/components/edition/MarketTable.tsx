import type { Index, Stock } from '@/lib/hub'
import { price, Spark } from './MarketValues'
import { Percent } from './Story'

export function MarketTable({ index, stocks, asOf }: {
  index: Index; stocks: [string, Stock][]; asOf: string | null
}) {
  return <section className="market-data" aria-label="Index and constituents">
    <div className="market-summary">
      <div><span className="sc">Index level</span><strong>{index.series.at(-1)?.toFixed(2) ?? 'n/a'}</strong></div>
      <Spark data={index.series} width={180} height={50} />
      <p>Day <Percent value={index.day_pct} /><br />Month <Percent value={index.month_pct} /></p>
    </div>
    <p className="market-date">{asOf ? 'Latest observation: ' + asOf : 'Observation date unavailable'}</p>
    <table><caption className="sr">Constituent prices and moves</caption><thead><tr>
      <th scope="col">Company</th><th scope="col">Price</th><th scope="col">Day</th><th scope="col">Month</th>
    </tr></thead><tbody>{stocks.map(([symbol, stock]) => <tr key={symbol}>
      <th scope="row">{stock.name}<small>{symbol}</small></th><td>{price(stock)}{stock.currency && <small>{stock.currency}</small>}</td>
      <td><Percent value={stock.day_pct} /></td><td><Percent value={stock.month_pct} /></td>
    </tr>)}</tbody></table>
  </section>
}

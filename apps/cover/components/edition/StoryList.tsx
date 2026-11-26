import { fullDate, storyPath } from '@/lib/desks'
import type { Item } from '@/lib/hub'

// `dated` false (the homepage's fallback edition) links each headline to its source, because that edition has no dated page.
export function StoryList({ stories, anchors = false, dated = true }: { stories: { date: string; item: Item }[]; anchors?: boolean; dated?: boolean }) {
  return <div className="desk-stories">{stories.map(({ date, item }) => (
    <article key={date + '/' + item.id} id={anchors ? item.id : undefined}>
      <time className="sc" dateTime={date}>{fullDate(date)}</time>
      <h3><a href={dated ? storyPath(date, item.id) : item.url}>{item.headline}</a></h3>
      <p>{item.dek}</p>
      <a className="desk-source" href={item.url}>{item.source} ↗</a>
    </article>
  ))}</div>
}

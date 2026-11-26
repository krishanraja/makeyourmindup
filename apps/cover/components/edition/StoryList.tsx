import { fullDate, storyPath } from '@/lib/desks'
import type { Item } from '@/lib/hub'

export function StoryList({ stories, anchors = false }: { stories: { date: string; item: Item }[]; anchors?: boolean }) {
  return <div className="desk-stories">{stories.map(({ date, item }) => (
    <article key={date + '/' + item.id} id={anchors ? item.id : undefined}>
      <time className="sc" dateTime={date}>{fullDate(date)}</time>
      <h3><a href={storyPath(date, item.id)}>{item.headline}</a></h3>
      <p>{item.dek}</p>
      <a className="desk-source" href={item.url}>{item.source} ↗</a>
    </article>
  ))}</div>
}

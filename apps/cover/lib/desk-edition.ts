import { cache } from 'react'
import { notFound } from 'next/navigation'
import { deskKeys, desks } from './desks'
import { recentEditions } from './published'

export const deskEdition = cache(async (slug: string) => {
  const key = deskKeys.find(key => desks[key].slug === slug)
  if (!key) notFound()
  const issues = await recentEditions()
  const stories = issues.flatMap(s => s.items.filter(n => n.subsector === key)
    .sort((a, b) => b.date.localeCompare(a.date)).map(item => ({ date: s.edition_date, item })))
  return { key, desk: desks[key], stories, latest: issues[0] }
})

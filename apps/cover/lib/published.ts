import { cache } from 'react'
import { isEditionDate, loadEdition, parseSnapshot, readHub, type Snapshot } from './hub'

export const today = () => new Date().toISOString().slice(0, 10)
export const publishedDay = (day: unknown): day is string => isEditionDate(day) && day <= today()

export const latestEdition = cache(async () => {
  const { snapshot, isFixture } = await loadEdition()
  return !isFixture && publishedDay(snapshot.edition_date) ? snapshot : null
})

export const datedEdition = cache(async (date: string) => {
  if (!publishedDay(date)) return null
  const raw = await readHub({ date }, date === today() ? 900 : 3600)
  if (raw === null) return null
  const snapshot = parseSnapshot(raw)
  // An older hub may ignore the date parameter and return the latest issue.
  return snapshot.edition_date === date ? snapshot : null
})

export const archiveDates = cache(async (): Promise<string[] | null> => {
  try {
    const raw = await readHub({ archive: '1' })
    if (raw?.ok !== true || !Array.isArray(raw.dates) || !raw.dates.every(isEditionDate)) return null
    return [...new Set<string>(raw.dates.filter(publishedDay))].sort().reverse()
  } catch {
    return null
  }
})

export async function readDates(dates: string[]) {
  const rows = await Promise.all(dates.map(day => datedEdition(day).catch(() => null)))
  return rows.filter((row): row is Snapshot => row !== null)
}

export const recentEditions = cache(async () => {
  const dates = await archiveDates()
  return dates ? readDates(dates.slice(0, 14)) : []
})

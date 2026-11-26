import type { Sector } from './hub'

export const desks = {
  music: { slug: 'music', label: 'Music', subject: 'music', beat: 'record labels, streaming services and music rights' },
  film_tv: { slug: 'film-tv', label: 'Film & TV', subject: 'film and TV', beat: 'studios, screen rights and production' },
  gaming: { slug: 'gaming', label: 'Gaming', subject: 'gaming', beat: 'game development, publishers and players' },
  sport: { slug: 'sport', label: 'Sport', subject: 'sport', beat: 'broadcast rights, leagues and sports media' },
  publishing_media: { slug: 'publishing-media', label: 'Publishing & media', subject: 'publishing and media', beat: 'publishers, newsrooms and licensing' },
  art_design: { slug: 'art-design', label: 'Art & design', subject: 'art and design', beat: 'artists, design tools and image rights' },
} satisfies Record<Sector, { slug: string; label: string; subject: string; beat: string }>

export const deskKeys = Object.keys(desks) as Sector[]
export const editionPath = (date: string) => '/edition/' + date
export const storyPath = (date: string, id: string) => editionPath(date) + '#' + encodeURIComponent(id)
export const fullDate = (date: string) => new Intl.DateTimeFormat('en-GB', {
  day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
}).format(new Date(date))

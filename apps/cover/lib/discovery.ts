import type { Metadata } from 'next'
import { CONFIG } from './content'
import { desks, editionPath, fullDate, storyPath } from './desks'
import type { Snapshot } from './hub'

export const publication = 'Make Your Mind Up'
export const absolute = (path: string) => new URL(path, CONFIG.siteUrl).href
export const publisher = { '@id': absolute('/#publication') }
export const indexDescription = 'The Creative 24 tracks listed companies across six creative industries. See the constituents, index level and daily and monthly price changes.'

export function pageMeta(path: string, title: string, description: string, card?: string, alt?: string, twitterCard?: string): Metadata {
  const image = (url: string) => [{ url: absolute(url), width: 1200, height: 630, type: 'image/png', alt: alt || (card ? title : publication) }]
  return {
    title, description, alternates: { canonical: path },
    openGraph: { type: 'website', siteName: publication, url: path, title, description, images: image(card || '/opengraph-image') },
    twitter: { card: 'summary_large_image', title, description, images: image(twitterCard || card || '/twitter-image') },
  }
}

export type Crumb = { name: string; path: string }
export function breadcrumbs(...crumbs: Crumb[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: publication, path: '/' }, ...crumbs].map(({ name, path }, i) => ({
      '@type': 'ListItem', position: i + 1, name, item: absolute(path),
    })),
  }
}

export function editionSchema(s: Snapshot) {
  return {
    '@type': 'CollectionPage', '@id': absolute(editionPath(s.edition_date)), name: 'The Edition, ' + fullDate(s.edition_date),
    publisher, datePublished: s.edition_date, mainEntity: {
      '@type': 'ItemList', numberOfItems: s.items.length, itemListElement: s.items.map((n, i) => ({
        '@type': 'ListItem', position: i + 1, item: {
          '@type': 'NewsArticle', headline: n.headline, description: n.dek,
          datePublished: s.edition_date, url: absolute(storyPath(s.edition_date, n.id)),
          isBasedOn: n.url, about: desks[n.subsector].label, publisher,
          ...(n.image && { image: { '@type': 'ImageObject', url: absolute(n.image.url), creditText: n.image.credit } }),
        },
      })),
    },
  }
}

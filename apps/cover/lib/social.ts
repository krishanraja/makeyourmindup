// The share card for every page. Declared here rather than through Next's
// opengraph-image file convention, because that convention caches the card's
// metadata between builds and dropped the alt text in production
// (2026-10-21). A page that sets its own openGraph must spread these in, or
// Next drops the image for that page.
const ALT =
  'Make Your Mind Up. The Edition. EA brings back John Motson\'s voice with AI.'

export const OG_IMAGES = [
  { url: '/opengraph-image.jpg', width: 1200, height: 630, type: 'image/jpeg', alt: ALT },
]

export const TWITTER_IMAGES = [{ url: '/twitter-image.jpg', width: 1200, height: 630, alt: ALT }]

import entities from '@/content/legal-entities.md'
import { SITE } from '@/lib/content'

/**
 * The two companies that operate the site (Krish, 2026-10-19). Their names
 * live in content/legal-entities.md and nowhere else, because that file is the
 * only one the kill list lets name them: Mindmaker on its own is a retired
 * publication name and stays vetoed everywhere, site.json included. Copy in
 * site.json writes {llc}, {ltd} and {brand}, and only the footer note and the
 * terms and privacy pages fill them in.
 */
function read(key: 'llc' | 'ltd') {
  const m = new RegExp(`^${key}:\\s*(.+)$`, 'm').exec(entities)
  if (!m) throw new Error(`content/legal-entities.md has no ${key} line`)
  return m[1].trim()
}

export const ENTITY = { llc: read('llc'), ltd: read('ltd') }

export function fill(text: string) {
  return text
    .replaceAll('{brand}', SITE.footer.copyright)
    .replaceAll('{llc}', ENTITY.llc)
    .replaceAll('{ltd}', ENTITY.ltd)
}

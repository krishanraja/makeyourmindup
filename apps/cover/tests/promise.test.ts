// The email promise (Ruling, Krish, 2026-11-25): readers get one email a week, the weekly edition, every Saturday; the
// Monday, Wednesday and Friday pieces go up on the site without an email of their own. The site and the Substack kit's
// copy say so, and the old promise of three emails a week does not come back. Design: growth-makeyourmindup
// docs/plans/2026-11-25-weekly-edition/. Run: npm test.
import { describe, test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = join(__dirname, '..')
const site = JSON.parse(readFileSync(join(root, 'content', 'site.json'), 'utf8'))
const kit = readFileSync(join(root, 'substack-kit', 'COPY.md'), 'utf8')

// Each retired line promised an email for every piece.
const RETIRED = [/three emails a week/i, /free, every monday, wednesday and friday/i, /three short reads a week/i]

describe('the email promise', () => {
  test('the site description promises the Saturday email, and no retired promise', () => {
    assert.match(site.meta.description, /one email every Saturday/)
    for (const line of RETIRED) assert.doesNotMatch(site.meta.description, line)
  })
  test('the Substack kit copy promises the Saturday email, and no retired promise', () => {
    assert.match(kit, /One email a week, every Saturday/)
    for (const line of RETIRED) assert.doesNotMatch(kit, line)
  })
  test('the new lines keep the house rules: no em dash, no exclamation mark', () => {
    for (const text of [site.meta.description, kit]) {
      assert.equal(text.includes('—'), false)
    }
    assert.equal(site.meta.description.includes('!'), false)
  })
})

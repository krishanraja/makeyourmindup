// The email promise (Ruling, Krish, 2026-11-25): readers get one email a week, the weekly edition, every Saturday; the
// Monday, Wednesday and Friday pieces go up on the site without an email of their own. The Substack kit's copy and the
// Edition's subscribe box say so, and the retired promises (three emails a week, one email a morning) do not come back.
// The site description moved to The Edition and promises no cadence, so it is only checked for the retired lines.
// Design: growth-makeyourmindup docs/plans/2026-11-25-weekly-edition/. Run: npm test.
import { describe, test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = join(__dirname, '..')
const site = JSON.parse(readFileSync(join(root, 'content', 'site.json'), 'utf8'))
const kit = readFileSync(join(root, 'substack-kit', 'COPY.md'), 'utf8')
const edition = readFileSync(join(root, 'components', 'edition', 'Edition.tsx'), 'utf8')

// Each retired line promised an email the publication does not send.
const RETIRED = [
  /three emails a week/i,
  /free, every monday, wednesday and friday/i,
  /three short reads a week/i,
  /one email a morning/i,
]

describe('the email promise', () => {
  test('the site description carries no retired promise', () => {
    for (const line of RETIRED) assert.doesNotMatch(site.meta.description, line)
  })
  test('the Substack kit copy promises the Saturday email, and no retired promise', () => {
    assert.match(kit, /One email a week, every Saturday/)
    for (const line of RETIRED) assert.doesNotMatch(kit, line)
  })
  test("the Edition's subscribe box promises the Saturday email, and no retired promise", () => {
    assert.match(edition, /one email every Saturday/)
    for (const line of RETIRED) assert.doesNotMatch(edition, line)
  })
  test('the new lines keep the house rules: no em dash, no exclamation mark', () => {
    for (const text of [site.meta.description, kit]) {
      assert.equal(text.includes(String.fromCharCode(0x2014)), false)
    }
    assert.equal(site.meta.description.includes('!'), false)
  })
})

// The members gate (lib/members.ts): one shared code from MEMBERS_CODE, a hashed cookie, and a page that stays shut
// with no code set. Run: npm test.
import { describe, test } from 'node:test'
import assert from 'node:assert/strict'
import { codeMatches, configuredCode, isMember, memberToken, safePieces } from '../lib/members'

const CODE = 'theatre-stuffing-42'

describe('members gate', () => {
  test('no code, or a short one, keeps the page shut', () => {
    assert.equal(configuredCode({}), null)
    assert.equal(configuredCode({ MEMBERS_CODE: 'short' }), null)
    assert.equal(configuredCode({ MEMBERS_CODE: `  ${CODE} ` }), CODE)
    assert.equal(codeMatches(CODE, null), false)
    assert.equal(isMember(memberToken(CODE), null), false)
  })
  test('the right code opens, with spaces and case forgiven; anything else does not', () => {
    assert.equal(codeMatches(CODE, CODE), true)
    assert.equal(codeMatches(`  ${CODE.toUpperCase()} `, CODE), true)
    for (const wrong of ['', 'theatre', `${CODE}x`, 42, null, undefined]) assert.equal(codeMatches(wrong, CODE), false)
  })
  test('the cookie holds a hash, never the code, and a new code locks old cookies out', () => {
    const token = memberToken(CODE)
    assert.notEqual(token, CODE); assert.equal(token.includes(CODE), false)
    assert.equal(isMember(token, CODE), true)
    assert.equal(isMember(token, 'a-brand-new-code-99'), false)
    assert.equal(isMember(undefined, CODE), false)
    assert.equal(isMember(CODE, CODE), false)
  })
  test('only https links are shown', () => {
    const shown = safePieces([
      { title: 'A', url: 'https://home.makeyourmindup.ai/p/a', files: [{ label: 'ok', href: 'https://files.example/a.png' }, { label: 'bad', href: 'javascript:alert(1)' }] },
      { title: 'B', url: 'javascript:alert(1)', files: [] },
    ])
    assert.equal(shown.length, 1); assert.deepEqual(shown[0].files.map(f => f.label), ['ok'])
  })
})

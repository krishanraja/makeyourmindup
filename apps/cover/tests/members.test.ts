// The members gate (lib/members.ts): one shared code from MEMBERS_CODE, a hashed cookie, and a page that stays shut
// with no code set. Run: npm test.
import { describe, test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { codeMatches, configuredCode, isMember, memberFilePath, memberToken, MEMBERS, safePieces } from '../lib/members'

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
  test('gated file paths are kept, and no path can climb out of the files folder', () => {
    assert.deepEqual(memberFilePath('/members/files/2026-11-02-who-trains-2030-seniors/figure-ladder.png'), { piece: '2026-11-02-who-trains-2030-seniors', file: 'figure-ladder.png' })
    for (const bad of ['/members/files/../secret/x.png', '/members/files/a/..%2Fx.png', '/members/files/a/b.exe', '/members/files/A/b.png', '/public/x.png', 'javascript:alert(1)'])
      assert.equal(memberFilePath(bad), null, bad)
    const shown = safePieces([{ title: 'A', url: 'https://home.makeyourmindup.ai/p/a', files: [{ label: 'gated', href: '/members/files/a/b.png' }, { label: 'bad', href: '/etc/passwd' }] }])
    assert.deepEqual(shown[0].files.map(f => f.label), ['gated'])
  })
  test('every file the members page lists exists in members-files', () => {
    const files = MEMBERS.pieces.flatMap(p => p.files)
    assert.ok(files.length >= 10)
    for (const f of files) {
      const t = memberFilePath(f.href); assert.ok(t, f.href)
      assert.ok(existsSync(`members-files/${t!.piece}/${t!.file}`), f.href)
    }
  })
})

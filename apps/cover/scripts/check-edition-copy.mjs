import { readFileSync, readdirSync } from 'node:fs'
import ts from 'typescript'
import { check } from '../../../scripts/qa/kill-list.mjs'

// Feed the gate words the reader can see. Numeric price histories are data,
// and TypeScript operators such as logical negation are not punctuation in copy.
let vetoes = 0,
  warnings = 0
function scan(path, text) {
  const { findings } = check(text, { path })
  for (const f of findings) {
    if (f.level === 'veto') vetoes++
    if (f.level === 'warning') warnings++
    console.log(f.level.toUpperCase(), path, f.id, JSON.stringify(f.sample))
  }
}
function strings(value) {
  if (typeof value === 'string') return [value]
  if (!value || typeof value !== 'object') return []
  return Object.values(value).flatMap(strings)
}
for (const file of ['content/edition-snapshot.json', 'content/edition-notes.json']) {
  scan(file, strings(JSON.parse(readFileSync(file, 'utf8'))).join('\n'))
}
for (const name of readdirSync('components/edition').filter((s) => s.endsWith('.tsx'))) {
  const path = 'components/edition/' + name
  const file = ts.createSourceFile(
    path,
    readFileSync(path, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  )
  function visit(node) {
    if (ts.isJsxText(node) || ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node))
      scan(path, node.text.trim())
    ts.forEachChild(node, visit)
  }
  visit(file)
}
console.log('Edition copy:', vetoes, 'vetoes,', warnings, 'warnings')
if (vetoes) process.exitCode = 1

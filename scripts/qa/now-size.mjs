#!/usr/bin/env node
/**
 * NOW.md stays a page a session can read in one go.
 *
 *   node scripts/qa/now-size.mjs [path] [--max <bytes>]
 *
 * When it passes the cap, move the oldest "What changed recently" entries,
 * verbatim and newest first, into the file its `history_log` names
 * (docs/history/LOG.md). The archive has no cap; NOW.md does.
 */
import { readFileSync, statSync } from 'node:fs'

export const MAX_BYTES = 16 * 1024

const args = process.argv.slice(2)
const at = args.indexOf('--max')
const max = at >= 0 ? Number(args[at + 1]) : MAX_BYTES
const path = args.find((a, i) => !a.startsWith('--') && i !== at + 1) ?? 'NOW.md'

const bytes = statSync(path).size
const log = readFileSync(path, 'utf8').match(/^history_log:\s*(\S+)/m)?.[1] ?? 'docs/history/LOG.md'
if (bytes > max) {
  console.log(`FAIL  ${path} is ${bytes} bytes, over the ${max} byte cap. Move the oldest "What changed recently" entries to ${log}.`)
  process.exit(1)
}
console.log(`PASS  ${path} is ${bytes} of ${max} bytes`)

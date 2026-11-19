import { createHash, timingSafeEqual } from 'node:crypto'
import members from '@/content/members.json'

// The members page sits behind one shared code (Ruling, Krish, 2026-11-19: the reusable files sit on a code-gated
// page). The code lives only in the MEMBERS_CODE environment variable. The browser keeps a hash of it in a cookie,
// never the code itself, so changing the code locks every old cookie out. With no code set, the page stays shut.

export type MemberFile = { label: string; href: string }
export type MemberPiece = { title: string; url: string; files: MemberFile[] }

export const MEMBERS = members as Omit<typeof members, 'pieces'> & { pieces: MemberPiece[] }
export const COOKIE = 'mymu_members'
export const MIN_CODE_LENGTH = 12

/** The configured code, or null when it is missing or too short to be safe. */
export function configuredCode(env: Record<string, string | undefined> = process.env): string | null {
  const code = env.MEMBERS_CODE?.trim()
  return code && code.length >= MIN_CODE_LENGTH ? code : null
}

/** What the cookie holds: a hash of the code, so the code never sits in the browser. */
export function memberToken(code: string): string {
  return createHash('sha256').update(`makeyourmindup-members:${code}`).digest('hex')
}

function same(a: string, b: string): boolean {
  const x = createHash('sha256').update(a).digest()
  const y = createHash('sha256').update(b).digest()
  return timingSafeEqual(x, y)
}

/** Whether a typed code opens the page. Spaces around it and letter case are forgiven. */
export function codeMatches(typed: unknown, code: string | null): boolean {
  if (!code || typeof typed !== 'string') return false
  return same(typed.trim().toLowerCase(), code.toLowerCase())
}

/** Whether the cookie a browser sent belongs to the current code. */
export function isMember(cookie: string | undefined, code: string | null): boolean {
  if (!code || !cookie) return false
  return same(cookie, memberToken(code.toLowerCase()))
}

/** Only https links, or this site's own gated file paths, are shown, so a bad manifest entry cannot become a script link. */
export function safePieces(pieces: MemberPiece[]): MemberPiece[] {
  const ok = (u: string) => { try { return new URL(u).protocol === 'https:' } catch { return false } }
  return pieces
    .filter(p => ok(p.url))
    .map(p => ({ ...p, files: p.files.filter(f => ok(f.href) || memberFilePath(f.href) !== null) }))
}

// The files themselves sit in members-files/, outside public/, so nothing serves them except the gated route.
const FILE = /^\/members\/files\/([a-z0-9-]{1,80})\/([a-z0-9-]{1,80}\.(?:png|pdf|svg|zip))$/

/** The piece folder and file name of a gated file path, or null for anything else, so no path can climb out. */
export function memberFilePath(href: string): { piece: string; file: string } | null {
  const m = FILE.exec(href)
  return m ? { piece: m[1], file: m[2] } : null
}

export const CONTENT_TYPES: Record<string, string> = {
  png: 'image/png', pdf: 'application/pdf', svg: 'image/svg+xml', zip: 'application/zip',
}

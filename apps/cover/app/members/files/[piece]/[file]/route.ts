import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { configuredCode, CONTENT_TYPES, COOKIE, isMember, memberFilePath } from '@/lib/members'

// Serves a member's file only to a browser holding the current code's cookie. Anyone else is sent to the code form.
export async function GET(request: Request, { params }: { params: Promise<{ piece: string; file: string }> }) {
  const { piece, file } = await params
  const target = memberFilePath(`/members/files/${piece}/${file}`)
  if (!target) return new NextResponse('Not found', { status: 404 })
  if (!isMember((await cookies()).get(COOKIE)?.value, configuredCode())) {
    return NextResponse.redirect(new URL('/members', request.url), 303)
  }
  try {
    const body = await readFile(path.join(process.cwd(), 'members-files', target.piece, target.file))
    const ext = target.file.split('.').pop()!
    return new NextResponse(body, {
      headers: {
        'content-type': CONTENT_TYPES[ext] ?? 'application/octet-stream',
        'content-disposition': `attachment; filename="${target.file}"`,
        'cache-control': 'private, no-store',
        'x-robots-tag': 'noindex',
      },
    })
  } catch {
    return new NextResponse('Not found', { status: 404 })
  }
}

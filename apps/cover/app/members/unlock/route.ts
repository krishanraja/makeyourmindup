import { NextResponse } from 'next/server'
import { codeMatches, configuredCode, COOKIE, memberToken } from '@/lib/members'

// The members form posts here. A right code sets the cookie and goes back to the page; a wrong one goes back with a
// flag, after a short pause so guessing is slow.
export async function POST(request: Request) {
  const code = configuredCode()
  let typed: unknown = null
  try { typed = (await request.formData()).get('code') } catch { typed = null }
  const back = new URL('/members', request.url)
  if (!codeMatches(typed, code)) {
    await new Promise(r => setTimeout(r, 800))
    back.searchParams.set('wrong', '1')
    return NextResponse.redirect(back, 303)
  }
  const res = NextResponse.redirect(back, 303)
  res.cookies.set(COOKIE, memberToken(code!.toLowerCase()), {
    httpOnly: true, secure: true, sameSite: 'lax', path: '/members', maxAge: 60 * 60 * 24 * 365,
  })
  return res
}

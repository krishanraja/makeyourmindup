import { createHash, timingSafeEqual } from 'node:crypto'
import { CONFIG } from '@/lib/content'
import { deskKeys, desks, editionPath } from '@/lib/desks'
import { absolute } from '@/lib/discovery'
import { parseSnapshot, readHub } from '@/lib/hub'
import { today } from '@/lib/published'

const digest = (value: string) => createHash('sha256').update(value).digest()

export async function POST(request: Request) {
  const secret = process.env.INDEXNOW_SECRET
  const header = request.headers.get('authorization') || ''
  if (!secret || !timingSafeEqual(digest(header), digest('Bearer ' + secret))) {
    return new Response(null, { status: 401 })
  }
  const day = today()
  const edition = await readHub({ date: day }, 0).then(parseSnapshot).catch(() => null)
  if (edition?.edition_date !== day) return Response.json({ error: 'Edition unavailable' }, { status: 503 })
  const paths = [editionPath(day), '/', ...deskKeys.map(k => '/' + desks[k].slug)]
  try {
    const result = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ host: new URL(CONFIG.siteUrl).host, key: CONFIG.indexNowKey,
        keyLocation: absolute('/' + CONFIG.indexNowKey + '.txt'), urlList: paths.map(absolute) }),
      signal: AbortSignal.timeout(6500),
    })
    return Response.json({ accepted: result.ok, upstreamStatus: result.status }, { status: result.ok ? result.status : 502 })
  } catch {
    return Response.json({ error: 'IndexNow unavailable' }, { status: 502 })
  }
}

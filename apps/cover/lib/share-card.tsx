import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { ImageResponse } from 'next/og'

const font = (name: string) => readFile(path.join(process.cwd(), 'app', 'fonts', name))
// next/og's OpenType reader fails on Fraunces' variation-axis names. It draws
// the default glyf outlines directly. Hide the optional axis directory entry
// in this in-memory copy, leaving the web font and its outlines untouched.
function defaultOutlines(font: Buffer) {
  const tables = font.readUInt16BE(4)
  for (let i = 0; i < tables; i++) {
    const offset = 12 + i * 16
    if (font.toString('ascii', offset, offset + 4) === 'fvar') {
      font.write('FVAR', offset, 'ascii')
      break
    }
  }
  return font
}

export async function shareCard(label: string, headline: string, ttl = 900) {
  const [fraunces, mono] = await Promise.all([font('Fraunces-Upright-Variable.ttf'), font('DMMono-Regular.ttf')])
  const text = headline.length > 165 ? headline.slice(0, 162).replace(/\s+\S*$/, '') + '…' : headline
  return new ImageResponse(<div style={{ width: '100%', height: '100%', background: '#F4EFE4', color: '#0C1512',
    padding: '54px 66px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0C1512', paddingBottom: 20,
      fontFamily: 'DM Mono', fontSize: 24 }}><span>Make Your Mind Up</span><span>{label}</span></div>
    <div style={{ display: 'flex', fontFamily: 'Fraunces', fontSize: text.length > 105 ? 56 : 76, lineHeight: 1.08 }}>{text}</div>
    <span style={{ fontFamily: 'DM Mono', fontSize: 23 }}>Creativity, AI and money, simplified.</span>
  </div>, { width: 1200, height: 630, headers: { 'Cache-Control': 'public, max-age=' + ttl }, fonts: [
    { name: 'Fraunces', data: defaultOutlines(fraunces), style: 'normal' }, { name: 'DM Mono', data: mono, style: 'normal' },
  ] })
}

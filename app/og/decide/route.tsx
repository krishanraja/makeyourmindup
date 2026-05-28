import { variantOgImage } from '@/og/variantImage';
import { decide } from '@/lib/variants';

export const runtime = 'edge';

export function GET() {
  return variantOgImage('decide', decide.og.title, decide.og.subtitle);
}

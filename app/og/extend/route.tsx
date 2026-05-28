import { variantOgImage } from '@/og/variantImage';
import { extend } from '@/lib/variants';

export const runtime = 'edge';

export function GET() {
  return variantOgImage('extend', extend.og.title, extend.og.subtitle);
}

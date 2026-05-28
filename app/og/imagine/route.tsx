import { variantOgImage } from '@/og/variantImage';
import { imagine } from '@/lib/variants';

export const runtime = 'edge';

export function GET() {
  return variantOgImage('imagine', imagine.og.title, imagine.og.subtitle);
}

import { redirect } from 'next/navigation';
import { ShareCatcher } from './share-catcher';

type Search = { [key: string]: string | string[] | undefined };

export const dynamic = 'force-dynamic';

export default function SharePage({ searchParams }: { searchParams: Search }) {
  const shared = pickString(
    searchParams.shared,
    searchParams.url,
    searchParams.text,
    searchParams.title,
  );
  if (!shared) redirect('/');
  return <ShareCatcher shared={shared} />;
}

function pickString(...values: Array<string | string[] | undefined>): string | null {
  for (const v of values) {
    if (typeof v === 'string' && v.trim()) return v.trim();
    if (Array.isArray(v) && v[0]) return v[0];
  }
  return null;
}

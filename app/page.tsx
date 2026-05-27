import { Experience } from '@/experience/Experience';

export default function Page({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const source = pickString(searchParams.source) ?? 'direct';
  const utm = {
    source: pickString(searchParams.utm_source),
    medium: pickString(searchParams.utm_medium),
    campaign: pickString(searchParams.utm_campaign),
  };

  return (
    <main className="relative min-h-[100dvh] w-full overflow-hidden bg-ink text-cream">
      <Experience source={source} utm={utm} />
    </main>
  );
}

function pickString(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

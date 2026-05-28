'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const SHARED_KEY = 'myu_shared';

export function ShareCatcher({ shared }: { shared: string }) {
  const router = useRouter();
  useEffect(() => {
    try {
      sessionStorage.setItem(SHARED_KEY, shared);
    } catch {
      // ignore
    }
    router.replace('/');
  }, [router, shared]);
  return null;
}

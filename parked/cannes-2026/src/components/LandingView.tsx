'use client';

import { useEffect } from 'react';
import { trackLandingViewed } from '@/lib/analytics';

// Renders nothing. Fires landing_viewed once when the landing page mounts.
// The landing page itself stays a server component; this is the only JS on it.
export function LandingView() {
  useEffect(() => {
    trackLandingViewed();
  }, []);
  return null;
}

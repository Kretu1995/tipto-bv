'use client';

import { useEffect } from 'react';

export default function SimulatorLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Hide header, footer, back-to-top, cookie consent
    const els = document.querySelectorAll('header, footer');
    els.forEach(el => (el as HTMLElement).style.display = 'none');
    document.body.style.overflow = 'hidden';

    return () => {
      els.forEach(el => (el as HTMLElement).style.display = '');
      document.body.style.overflow = '';
    };
  }, []);

  return <>{children}</>;
}

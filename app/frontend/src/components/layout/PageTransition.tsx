'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Fast, silky-smooth GPU-accelerated page transitions across every route.
 * Renders instant fluid entrance whenever route changes.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    // If navigating to an anchor hash (like #care), smoothly scroll to that element
    if (typeof window !== 'undefined' && window.location.hash) {
      const hashId = window.location.hash.replace('#', '');
      const targetEl = document.getElementById(hashId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    // Otherwise instant scroll to top on page change
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return (
    <div key={pathname} className="page-enter-fast w-full">
      {children}
    </div>
  );
}

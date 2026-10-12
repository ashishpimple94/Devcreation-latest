'use client';

import { useEffect, useState } from 'react';

/**
 * Ultra-slim, GPU-smooth luxury reading progress indicator fixed at the top of the viewport.
 * Automatically updates on every page with zero frame drops.
 */
export function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          if (docHeight <= 0) {
            setProgress(0);
          } else {
            const current = (window.scrollY / docHeight) * 100;
            setProgress(Math.min(100, Math.max(0, current)));
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[100] h-[2.5px] pointer-events-none bg-transparent"
      aria-hidden="true"
    >
      <div
        className="h-full bg-gradient-to-r from-gold via-copper to-gold-lt transition-[width] duration-150 ease-out shadow-[0_0_8px_rgba(184,148,63,0.5)]"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

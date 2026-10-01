'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

type Direction = 'up' | 'left' | 'right' | 'scale' | 'none';

/**
 * High-performance, luxury reveal-on-scroll component.
 * - Detects if already within the viewport on mount to prevent flash of hidden content (FOIC).
 * - Uses hardware-accelerated transforms with a subtle optical blur-to-sharp transition.
 * - Gentle cubic-bezier curve tuned for a premium editorial feel.
 */
export function ScrollAnimate({
  children,
  direction = 'up',
  delay = 0,
  className,
  as: Tag = 'div',
}: {
  children: React.ReactNode;
  direction?: Direction;
  delay?: number;
  className?: string;
  as?: 'div' | 'section' | 'article' | 'span';
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Check if element is already inside viewport on mount
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: '30px 0px -30px 0px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const hiddenClass =
    direction === 'left'
      ? '-translate-x-6 opacity-0 blur-[3px]'
      : direction === 'right'
        ? 'translate-x-6 opacity-0 blur-[3px]'
        : direction === 'scale'
          ? 'scale-[0.96] opacity-0 blur-[3px]'
          : direction === 'none'
            ? 'opacity-0 blur-[3px]'
            : 'translate-y-5 opacity-0 blur-[2px]';

  return (
    <Tag
      ref={ref as React.RefObject<HTMLDivElement>}
      className={cn(
        'transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-[transform,opacity,filter] motion-reduce:!transform-none motion-reduce:!opacity-100 motion-reduce:!filter-none',
        visible ? 'translate-x-0 translate-y-0 scale-100 opacity-100 blur-0' : hiddenClass,
        className,
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

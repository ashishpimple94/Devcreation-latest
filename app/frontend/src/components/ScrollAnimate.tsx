'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

type Direction = 'up' | 'left' | 'right' | 'scale';

/**
 * Reveal-on-scroll wrapper reproducing the original site's [data-anim] behaviour
 * using IntersectionObserver.
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
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const hidden =
    direction === 'left'
      ? '-translate-x-10 opacity-0'
      : direction === 'right'
        ? 'translate-x-10 opacity-0'
        : direction === 'scale'
          ? 'scale-[0.92] opacity-0'
          : 'translate-y-9 opacity-0';

  return (
    <Tag
      ref={ref as React.RefObject<HTMLDivElement>}
      className={cn(
        'transition-all duration-700 ease-[cubic-bezier(.16,1,.3,1)] motion-reduce:!transform-none motion-reduce:!opacity-100',
        visible ? 'translate-x-0 translate-y-0 scale-100 opacity-100' : hidden,
        className,
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

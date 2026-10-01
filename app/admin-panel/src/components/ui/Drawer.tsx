'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const SIZE_CLASSES = {
  sm: 'w-full max-w-full sm:max-w-md',
  md: 'w-full max-w-full sm:max-w-lg',
  lg: 'w-full max-w-full sm:max-w-xl lg:max-w-2xl',
  xl: 'w-full max-w-full sm:max-w-2xl lg:max-w-3xl',
};

/**
 * Slide-over drawer component with backdrop blur, keyboard ESC dismissal,
 * body scroll locking, and smooth entrance/exit transitions.
 */
export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  className,
  size = 'lg',
}: DrawerProps) {
  const [rendered, setRendered] = useState(open);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setRendered(true);
      const timer = requestAnimationFrame(() => {
        setVisible(true);
      });
      // Lock body scroll
      document.body.style.overflow = 'hidden';
      return () => cancelAnimationFrame(timer);
    } else {
      setVisible(false);
      const timer = setTimeout(() => {
        setRendered(false);
      }, 300);
      document.body.style.overflow = '';
      return () => clearTimeout(timer);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!rendered) return null;

  return (
    <div className="fixed inset-0 z-[150] flex justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={cn(
          'fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300',
          visible ? 'opacity-100' : 'opacity-0',
        )}
      />

      {/* Drawer Container */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'relative z-10 flex h-full w-full flex-col border-l border-line bg-[#FAF7F2] shadow-2xl transition-transform duration-300 ease-out',
          SIZE_CLASSES[size],
          visible ? 'translate-x-0' : 'translate-x-full',
          className,
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line bg-white px-6 py-4">
          <div className="min-w-0 flex-1">
            {typeof title === 'string' ? (
              <h3 className="font-display text-lg font-medium text-ink">{title}</h3>
            ) : (
              title
            )}
            {subtitle && (
              <div className="mt-0.5 text-xs text-ink-3">{subtitle}</div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <kbd className="hidden rounded border border-line bg-surface-2 px-1.5 py-0.5 font-util text-[0.55rem] text-ink-3 sm:inline">
              ESC
            </kbd>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink"
              aria-label="Close drawer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>

        {/* Optional Footer */}
        {footer && (
          <div className="border-t border-line bg-white px-6 py-3.5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  id?: string;
  ariaLabel?: string;
  className?: string;
  /** Extra classes for the trigger button (width, radius, sizing overrides). */
  triggerClassName?: string;
  /** Width of each option row. */
  size?: 'sm' | 'md';
  /** Which edge of the trigger the panel aligns to. */
  align?: 'left' | 'right';
  disabled?: boolean;
}

/**
 * Accessible, brand-styled custom dropdown.
 * - Animated open (fade + lift + scale)
 * - Keyboard navigation (↑/↓ to move, Enter to select, Esc/Tab to close)
 * - Click-outside + Escape close
 * - Selected option highlighted with a gold check
 */
export function Select({
  value,
  onChange,
  options,
  placeholder,
  id,
  ariaLabel,
  className,
  triggerClassName,
  size = 'md',
  align = 'left',
  disabled,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const autoId = useId();
  const buttonId = id ?? autoId;
  const listId = `${buttonId}-listbox`;

  const selected = options.find((o) => o.value === value);

  // Close on click-outside / Escape.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // Seed the active row at the current selection when opening.
  useEffect(() => {
    if (open) setActiveIndex(Math.max(0, options.findIndex((o) => o.value === value)));
  }, [open, options, value]);

  // Keep the active row scrolled into view.
  useEffect(() => {
    if (!open || activeIndex < 0) return;
    const el = listRef.current?.children[activeIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, open]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, options.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const opt = options[activeIndex];
      if (opt) {
        onChange(opt.value);
        setOpen(false);
      }
    } else if (e.key === 'Tab') {
      setOpen(false);
    }
  };

  const choose = (opt: SelectOption) => {
    onChange(opt.value);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        type="button"
        id={buttonId}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        disabled={disabled}
        onKeyDown={onKeyDown}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={cn(
          'group inline-flex items-center justify-between gap-2 rounded-full border border-line bg-surface/80 font-body text-ink shadow-xs outline-none transition-all duration-200 ease-spring hover:border-gold/70 focus-visible:border-gold focus-visible:ring-2 focus-visible:ring-gold/30 disabled:cursor-not-allowed disabled:opacity-50',
          size === 'sm' ? 'py-2 pl-3.5 pr-2.5 text-[0.82rem] font-medium' : 'py-2.5 pl-4 pr-3 text-sm',
          triggerClassName,
        )}
      >
        <span className={cn('truncate', !selected && 'text-ink-3/70')}>
          {selected ? selected.label : placeholder ?? 'Select…'}
        </span>
        <svg
          className={cn(
            'pointer-events-none h-3.5 w-3.5 shrink-0 text-ink-3 transition-transform duration-200 ease-spring',
            open && 'rotate-180 text-gold-dk',
          )}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-labelledby={buttonId}
          className={cn(
            'animate-dropdown-in absolute z-50 mt-2 max-h-72 min-w-full max-w-[90vw] overflow-auto rounded-2xl border border-line bg-surface p-1.5 shadow-card origin-top',
            align === 'right' ? 'right-0' : 'left-0',
          )}
        >
          {options.map((opt, i) => {
            const isSel = opt.value === value;
            const isActive = i === activeIndex;
            return (
              <li key={opt.value} role="option" aria-selected={isSel} className="list-none">
                <button
                  type="button"
                  onClick={() => choose(opt)}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={cn(
                    'flex w-full items-center justify-between gap-2.5 rounded-xl px-3 py-2 text-left transition-colors duration-150',
                    isSel
                      ? 'bg-gold/10 font-semibold text-gold-dk'
                      : isActive
                        ? 'bg-surface-2 text-ink'
                        : 'text-ink-2 hover:bg-surface-2',
                  )}
                >
                  <span className="truncate text-sm">{opt.label}</span>
                  {isSel && (
                    <svg
                      className="h-3.5 w-3.5 shrink-0 text-gold"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

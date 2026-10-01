'use client';

import { cn } from '@/lib/utils';

/** Inline spinner used inside buttons and small loading areas. */
export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent',
        className,
      )}
      aria-hidden
    />
  );
}

/** Rectangular skeleton placeholder. */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded bg-surface-3/70', className)} />;
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost';
  loading?: boolean;
}

export function Button({ variant = 'primary', loading, className, children, disabled, ...rest }: ButtonProps) {
  return (
    <button
      className={cn(variant === 'primary' ? 'btn-primary' : 'btn-ghost', 'gap-2', className)}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}

export function EmptyState({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-[10px] border border-dashed border-line bg-surface/60 px-6 py-16 text-center">
      <span className="util-label">Nothing here yet</span>
      <p className="font-display-alt text-xl text-ink">{title}</p>
      {hint && <p className="max-w-sm text-sm text-body">{hint}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-[10px] border border-red-200 bg-red-50/60 px-6 py-14 text-center">
      <span className="font-util text-[0.62rem] uppercase tracking-[0.2em] text-red-500">Error</span>
      <p className="max-w-sm text-sm text-ink-2">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-ghost mt-2">
          Try again
        </button>
      )}
    </div>
  );
}

export { Drawer, type DrawerProps } from './Drawer';

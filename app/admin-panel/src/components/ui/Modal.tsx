'use client';

import { useEffect } from 'react';
import { cn } from '@/lib/utils';

/** Accessible centered modal with a scrim. Closes on Escape + backdrop click. */
export function Modal({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[rgba(28,20,16,.35)] backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'relative z-10 w-full max-w-md rounded-[10px] border border-line bg-surface p-6 shadow-card',
          className,
        )}
      >
        {title && <h3 className="mb-4 font-display text-xl text-ink">{title}</h3>}
        {children}
      </div>
    </div>
  );
}

/** Confirmation dialog for destructive actions. */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  onConfirm,
  onCancel,
  loading,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <p className="text-sm text-body">{message}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button className="btn-ghost" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
        <button className="btn-primary" onClick={onConfirm} disabled={loading}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

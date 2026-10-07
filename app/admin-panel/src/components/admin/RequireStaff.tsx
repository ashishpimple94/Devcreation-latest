'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Spinner } from '@/components/ui';

/**
 * Client-side guard for the admin panel. Redirects non-staff away. The backend
 * admin APIs enforce authorization independently — this is only UX.
 */
export function RequireStaff({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const status = useAuthStore((s) => s.status);
  const isStaff = useAuthStore((s) => s.isStaff);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/');
    } else if (status === 'authenticated' && !isStaff()) {
      // Signed-in customer with no admin rights — send them back to sign in.
      router.replace('/');
    }
  }, [status, isStaff, router]);

  if (status !== 'authenticated' || !isStaff()) {
    const message =
      status === 'unauthenticated'
        ? 'Redirecting to login…'
        : status === 'authenticated' && !isStaff()
          ? 'This area is for staff only. Redirecting…'
          : 'Checking your session…';
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f7f5f0]">
        <Spinner className="text-gold" />
        <p className="font-util text-[0.65rem] uppercase tracking-[0.16em] text-ink-3">{message}</p>
      </div>
    );
  }
  return <>{children}</>;
}

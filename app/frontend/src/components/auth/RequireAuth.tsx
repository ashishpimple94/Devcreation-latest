'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Spinner } from '@/components/ui';

/** Client-side guard for customer account pages. Backend APIs are the real gate. */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const status = useAuthStore((s) => s.status);

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login?redirect=/account/profile');
  }, [status, router]);

  if (status !== 'authenticated') {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner className="text-gold" />
      </div>
    );
  }
  return <>{children}</>;
}

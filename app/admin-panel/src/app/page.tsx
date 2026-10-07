'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import AdminLoginPage from '@/app/login/page';

export default function RootPage() {
  const router = useRouter();
  const status = useAuthStore((s) => s.status);
  const isStaff = useAuthStore((s) => s.isStaff);

  useEffect(() => {
    if (status === 'authenticated' && isStaff()) {
      router.replace('/dashboard');
    }
  }, [status, isStaff, router]);

  return <AdminLoginPage />;
}

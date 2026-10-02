'use client';

import { useEffect } from 'react';
import { ToastProvider } from '@/components/ui/Toast';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import { useSocket } from '@/hooks/useSocket';

/** Bootstraps auth session + notifications and keeps the socket alive. */
function Bootstrap({ children }: { children: React.ReactNode }) {
  const init = useAuthStore((s) => s.init);
  const status = useAuthStore((s) => s.status);
  const refreshNotifications = useNotificationStore((s) => s.refresh);

  // Restore session & pre-warm backend to eliminate cold starts.
  useEffect(() => {
    void init();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://devcreation1.onrender.com/api';
    fetch(`${apiUrl}/health`, { method: 'GET' }).catch(() => {});
  }, [init]);

  useEffect(() => {
    if (status === 'authenticated') void refreshNotifications();
  }, [status, refreshNotifications]);

  useSocket();

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <Bootstrap>{children}</Bootstrap>
    </ToastProvider>
  );
}
